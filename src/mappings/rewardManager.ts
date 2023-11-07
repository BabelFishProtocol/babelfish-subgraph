import { onFactorChanged, onTargetWeightChanged, onGlobalMaxPenaltyChanged, onGlobalMaxRewardChanged } from '../../generated/RewardManager/RewardManager';
import { toggleTargetWeightBAsset } from '../entities/BAsset';
import { RewardManagerXusdTransaction, RewardManager } from '../../generated/schema';
import { RewardManager as RewardManagerContract } from '../../generated/RewardManager/RewardManager';
import { Transfer } from '../../generated/MassetV3/ERC20';
import { getGlobal } from '../entities/Global';
import { rewardManagerAddress } from '../utils/bAssets';

export function handleOnTargetWeightChanged(event: onTargetWeightChanged): void {
  toggleTargetWeightBAsset(event.params.token, event.params.newTargetWeight);
}

export function handleOnFactorChanged(event: onFactorChanged): void {
  let rm = RewardManager.load('rm');
  if (rm === null) {
    rm = new RewardManager('rm'); 
  }

  if (rm !== null) {
    rm.factor = event.params.newFactor;
    rm.save();
  }
}

export function handleOnGlobalMaxPenaltyChanged(event: onGlobalMaxPenaltyChanged): void {
  let rm = RewardManager.load('rm');
  if (rm === null) {
    rm = new RewardManager('rm'); 
  }

  if (rm !== null) {
    rm.globalMaxPenalty = event.params.newMax;
    rm.save();
  }
}

export function handleOnGlobalMaxRewardChanged(event: onGlobalMaxRewardChanged): void {
  let rm = RewardManager.load('rm');
  if (rm === null) {
    rm = new RewardManager('rm');
  }

  if (rm !== null) {
    rm.globalMaxReward = event.params.newMax;
    rm.save();
  }
}

export function handleTransfer(event: Transfer): void {
  let tx = new RewardManagerXusdTransaction(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  getGlobal();
  let rmtw = Global.load('rmtw');
  if (rmtw == null) {
    getRewardManager();
  }
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
