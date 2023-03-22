import { XusdTransaction } from '../../generated/schema';
import { Minted, Redeemed } from '../../generated/MassetV3/MassetV3';
import {
  decrementBAssetBalance,
  incrementBAssetBalance,
} from '../entities/BAsset';

export function handleMinted(event: Minted): void {
  let tx = new XusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  tx.event = 'Deposit';
  tx.asset = 'XUSD';
  tx.amount = event.params.massetQuantity;
  tx.date = event.block.timestamp;
  tx.user = event.params.minter;
  tx.txHash = event.transaction.hash;
  tx.receiver = event.params.recipient;
  incrementBAssetBalance(
    event.params.bAsset,
    event.params.bassetQuantity,
    event
  );
  tx.save();
}

export function handleRedeemed(event: Redeemed): void {
  let tx = new XusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  tx.event = 'Withdraw';
  tx.asset = 'XUSD';
  tx.amount = event.params.massetQuantity;
  tx.date = event.block.timestamp;
  tx.user = event.params.redeemer;
  tx.txHash = event.transaction.hash;
  tx.receiver = event.params.recipient;
  decrementBAssetBalance(event.params.bAsset, event.params.bassetQuantity);

  tx.save();
}
