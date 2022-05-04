import { BigNumber, utils } from 'ethers';

import { clearSubgraph, prepareTest, setupSystem } from '../setup';
import { xusdTransactionsQuery } from './queries';
import { waitForGraphSync } from '../utils/graph';
import { FEE_PRECISION, standardFees } from '../utils/constants';

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

  it('properly detect transactions quantity', async () => {
    const { provider, masset, mockToken } = babelfish;
    const sum = utils.parseUnits('1024');

    await mockToken.approve(masset.address, sum);
    const firstTx = await (await masset.mint(mockToken.address, sum)).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: firstTx.blockNumber,
    });

    await mockToken.approve(masset.address, sum);
    const secondTx = await (await masset.mint(mockToken.address, sum)).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: secondTx.blockNumber,
    });

    const transactions = await xusdTransactionsQuery();
    expect(transactions).toHaveLength(2);
  });

  it('properly detect transaction type', async () => {
    const { provider, masset, mockToken, basketManager, mockXusd } = babelfish;

    const sum = BigNumber.from(123123).pow(BigNumber.from(2));
    const mintFee = sum.mul(standardFees.deposit).div(FEE_PRECISION);

    await mockToken.approve(masset.address, sum);
    const mintTx = await (await masset.mint(mockToken.address, sum)).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: mintTx.blockNumber,
    });

    const calculated = await basketManager.convertBassetToMassetQuantity(
      mockToken.address,
      sum
    );

    let mintedMassets = calculated[0];

    mintedMassets = mintedMassets.sub(mintFee);

    await mockXusd.approve(masset.address, mintedMassets);

    const redeemTx = await (
      await masset.redeem(mockToken.address, mintedMassets)
    ).wait();

    await waitForGraphSync({
      provider,
      targetBlockNumber: redeemTx.blockNumber,
    });

    const transactions = await xusdTransactionsQuery();
    const firstTx = transactions[0];
    const secTx = transactions[1];

    expect(firstTx.event).toBe('Deposit');
    expect(secTx.event).toBe('Withdraw');
  });
});
