import { Transaction } from '../../generated/schema';
import { Minted, Redeemed } from '../../generated/MassetV3/MassetV3';

export function handleMinted(event: Minted): void {
  let tx = new Transaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  tx.event = 'Deposit';
  tx.asset = 'XUSD';
  tx.amount = event.params.massetQuantity;
  tx.date = event.block.timestamp;

  tx.save();
}

export function handleRedeemed(event: Redeemed): void {
  let tx = new Transaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  tx.event = 'Withdraw';
  tx.asset = 'XUSD';
  tx.amount = event.params.massetQuantity;
  tx.date = event.block.timestamp;

  tx.save();
}
