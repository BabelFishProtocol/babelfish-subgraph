import { RewardManager, onFactorChanged, onTargetWeightChanged, onGlobalMaxPenaltyChanged, onGlobalMaxRewardChanged } from '../../generated/RewardManager/RewardManager';
import { toggleTargetWeightBAsset } from '../entities/BAsset';
import { Global, RewardManagerXusdTransaction } from '../../generated/schema';
import { Transfer } from '../../generated/MassetV3/ERC20';
import { getGlobal,getRewardManager } from '../entities/Global';
import { rewardManagerAddress1, rewardManagerAddress2, rewardManagerAddress3 } from '../utils/bAssets';

export function handleOnTargetWeightChanged(event: onTargetWeightChanged): void {
  toggleTargetWeightBAsset(event.params.token);
}

export function handleOnFactorChanged(event: onFactorChanged): void {
  let globalRM = Global.load('only');
  if (globalRM !== null) {
    globalRM.rewardManagerFactor = event.params.newFactor;
    globalRM.save();
   }
}

export function handleOnGlobalMaxPenaltyChanged(event: onGlobalMaxPenaltyChanged): void {
  let globalRM = Global.load('only');
  if (globalRM !== null) {
    globalRM.rewardManagerGlobalMaxPenalty = event.params.newMax;
    globalRM.save();
  }
}

export function handleOnGlobalMaxRewardChanged(event: onGlobalMaxRewardChanged): void {
  let globalRM = Global.load('only');
  if (globalRM !== null) {
    globalRM.rewardManagerGlobalMaxReward = event.params.newMax;
    globalRM.save();
  }
}

export function handleTransfer(event: Transfer): void {
  let tx = new RewardManagerXusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  getGlobal();
  if (
      event.params.to.toHex() == rewardManagerAddress1.address ||
      event.params.to.toHex() == rewardManagerAddress2.address ||
      event.params.to.toHex() == rewardManagerAddress3.address
    ) {
        getRewardManager();
        tx.event = 'Reward';
        tx.amount = event.params.value;
        tx.date = event.block.timestamp;
        //tx.user = event.params.redeemer;
        tx.txHash = event.transaction.hash;
        tx.receiver = event.params.to;
        tx.save();
  } else if (
      event.params.to.toHex() == rewardManagerAddress1.address ||
      event.params.to.toHex() == rewardManagerAddress2.address ||
      event.params.to.toHex() == rewardManagerAddress3.address
    ) {
        getRewardManager();
        tx.event = 'Penalty';
        tx.amount = event.params.value;
        tx.date = event.block.timestamp;
        //tx.user = event.params.redeemer;
        tx.txHash = event.transaction.hash;
        tx.receiver = event.params.to;
        tx.save();
  }
}
