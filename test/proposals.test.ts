import dayjs from 'dayjs';
import { constants, utils } from 'ethers';

import { clearSubgraph, setupSystem } from './setup';
import {
  getSigners,
  mineBlock,
  querySubgraph,
  waitForGraphSync,
} from './utils';

const stakeUntilDate = dayjs()
  .add(21, 'days')
  .unix();

afterAll(async () => {
  await clearSubgraph();
});

describe('Proposals', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;

  beforeAll(async () => {
    babelfish = await setupSystem();
  });

  it('properly sync new proposals from both governorAdmin and governorOwner', async () => {
    const {
      provider,
      staking,
      fishToken,
      governorAdmin,
      governorOwner,
      TIMELOCK_DELAY,
    } = babelfish;

    const [deployer, user, user2] = await getSigners(provider);
    const userAddress = await user.getAddress();
    const user2Address = await user2.getAddress();
    const deployerAddress = await deployer.getAddress();

    // ----- stake some fish tokens with delegation for users to gain the required voting power to add proposals -----

    {
      const stakeAmount = utils.parseEther('1');

      await fishToken.connect(deployer).approve(staking.address, stakeAmount);

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

    // ----- add proposal using GovernorAdmin contract

    await (
      await governorAdmin
        .connect(user)
        .propose(
          [constants.AddressZero],
          ['0'],
          ['0x00'],
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

    const { data } = await querySubgraph(`{
      proposals {
        proposalId
        description
        contractAddress
      }
    }`);

    const { proposals } = data as {
      proposals: Array<{
        proposalId: string;
        description: string;
        contractAddress: string;
      }>;
    };

    expect(proposals).toHaveLength(2);

    expect(proposals).toEqual(
      expect.arrayContaining([
        {
          proposalId: '1',
          description: 'test admin proposal',
          contractAddress: governorAdmin.address.toLowerCase(),
        },
        {
          proposalId: '1',
          description: 'test owner proposal',
          contractAddress: governorOwner.address.toLowerCase(),
        },
      ])
    );

    // const adminProposalId = proposals.find(
    //   proposal => (proposal.contractAddress = governorAdmin.address)
    // )?.proposalId as string;

    const ownerProposalId = proposals.find(
      proposal => (proposal.contractAddress = governorOwner.address)
    )?.proposalId as string;

    // ----- vote for proposal added using GovernorOwner -----

    await mineBlock(provider, dayjs().unix() + TIMELOCK_DELAY);

    await (
      await governorOwner.connect(user).castVote(ownerProposalId, true)
    ).wait();

    await (
      await governorOwner.connect(deployer).castVote(ownerProposalId, true)
    ).wait();

    const user2VoteReceipt = await (
      await governorOwner.connect(user2).castVote(ownerProposalId, false)
    ).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: user2VoteReceipt.blockNumber,
    });

    const {
      data: { proposals: proposalsAfterVoting },
    } = await querySubgraph(`{
      proposals(where: { contractAddress: "${governorOwner.address}" }) {
        votes{
          voter
          isPro
        }
        forVotesAmount
        againstVotesAmount
      }
    }`);

    const [proposalWithVotes] = proposalsAfterVoting as Array<{
      votes: Array<{
        isPro: boolean;
        voter: string;
      }>;
      description: string;
      contractAddress: string;
    }>;

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
});
