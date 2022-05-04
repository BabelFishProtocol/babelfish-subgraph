import { utils } from 'ethers';

import { clearSubgraph, prepareTest, setupSystem } from '../setup';
import { getSigners } from '../utils/evm';
import { transactionsQuery } from './queries';
// import { ONE_DAY } from '../utils/constants';
import { waitForGraphSync } from '../utils/graph';

afterAll(async () => {
  await clearSubgraph();
});

beforeAll(async () => {
  await prepareTest();
});

describe('Transactions events', () => {
  let babelfish: Awaited<ReturnType<typeof setupSystem>>;

  beforeEach(async () => {
    babelfish = await setupSystem();
  });

  it('properly detect transactions events', async () => {
    const { provider, masset } = babelfish;

    const [deployer, user, user2] = getSigners(provider);
    const userAddress = (await user.getAddress()).toLowerCase();
    const user2Address = (await user2.getAddress()).toLowerCase();

    // ----- stake some fish tokens with delegation for users -----
    console.log(masset);

    // const stakeAmount1 = utils.parseEther('1');
    const transactions = await transactionsQuery();
    console.log(transactions);
    console.log(userAddress, user2Address, deployer);
  });
});
