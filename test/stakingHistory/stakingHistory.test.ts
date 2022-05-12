import { utils } from 'ethers';

import { setupSystem } from '../setup';
import { getSigners, getCurrentTimestamp } from '../utils/evm';
import { stakeEventsListQuery, userQuery } from './queries';
import { ONE_DAY } from '../utils/constants';
import { createVesting } from '../utils/helpers';

describe('Staking events', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;
  let testIndex = 0;

  beforeEach(async () => {
    babelfish = await setupSystem({
      subgraphName: `stakingHistory-${testIndex}`,
    });
    testIndex++;
  });

  afterEach(async () => {
    await babelfish.stopSubgraph();
  });

  it('properly sync new stake events', async () => {
    const {
      provider,
      staking,
      fishToken,
      syncSubgraph,
      subgraphName,
    } = babelfish;

    const [deployer, user, user2] = getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    // ----- stake some fish tokens with delegation for users -----

    const stakeAmount1 = utils.parseEther('1');

    await fishToken.connect(deployer).approve(staking.address, stakeAmount1);

    let timestamp = await getCurrentTimestamp(provider);
    const stakeUntilDate1 = timestamp + ONE_DAY * 115;

    const userStake = await (
      await staking
        .connect(deployer)
        .stake(stakeAmount1, stakeUntilDate1, userAddress, userAddress)
    ).wait();

    const userStakeLockDate1 = (
      await staking.timestampToLockDate(stakeUntilDate1)
    ).toString();

    const stakeAmount2 = utils.parseEther('2');

    await fishToken.connect(deployer).approve(staking.address, stakeAmount2);

    timestamp = await getCurrentTimestamp(provider);
    const stakeUntilDate2 = timestamp + ONE_DAY * 121;

    const userStake2 = await (
      await staking
        .connect(deployer)
        .stake(stakeAmount2, stakeUntilDate2, user2Address, user2Address)
    ).wait();

    const userStakeLockDate2 = (
      await staking.timestampToLockDate(stakeUntilDate2)
    ).toString();

    await syncSubgraph({ targetBlockNumber: userStake2.blockNumber });

    const stakeEvents = await stakeEventsListQuery(
      [userAddress, user2Address],
      subgraphName
    );

    expect(stakeEvents).toHaveLength(2);

    expect(stakeEvents).toEqual(
      expect.arrayContaining([
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
        },
      ])
    );
  });
  it('properly sync when there are no stake events', async () => {
    const { provider, syncSubgraph, subgraphName } = babelfish;

    const [user, user2] = getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    await syncSubgraph({ targetBlockNumber: await provider.getBlockNumber() });

    const stakeEvents = await stakeEventsListQuery(
      [userAddress, user2Address],
      subgraphName
    );

    expect(stakeEvents).toHaveLength(0);
  });
});

describe('Users', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;
  let testIndex = 0;

  beforeEach(async () => {
    babelfish = await setupSystem({
      subgraphName: `stakingHistoryUsers-${testIndex}`,
    });
    testIndex++;
  });

  it('properly sync user stake events and filter vesting onces', async () => {
    const {
      provider,
      staking,
      vesting,
      fishToken,
      syncSubgraph,
      subgraphName,
    } = babelfish;

    const [deployer, user, user2] = getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    // ----- stake some fish tokens and vestings -----

    const stakeAmount1 = utils.parseEther('1');

    await fishToken.connect(deployer).approve(staking.address, stakeAmount1);

    let timestamp = await getCurrentTimestamp(provider);
    const stakeUntilDate1 = timestamp + ONE_DAY * 115;

    const userStake = await (
      await staking
        .connect(deployer)
        .stake(stakeAmount1, stakeUntilDate1, userAddress, userAddress)
    ).wait();

    const userStakeLockDate1 = (
      await staking.timestampToLockDate(stakeUntilDate1)
    ).toString();

    const { vestingAddress } = await createVesting({
      stakeAmount: stakeAmount1,
      deployer,
      userAddress,
      vesting,
    });

    await fishToken.connect(deployer).approve(staking.address, stakeAmount1);

    timestamp = await getCurrentTimestamp(provider);
    const stakeUntilDateVesting = timestamp + ONE_DAY * 121;

    const userStakeVesting = await (
      await staking
        .connect(deployer)
        .stake(
          stakeAmount1,
          stakeUntilDateVesting,
          vestingAddress,
          vestingAddress
        )
    ).wait();

    const userStakeLockDateVesting = (
      await staking.timestampToLockDate(stakeUntilDateVesting)
    ).toString();

    const stakeAmount2 = utils.parseEther('2');

    await fishToken.connect(deployer).approve(staking.address, stakeAmount2);

    timestamp = await getCurrentTimestamp(provider);
    const stakeUntilDate2 = timestamp + ONE_DAY * 121;

    const userStake2 = await (
      await staking
        .connect(deployer)
        .stake(stakeAmount2, stakeUntilDate2, user2Address, user2Address)
    ).wait();

    await syncSubgraph({ targetBlockNumber: userStake2.blockNumber });

    const data = await userQuery(userAddress, subgraphName);

    expect(data.stakes).toHaveLength(1);
    expect(data.vests[0].stakes).toHaveLength(1);
    expect(data.allStakes).toHaveLength(2);
    expect(data.vests[0].stakes).toHaveLength(1);
    expect(data.address).toEqual(data.vests[0].owner);
    expect(data).toMatchObject({
      address: userAddress,
      vests: [
        {
          owner: userAddress,
          address: vestingAddress,
          stakes: [
            {
              amount: stakeAmount1.toString(),
              lockedUntil: userStakeLockDateVesting,
              staker: vestingAddress,
              totalStaked: stakeAmount1.toString(),
              transactionHash: userStakeVesting.transactionHash,
            },
          ],
        },
      ],
      stakes: [
        {
          amount: stakeAmount1.toString(),
          lockedUntil: userStakeLockDate1,
          staker: userAddress,
          totalStaked: stakeAmount1.toString(),
          transactionHash: userStake.transactionHash,
        },
      ],
      allStakes: expect.arrayContaining([
        {
          amount: stakeAmount1.toString(),
          lockedUntil: userStakeLockDateVesting,
          staker: vestingAddress,
          totalStaked: stakeAmount1.toString(),
          transactionHash: userStakeVesting.transactionHash,
        },
        {
          amount: stakeAmount1.toString(),
          lockedUntil: userStakeLockDate1,
          staker: userAddress,
          totalStaked: stakeAmount1.toString(),
          transactionHash: userStake.transactionHash,
        },
      ]),
    });
  });

  it('properly sync when there are no stake events', async () => {
    const { provider, syncSubgraph, subgraphName } = babelfish;

    const [user, user2] = getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    await syncSubgraph({ targetBlockNumber: await provider.getBlockNumber() });

    const stakeEvents = await stakeEventsListQuery(
      [userAddress, user2Address],
      subgraphName
    );

    expect(stakeEvents).toHaveLength(0);
  });
});
