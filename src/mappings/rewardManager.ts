import { RewardManager, onFactorChanged, onTargetWeightChanged, onGlobalMaxPenaltyChanged, onGlobalMaxRewardChanged } from '../../generated/RewardManager/RewardManager';
import { toggleTargetWeightBAsset } from '../entities/BAsset';
import { Global, RewardManagerXusdTransaction } from '../../generated/schema';
import { Transfer } from '../../generated/MassetV3/ERC20';
import { getGlobal,getRewardManager } from '../entities/Global';
import { rewardManagerAddress } from '../utils/bAssets';

export function handleOnTargetWeightChanged(event: onTargetWeightChanged): void {
  toggleTargetWeightBAsset(event.params.token);
}

export function handleOnFactorChanged(event: onFactorChanged): void {
  let globalRM = Global.load('only');
  if (globalRM !== null) {
    globalRM.RMFactor = event.params.newFactor;
    globalRM.save();
   }
}

export function handleOnGlobalMaxPenaltyChanged(event: onGlobalMaxPenaltyChanged): void {
  let globalRM = Global.load('only');
  if (globalRM !== null) {
    globalRM.RMGlobalMaxPenalty = event.params.newMax;
    globalRM.save();
  }
}

export function handleOnGlobalMaxRewardChanged(event: onGlobalMaxRewardChanged): void {
  let globalRM = Global.load('only');
  if (globalRM !== null) {
    globalRM.RMGlobalMaxReward = event.params.newMax;
    globalRM.save();
  }
}

export function handleTransfer(event: Transfer): void {
  let tx = new RewardManagerXusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  getGlobal();
  getRewardManager(); //TODO: execute only once

  if (event.params.to.toHex() == rewardManagerAddress.address) {
    tx.event = 'Reward';
    tx.amount = event.params.value;
    tx.date = event.block.timestamp;
    //tx.user = event.params.redeemer;
    tx.txHash = event.transaction.hash;
    tx.receiver = event.params.to;
    tx.save();
  } else if (event.params.from.toHex() == rewardManagerAddress.address) {
    tx.event = 'Penalty';
    tx.amount = event.params.value;
    tx.date = event.block.timestamp;
    //tx.user = event.params.redeemer;
    tx.txHash = event.transaction.hash;
    tx.receiver = event.params.to;
    tx.save();
  }
}
