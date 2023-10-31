import { onFactorChanged, onTargetWeightChanged, onGlobalMaxPenaltyChanged, onGlobalMaxRewardChanged } from '../../generated/RewardManager/RewardManager';
import { toggleTargetWeightBAsset } from '../entities/BAsset';
import { RewardManager } from '../../generated/schema';

export function handleOnTargetWeightChanged(event: onTargetWeightChanged): void {
  toggleTargetWeightBAsset(event.params.token, event.params.newTargetWeight);
}

export function handleOnFactorChanged(event: onFactorChanged): void {
  // update RewardManager
}

export function handleOnGlobalMaxPenaltyChanged(event: onGlobalMaxPenaltyChanged): void {
  // update RewardManager
}

export function handleOnGlobalMaxRewardChanged(event: onGlobalMaxRewardChanged): void {
  // update RewardManager
}

//TODO: ADD handler for XUSD transfers from and to RewardManager
