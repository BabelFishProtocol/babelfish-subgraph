import { onFactorChanged, onTargetWeightChanged, onGlobalMaxPenaltyChanged, onGlobalMaxRewardChanged } from '../../generated/RewardManager/RewardManager';
import { toggleTargetWeightBAsset } from '../entities/BAsset';
import { RewardManagerXusdTransaction, RewardManager } from '../../generated/schema';
import { Transfer } from '../../generated/MassetV3/ERC20';
import { getGlobal } from '../entities/Global';
import { rewardManagerAddress } from '../utils/bAssets';

export function handleOnTargetWeightChanged(event: onTargetWeightChanged): void {
  toggleTargetWeightBAsset(event.params.token, event.params.newTargetWeight);
}

export function handleOnFactorChanged(event: onFactorChanged): void {
  let rw = RewardManager.load('rw');
  if (rw === null) {
    rw = new RewardManager('rw'); 
  }

  if (rw !== null) {
    rw.factor = event.params.newFactor;
    rw.save();
  }
}

export function handleOnGlobalMaxPenaltyChanged(event: onGlobalMaxPenaltyChanged): void {
  let rw = RewardManager.load('rw');
  if (rw === null) {
    rw = new RewardManager('rw'); 
  }

  if (rw !== null) {
    rw.globalMaxPenalty = event.params.newMax;
    rw.save();
  }
}

export function handleOnGlobalMaxRewardChanged(event: onGlobalMaxRewardChanged): void {
  let rw = RewardManager.load('rw');
  if (rw === null) {
    rw = new RewardManager('rw');
  }

  if (rw !== null) {
    rw.globalMaxReward = event.params.newMax;
    rw.save();
  }
}

export function handleRMTransfer(event: Transfer): void {
  let tx = new RewardManagerXusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  getGlobal();
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
