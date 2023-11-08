import { Address } from '@graphprotocol/graph-ts';
import { bassets } from '../utils/bAssets';
import { Global } from '../../generated/schema';
import { createAndReturnBAsset, toggleTargetWeightBAsset } from './BAsset';

export function getGlobal(): Global {
  let global = Global.load('only');
  if (global == null) {
    global = new Global('only');
    global.rewardManagerExecuted = false;
    global.save();
    for (let i = 0; i < bassets.length; i++) {
      createAndReturnBAsset(
        Address.fromString(bassets[i].address.toLowerCase()), bassets[i].symbol
      );
    }
  }
  return global as Global;
}

export function getRewardManager(): Global {
  let global = Global.load('only');
  if (global != null) {
    if (!global.rewardManagerExecuted) {
      for (let i = 0; i < bassets.length; i++) {
        toggleTargetWeightBAsset(
          Address.fromString(bassets[i].address.toLowerCase())
        );
      }
      global.rewardManagerExecuted = true;
      global.save();
    }
  }
  return global as Global;
}
