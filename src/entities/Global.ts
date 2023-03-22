import { BigDecimal } from '@graphprotocol/graph-ts';
import { Global } from '../../generated/schema';

export function getGlobal(): Global {
  let global = Global.load('only');
  if (global == null) {
    global = new Global('only');
    global.xusdSupply = BigDecimal.fromString('0');
    global.save();
  }
  return global as Global;
}
