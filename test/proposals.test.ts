import dayjs from 'dayjs';
import Logs from 'node-logs';
import { constants, utils } from 'ethers';

import { clearSubgraph, setupSystem } from './setup';
import { getSigners, querySubgraph, waitForGraphSync } from './utils';

const logger = new Logs().showInConsole(true);

const stakeUntilDate = dayjs()
  .add(21, 'days')
  .unix();

afterAll(async () => {
  await clearSubgraph();
});

describe('Proposals', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;

  beforeAll(async () => {
    // await clearSubgraph();
    babelfish = await setupSystem();
  });

  it('properly sync new proposals from both governorAdmin and governorOwner', async () => {
    const [deployer, user] = await getSigners(babelfish.provider);
    const userAddress = await user.getAddress();

    // ----- stake some fish tokens with delegation for user to gain the required voting power to add proposals -----

    {
      const stakeAmount = utils.parseEther('1');

      await babelfish.fishToken
        .connect(deployer)
        .approve(babelfish.staking.address, stakeAmount);

      await babelfish.staking
        .connect(deployer)
        .stake(stakeAmount, stakeUntilDate, userAddress, userAddress);
    }

    await (
      await babelfish.governorAdmin
        .connect(user)
        .propose(
          [constants.AddressZero],
          ['0'],
          ['0x00'],
          ['0x00'],
          'test admin proposal'
        )
    ).wait();

    const ownerProposalReceipt = await (
      await babelfish.governorOwner
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
      provider: babelfish.provider,
      targetBlockNumber: ownerProposalReceipt.blockNumber,
    });

    const { data } = await querySubgraph(`{
      proposals {
        proposalId
        description
        contractAddress
      }
    }`);

    const { proposals } = data;

    expect(proposals).toHaveLength(2);

    expect(proposals[0]).toEqual({
      description: 'test admin proposal',
      contractAddress: babelfish.governorAdmin.address.toLowerCase(),
    });

    expect(proposals[1].description).toEqual({
      description: 'test owner proposal',
      contractAddress: babelfish.governorOwner.address.toLowerCase(),
    });
  });
});
