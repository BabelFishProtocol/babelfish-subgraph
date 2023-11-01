import { XusdTransaction } from '../../generated/schema';
import { Minted, Redeemed } from '../../generated/MassetV3/MassetV3';
import { getGlobal } from '../entities/Global';

export function handleMinted(event: Minted): void {
  let tx = new XusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  getGlobal();

  tx.event = 'Deposit';
  tx.asset = event.params.bAsset;
  tx.amount = event.params.massetQuantity;
  tx.date = event.block.timestamp;
  tx.user = event.params.minter;
  tx.txHash = event.transaction.hash;
  tx.receiver = event.params.recipient;
  tx.save();
}

export function handleRedeemed(event: Redeemed): void {
  let tx = new XusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  getGlobal();

  tx.event = 'Withdraw';
  tx.asset = event.params.bAsset;
  tx.amount = event.params.massetQuantity;
  tx.date = event.block.timestamp;
  tx.user = event.params.redeemer;
  tx.txHash = event.transaction.hash;
  tx.receiver = event.params.recipient;
  tx.save();
}
