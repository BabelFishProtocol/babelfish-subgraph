import { utils } from 'ethers';

import { clearSubgraph, prepareTest, setupSystem } from '../setup';
import { getSigners } from '../utils/evm';
import { vestingContractsListQuery } from './queries';
import { ONE_DAY } from '../utils/constants';
import { waitForGraphSync } from '../utils/graph';
import { createVesting } from '../utils/helpers';

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
    const { provider, vesting } = babelfish;

    const [deployer, user, user2] = await getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    // ----- create vestings -----

    const stakeAmount1 = utils.parseEther('1');

    const stakeAmount2 = utils.parseEther('2');

    const userVesting1 = await createVesting({
      stakeAmount: stakeAmount1,
      deployer,
      userAddress,
      vesting,
    });

    const userVesting2 = await createVesting({
      stakeAmount: stakeAmount2,
      deployer,
      userAddress: user2Address,
      vesting,
      duration: ONE_DAY * 121,
    });

    await waitForGraphSync({
      provider,
      targetBlockNumber: userVesting2.createdVesting.blockNumber,
    });
    const { vestingContracts } = await vestingContractsListQuery();
    expect(vestingContracts).toHaveLength(2);

    expect(vestingContracts).toEqual(
      expect.arrayContaining([
        {
          address: userVesting1.vestingAddress,
          owner: userAddress,
          type: 'genesis',
        },
        {
          address: userVesting2.vestingAddress,
          owner: user2Address,
          type: 'genesis',
        },
      ])
    );
  });
  it('created only once per user address', async () => {
    const { provider, vesting } = babelfish;

    const [deployer, user] = await getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();

    // ----- create vestings -----

    const stakeAmount1 = utils.parseEther('1');

    const stakeAmount2 = utils.parseEther('2');

    const userVesting1 = await createVesting({
      stakeAmount: stakeAmount1,
      deployer,
      userAddress,
      vesting,
    });

    const userVesting2 = await createVesting({
      stakeAmount: stakeAmount2,
      deployer,
      userAddress,
      vesting,
      duration: ONE_DAY * 121,
    });

    await waitForGraphSync({
      provider,
      targetBlockNumber: userVesting2.createdVesting.blockNumber,
    });
    const { vestingContracts } = await vestingContractsListQuery();
    expect(vestingContracts).toHaveLength(1);

    expect(vestingContracts).toEqual(
      expect.arrayContaining([
        {
          address: userVesting1.vestingAddress,
          owner: userAddress,
        },
      ])
    );
  });
  it('properly sync when there are no created vesting', async () => {
    const { provider } = babelfish;

    await waitForGraphSync({
      provider,
      targetBlockNumber: await provider.getBlockNumber(),
    });
    const vests = await vestingContractsListQuery();

    expect(vests.vestingContracts).toHaveLength(0);
  });
});
