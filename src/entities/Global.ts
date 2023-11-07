import { Address } from '@graphprotocol/graph-ts';
import { bassets } from '../utils/bAssets';
import { Global } from '../../generated/schema';
import { toggleTargetWeightBAsset } from './BAsset';

export function getGlobal(): Global {
  let global = Global.load('only');
  if (global == null) {
    global = new Global('only');
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
  for (let i = 0; i < bassets.length; i++) {
    toggleTargetWeightBAsset(
      Address.fromString(bassets[i].address.toLowerCase())
    );
  }
  return global as Global;
}
