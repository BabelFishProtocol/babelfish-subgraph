import { BigNumber } from 'ethers';
import { Fees } from './types';

// Ganache EVM endpoint
export const EVM_ENDPOINT = 'http://ganache:8545';

// Time constants
export const ONE_MINUTE = 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const TIMELOCK_DELAY = 50;

export const FEE_PRECISION = BigNumber.from('10000');

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const standardFees: Fees = {
  deposit: '20',
  depositBridge: '200',
  withdrawal: '300',
  withdrawalBridge: '400',
};
