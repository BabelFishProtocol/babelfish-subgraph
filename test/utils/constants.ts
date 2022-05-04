import { BigNumber } from 'ethers';
import { Fees } from './types';

// The Graph GraphQL endpoint
export const SUBGRAPH_NAME = 'babelfish/test-graph';
export const GRAPHQL_ENDPOINT = `http://localhost:8000/subgraphs/name/${SUBGRAPH_NAME}`;

// Ganache EVM endpoint
export const EVM_ENDPOINT = 'http://localhost:8545';

// Time constants
export const ONE_MINUTE = 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;

export const FEE_PRECISION = BigNumber.from('10000');

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const standardFees: Fees = {
  deposit: '20',
  depositBridge: '200',
  withdrawal: '300',
  withdrawalBridge: '400',
};
