import {
  Address,
  BigDecimal,
  BigInt,
  ethereum,
  store,
} from '@graphprotocol/graph-ts';
import { BAsset } from '../../generated/schema';
import { ERC20 as ERC20TokenContract } from '../../generated/BasketManagerV3/ERC20';
import { getGlobal } from './Global';
import { decimalize } from '../utils/bigNumber';

export function createAndReturnBAsset(
  tokenAddress: Address,
  event: ethereum.Event
): BAsset {
  let token = BAsset.load(tokenAddress.toHex());
  if (token === null) {
    token = new BAsset(tokenAddress.toHex());
    let tokenContract = ERC20TokenContract.bind(tokenAddress);
    let assetNameResult = tokenContract.try_name();
    if (!assetNameResult.reverted) {
      token.name = assetNameResult.value;
    }
    let tokenSymbolResult = tokenContract.try_symbol();
    if (!tokenSymbolResult.reverted) {
      token.symbol = tokenSymbolResult.value;
    }
    let assetDecimalResult = tokenContract.try_decimals();
    if (!assetDecimalResult.reverted) {
      token.decimals = assetDecimalResult.value;
    }
    token.paused = false;
    token.balance = BigDecimal.fromString('0');
    token.createdAtTx = event.transaction.hash.toHexString();
    let global = getGlobal();
    token.global = global.id;
    token.save();
  }
  return token as BAsset;
}

export function removeBAsset(address: Address): void {
  let bAsset = BAsset.load(address.toHexString());
  if (bAsset !== null) {
    store.remove('BAsset', bAsset.id);
  }
}

export function incrementBAssetBalance(
  address: Address,
  amount: BigInt,
  event: ethereum.Event
): void {
  let bAsset = BAsset.load(address.toHexString());
  if (bAsset !== null) {
    bAsset.balance = bAsset.balance.plus(decimalize(amount));
    bAsset.save();
  } else {
    bAsset = new BAsset(address.toHex());
    let tokenContract = ERC20TokenContract.bind(address);
    let assetNameResult = tokenContract.try_name();
    if (!assetNameResult.reverted) {
      bAsset.name = assetNameResult.value;
    }
    let tokenSymbolResult = tokenContract.try_symbol();
    if (!tokenSymbolResult.reverted) {
      bAsset.symbol = tokenSymbolResult.value;
    }
    let assetDecimalResult = tokenContract.try_decimals();
    if (!assetDecimalResult.reverted) {
      bAsset.decimals = assetDecimalResult.value;
    }
    bAsset.paused = false;
    bAsset.balance = decimalize(amount);
    bAsset.createdAtTx = event.transaction.hash.toHexString();
    let global = getGlobal();
    bAsset.global = global.id;
    bAsset.save();
    global.xusdSupply = global.xusdSupply.plus(decimalize(amount));
    global.save();
  }
}

export function decrementBAssetBalance(address: Address, amount: BigInt): void {
  const bAsset = BAsset.load(address.toHexString());
  if (bAsset !== null) {
    bAsset.balance = bAsset.balance.minus(decimalize(amount));
    bAsset.save();
  }
  let global = getGlobal();
  global.xusdSupply = global.xusdSupply.minus(decimalize(amount));
  global.save();
}

export function togglePauseBAsset(address: Address, isPaused: boolean): void {
  let bAsset = BAsset.load(address.toHexString());
  if (bAsset !== null) {
    bAsset.paused = isPaused;
    bAsset.save();
  }
}
