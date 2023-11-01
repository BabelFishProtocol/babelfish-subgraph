import { onFactorChanged, onTargetWeightChanged, onGlobalMaxPenaltyChanged, onGlobalMaxRewardChanged } from '../../generated/RewardManager/RewardManager';
import { toggleTargetWeightBAsset } from '../entities/BAsset';
import { RewardManagerXusdTransaction, RewardManager } from '../../generated/schema';
import { Transfer } from 'generated/MassetV3/ERC20';
import { getGlobal } from './Global';
import { rewardManagerAddress } from '../utils/bAssets';

export function handleOnTargetWeightChanged(event: onTargetWeightChanged): void {
  toggleTargetWeightBAsset(event.params.token, event.params.newTargetWeight);
}

export function handleOnFactorChanged(event: onFactorChanged): void {
  let rw = RewardManager.load('rw');
  rw.factor = event.params.newFactor;
  rw.save();
}

export function handleOnGlobalMaxPenaltyChanged(event: onGlobalMaxPenaltyChanged): void {
  let rw = RewardManager.load('rw');
  rw.globalMaxPenalty = event.params.newMax;
  rw.save();
}

export function handleOnGlobalMaxRewardChanged(event: onGlobalMaxRewardChanged): void {
  let rw = RewardManager.load('rw');
  rw.globalMaxReward = event.params.newMax;
  rw.save();
}

export function handleRMTransfer(event: Transfer): void {
  let tx = new RewardManagerXusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  getGlobal();
  if (tx.params.to == rewardManagerAddress.address) {
    tx.event = 'Reward';
    tx.amount = event.params.value;
    tx.date = event.block.timestamp;
    //tx.user = event.params.redeemer;
    tx.txHash = event.transaction.hash;
    tx.receiver = event.params.to;
    tx.save();
  } else if (tx.from == rewardManagerAddress.address) {
    tx.event = 'Penalty';
    tx.amount = event.params.value;
    tx.date = event.block.timestamp;
    //tx.user = event.params.redeemer;
    tx.txHash = event.transaction.hash;
    tx.receiver = event.params.to;
    tx.save();
  }
}
