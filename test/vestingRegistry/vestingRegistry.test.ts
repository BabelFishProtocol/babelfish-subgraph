import { utils } from 'ethers';

import { setupSystem } from '../setup';
import { getSigners } from '../utils/evm';
import { vestingContractsListQuery } from './queries';
import { ONE_DAY } from '../utils/constants';
import { createVesting } from '../utils/helpers';

describe('Vesting Contract', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;

  beforeEach(async () => {
    babelfish = await setupSystem({ testName: `vestingRegistry` });
  });

  afterEach(async () => {
    await babelfish.stopSubgraph();
  });

  it('properly sync', async () => {
    const { provider, vesting, syncSubgraph, subgraphName } = babelfish;

    const [deployer, user, user2] = getSigners(provider);
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

    await syncSubgraph({
      targetBlockNumber: userVesting2.createdVesting.blockNumber,
    });

    const { vestingContracts } = await vestingContractsListQuery(subgraphName);
    expect(vestingContracts).toHaveLength(2);

    expect(vestingContracts).toEqual(
      expect.arrayContaining([
        {
          address: userVesting1.vestingAddress,
          owner: userAddress,
          type: 'genesis',
          stakes: [],
        },
        {
          address: userVesting2.vestingAddress,
          owner: user2Address,
          type: 'genesis',
          stakes: [],
        },
      ])
    );
  });
  it('created only once per user address', async () => {
    const { provider, vesting, syncSubgraph, subgraphName } = babelfish;

    const [deployer, user] = getSigners(provider);
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

    await syncSubgraph({
      targetBlockNumber: userVesting2.createdVesting.blockNumber,
    });

    const { vestingContracts } = await vestingContractsListQuery(subgraphName);
    expect(vestingContracts).toHaveLength(1);

    expect(vestingContracts).toEqual(
      expect.arrayContaining([
        {
          address: userVesting1.vestingAddress,
          owner: userAddress,
          type: 'genesis',
          stakes: [],
        },
      ])
    );
  });
  it('properly sync when there are no created vesting', async () => {
    const { provider, syncSubgraph, subgraphName } = babelfish;

    await syncSubgraph({ targetBlockNumber: await provider.getBlockNumber() });

    const vests = await vestingContractsListQuery(subgraphName);

    expect(vests.vestingContracts).toHaveLength(0);
  });
});
