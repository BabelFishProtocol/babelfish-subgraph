import { utils } from 'ethers';

import { clearSubgraph, prepareTest, setupSystem } from '../setup';
import { transactionsQuery } from './queries';
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

  it('properly detect transactions', async () => {
    const { provider, masset, mockToken } = babelfish;

    const sum = utils.parseUnits('1024');

    await mockToken.approve(masset.address, sum);

    const firstTx = await (await masset.mint(mockToken.address, sum)).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: firstTx.blockNumber,
    });

    const transactions = await transactionsQuery();

    expect(transactions).toHaveLength(1);
  });
});
