import { constants, utils } from 'ethers';

import { clearSubgraph, setupSystem } from '../setup';
import {
  mineBlock,
  getSigners,
  // mineBlocksFor,
  getCurrentTimestamp,
} from '../utils/evm';
import {
  proposalsBaseQuery,
  // proposalsDetailsQuery,
  proposalsListQuery,
  proposalsWithVotesListQuery,
} from './queries';
import { ONE_DAY } from '../utils/constants';
import { waitForGraphSync } from '../utils/graph';

afterAll(async () => {
  await clearSubgraph();
});

describe('Proposals', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;

  beforeEach(async () => {
    babelfish = await setupSystem();
  });

  it('properly sync new proposals from both governorAdmin and governorOwner', async () => {
    const {
      provider,
      staking,
      fishToken,
      governorAdmin,
      governorOwner,
    } = babelfish;

    const [deployer, user] = getSigners(provider);
    const userAddress = await user.getAddress();

    // ----- stake some fish tokens with delegation for users to gain the required voting power to add proposals -----

    {
      const stakeAmount = utils.parseEther('1');

      await fishToken.connect(deployer).approve(staking.address, stakeAmount);

      const timestamp = await getCurrentTimestamp(provider);
      const stakeUntilDate = timestamp + ONE_DAY * 21;

      await staking
        .connect(deployer)
        .stake(stakeAmount, stakeUntilDate, userAddress, userAddress);
    }

    // ----- add proposal using GovernorAdmin contract

    await (
      await governorAdmin
        .connect(user)
        .propose(
          [constants.AddressZero],
          ['0'],
          ['0x01'],
          ['0x00'],
          'test admin proposal'
        )
    ).wait();

    // ----- add proposal using GovernorOwner contract

    const ownerProposalReceipt = await (
      await governorOwner
        .connect(user)
        .propose(
          [constants.AddressZero],
          ['0'],
          ['0x00'],
          ['0x00'],
          'test owner proposal'
        )
    ).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: ownerProposalReceipt.blockNumber,
    });

    const proposals = await proposalsListQuery();

    expect(proposals).toHaveLength(2);

    expect(proposals).toEqual(
      expect.arrayContaining([
        {
          proposalId: '1',
          description: 'test admin proposal',
          contractAddress: governorAdmin.address.toLowerCase(),
          actions: [
            {
              contract: constants.AddressZero,
              signature: '0x01',
              calldata: '0x00',
            },
          ],
        },
        {
          proposalId: '1',
          description: 'test owner proposal',
          contractAddress: governorOwner.address.toLowerCase(),
          actions: [
            {
              contract: constants.AddressZero,
              signature: '0x00',
              calldata: '0x00',
            },
          ],
        },
      ])
    );
  });

  it('properly adds votes data', async () => {
    const {
      provider,
      staking,
      fishToken,
      governorOwner,
      TIMELOCK_DELAY,
    } = babelfish;

    const [deployer, user, user2] = getSigners(provider);
    const userAddress = await user.getAddress();
    const user2Address = await user2.getAddress();
    const deployerAddress = await deployer.getAddress();

    // ----- stake some fish tokens with delegation for users to gain the required voting power to add proposals -----
    {
      const stakeAmount = utils.parseEther('1');

      await fishToken.connect(deployer).approve(staking.address, stakeAmount);

      const timestamp = await getCurrentTimestamp(provider);
      const stakeUntilDate = timestamp + ONE_DAY * 21;

      await staking
        .connect(deployer)
        .stake(
          stakeAmount.div(3),
          stakeUntilDate,
          constants.AddressZero,
          constants.AddressZero
        );

      await staking
        .connect(deployer)
        .stake(stakeAmount.div(3), stakeUntilDate, userAddress, userAddress);

      await staking
        .connect(deployer)
        .stake(stakeAmount.div(3), stakeUntilDate, user2Address, user2Address);
    }

    // ----- add a proposal -----

    const ownerProposalReceipt = await (
      await governorOwner
        .connect(user)
        .propose(
          [constants.AddressZero],
          ['0'],
          ['0x00'],
          ['0x00'],
          'test owner proposal'
        )
    ).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: ownerProposalReceipt.blockNumber,
    });

    const [proposal] = await proposalsBaseQuery();
    const { proposalId, startDate } = proposal;

    // ----- vote for proposal  -----

    await mineBlock(provider, Number(startDate) + TIMELOCK_DELAY);

    await (await governorOwner.connect(user).castVote(proposalId, true)).wait();

    await (
      await governorOwner.connect(deployer).castVote(proposalId, true)
    ).wait();

    const user2VoteReceipt = await (
      await governorOwner.connect(user2).castVote(proposalId, false)
    ).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: user2VoteReceipt.blockNumber,
    });

    const proposalsAfterVoting = await proposalsWithVotesListQuery(
      governorOwner.address
    );

    const [proposalWithVotes] = proposalsAfterVoting;

    const userVotingPower = await staking.getCurrentVotes(userAddress);
    const user2VotingPower = await staking.getCurrentVotes(user2Address);
    const deployerVotingPower = await staking.getCurrentVotes(deployerAddress);

    expect(proposalWithVotes).toEqual({
      forVotesAmount: userVotingPower.add(deployerVotingPower).toString(),
      againstVotesAmount: user2VotingPower.toString(),
      votes: expect.arrayContaining([
        {
          isPro: true,
          voter: userAddress.toLowerCase(),
        },
        {
          isPro: true,
          voter: deployerAddress.toLowerCase(),
        },
        {
          isPro: false,
          voter: user2Address.toLowerCase(),
        },
      ]),
    });
  });

  // it('adds eta when proposal is queued', async () => {
  //   const {
  //     provider,
  //     staking,
  //     fishToken,
  //     governorOwner,
  //     TIMELOCK_DELAY,
  //   } = babelfish;

  //   const [deployer, user] = await getSigners(provider);
  //   const userAddress = await user.getAddress();

  //   // ----- stake some fish tokens with delegation for users to gain the required voting power to add proposals -----

  //   {
  //     const stakeAmount = utils.parseEther('1');

  //     await fishToken.connect(deployer).approve(staking.address, stakeAmount);

  //     const timestamp = await getCurrentTimestamp(provider);

  //     const stakeUntilDate = timestamp + ONE_DAY * 21;

  //     await staking
  //       .connect(deployer)
  //       .stake(stakeAmount, stakeUntilDate, userAddress, userAddress);
  //   }

  //   // ----- add proposal using GovernorOwner contract

  //   const ownerProposalReceipt = await (
  //     await governorOwner
  //       .connect(user)
  //       .propose(
  //         [constants.AddressZero],
  //         ['0'],
  //         ['0x00'],
  //         ['0x00'],
  //         'test owner proposal'
  //       )
  //   ).wait();

  //   await waitForGraphSync({
  //     provider,
  //     targetBlockNumber: ownerProposalReceipt.blockNumber,
  //   });

  //   const [proposal] = await proposalsDetailsQuery();
  //   const { proposalId, endBlock, eta, startDate } = proposal;

  //   // eta should be empty before queue
  //   expect(eta).toBeNull();

  //   await mineBlock(provider, Number(startDate) + TIMELOCK_DELAY);

  //   // ----- cast vote -----

  //   await (await governorOwner.connect(user).castVote(proposalId, true)).wait();

  //   // ----- wait for voting to closed -----

  //   await mineBlocksFor(provider, endBlock);

  //   // ----- queue proposal -----

  //   const queueReceipt = await (
  //     await governorOwner.connect(user).queue(proposalId)
  //   ).wait();

  //   await waitForGraphSync({
  //     provider,
  //     targetBlockNumber: queueReceipt.blockNumber,
  //   });

  //   const [proposalWithEta] = await proposalsBaseQuery();

  //   const currTimestamp = await getCurrentTimestamp(provider);

  //   expect(Number(proposalWithEta.eta)).toBeGreaterThanOrEqual(
  //     currTimestamp + TIMELOCK_DELAY
  //   );
  // });
});
