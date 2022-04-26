import { utils } from 'ethers';

import { clearSubgraph, prepareTest, setupSystem } from '../setup';
import {
  getSigners,
} from '../utils/evm';
import {
  vestingContractsListQuery
} from './queries';
import { ONE_DAY } from '../utils/constants';
import { waitForGraphSync } from '../utils/graph';

describe('Vesting Contract', () => {
    let babelfish: Awaited<ReturnType<typeof setupSystem>>;

    afterAll(async () => {
      await clearSubgraph();
    });

    beforeAll(async () => {
      await prepareTest();
    });

    beforeEach(async () => {
      babelfish = await setupSystem();
    });

    it('properly sync', async () => {
      const {
        provider,
        vesting,
      } = babelfish;

      const [deployer, user, user2] = await getSigners(provider);
      const userAddress = (await user.getAddress()).toLowerCase();
      const user2Address = (await user2.getAddress()).toLowerCase();

      // ----- create vestings -----

      const stakeAmount1 = utils.parseEther('1');

      const stakeAmount2 = utils.parseEther('2');

      await (await vesting
        .connect(deployer)
        .createVesting(userAddress, stakeAmount1, ONE_DAY, ONE_DAY * 100)).wait();

      const vestingAddress1 = (await vesting.getVesting(userAddress));

      const userVesting2 = await (await vesting
        .connect(deployer)
        .createVesting(user2Address, stakeAmount2, ONE_DAY, ONE_DAY * 121)).wait();

      const vestingAddress2 = (await vesting.getVesting(user2Address));

      await waitForGraphSync({
        provider,
        targetBlockNumber: userVesting2.blockNumber,
      });
      const { vestingContracts } = await vestingContractsListQuery();
      expect(vestingContracts).toHaveLength(2);

      expect(vestingContracts).toEqual(expect.arrayContaining(
        [
          {
            address: vestingAddress1.toLocaleLowerCase(),
            owner: userAddress,
          },
          {
            address: vestingAddress2.toLocaleLowerCase(),
            owner: user2Address,
          },
        ]
      ));
    });
    it('created only once per user address', async () => {
      const {
        provider,
        vesting,
      } = babelfish;

      const [deployer, user] = await getSigners(provider);
      const userAddress = (await user.getAddress()).toLowerCase();

      // ----- create vestings -----

      const stakeAmount1 = utils.parseEther('1');

      const stakeAmount2 = utils.parseEther('2');

      await (await vesting
        .connect(deployer)
        .createVesting(userAddress, stakeAmount1, ONE_DAY, ONE_DAY * 100)).wait();

      const vestingAddress1 = (await vesting.getVesting(userAddress));

      const userVesting2 = await (await vesting
        .connect(deployer)
        .createVesting(userAddress, stakeAmount2, ONE_DAY, ONE_DAY * 121)).wait();

      (await vesting.getVesting(userAddress));


      await waitForGraphSync({
        provider,
        targetBlockNumber: userVesting2.blockNumber,
      });
      const { vestingContracts } = await vestingContractsListQuery();
      expect(vestingContracts).toHaveLength(1);

      expect(vestingContracts).toEqual(expect.arrayContaining(
        [
          {
            address: vestingAddress1.toLocaleLowerCase(),
            owner: userAddress,
          },
        ]
      ));
    });
    it('properly sync when there are no created vesting', async () => {
      const {
        provider,
      } = babelfish;


      await waitForGraphSync({
        provider,
        targetBlockNumber: await provider.getBlockNumber(),
      });
      const vests = await vestingContractsListQuery();

      expect(vests.vestingContracts).toHaveLength(0);
    });
  });