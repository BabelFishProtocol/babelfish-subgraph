import { utils } from 'ethers';

import { clearSubgraph, prepareTest, setupSystem } from '../setup';
import {
  getSigners,
  getCurrentTimestamp,
} from '../utils/evm';
import {
  stakeEventsListQuery
} from './queries';
import { ONE_DAY } from '../utils/constants';
import { waitForGraphSync } from '../utils/graph';

afterAll(async () => {
  await clearSubgraph();
});

beforeAll(async () => {
  await prepareTest();
});

describe('Staking events', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;

  beforeEach(async () => {
    babelfish = await setupSystem();
  });

  it('properly sync new stake events', async () => {
    const {
      provider,
      staking,
      fishToken,
    } = babelfish;

    const [deployer, user, user2] = await getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    // ----- stake some fish tokens with delegation for users -----

      const stakeAmount1 = utils.parseEther('1');

      await fishToken.connect(deployer).approve(staking.address, stakeAmount1);

      let timestamp = await getCurrentTimestamp(provider);
      const stakeUntilDate1 = timestamp + ONE_DAY * 115;

      const userStake = await (await staking
        .connect(deployer)
        .stake(stakeAmount1, stakeUntilDate1, userAddress, userAddress)).wait();

      const userStakeLockDate1 = (await staking.timestampToLockDate(stakeUntilDate1)).toString();


      const stakeAmount2 = utils.parseEther('2');

      await fishToken.connect(deployer).approve(staking.address, stakeAmount2);

      timestamp = await getCurrentTimestamp(provider);
      const stakeUntilDate2 = timestamp + ONE_DAY * 121;

      const userStake2 = await (await staking
        .connect(deployer)
        .stake(stakeAmount2, stakeUntilDate2, user2Address, user2Address)).wait();

      const userStakeLockDate2 = (await staking.timestampToLockDate(stakeUntilDate2)).toString();



    await waitForGraphSync({
      provider,
      targetBlockNumber: userStake2.blockNumber,
    });
    const stakeEvents = await stakeEventsListQuery([userAddress, user2Address]);

    expect(stakeEvents).toHaveLength(2);

    expect(stakeEvents).toEqual(expect.arrayContaining(
      [
        {
          amount: stakeAmount2.toString(),
          lockedUntil: userStakeLockDate2,
          staker: user2Address,
          totalStaked: stakeAmount2.toString(),
          transactionHash: userStake2.transactionHash,
        },
        {
          amount: stakeAmount1.toString(),
          lockedUntil: userStakeLockDate1,
          staker: userAddress,
          totalStaked: stakeAmount1.toString(),
          transactionHash: userStake.transactionHash,
        }
      ]
    ));
  });
  it('properly sync when there are no stake events', async () => {
    const {
      provider,
    } = babelfish;

    const [user, user2] = await getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    await waitForGraphSync({
      provider,
      targetBlockNumber: await provider.getBlockNumber(),
    });
    const stakeEvents = await stakeEventsListQuery([userAddress, user2Address]);

    expect(stakeEvents).toHaveLength(0);
  });
});
