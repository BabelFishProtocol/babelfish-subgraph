import { providers } from 'ethers';
import Logs from 'node-logs';

const logger = new Logs().showInConsole(true);

/**
 * Gets the first 10 signers
 * @param provider
 */
export const getSigners = (provider: providers.JsonRpcProvider) => {
  const signers: providers.JsonRpcSigner[] = [];

  for (let index = 0; index < 10; index++) {
    signers.push(provider.getSigner(index));
  }

  return signers;
};

/**
 * Advances EVNM block timestamp to a custom one
 */
export const increaseBockTimestamp = (
  provider: providers.JsonRpcProvider,
  timestamp: number
) => {
  logger.info(`Increainsg timestamp to ${timestamp}`);
  return provider.send('evm_increaseTime', [timestamp]);
};

export const mineBlock = async (
  provider: providers.JsonRpcProvider,
  timestamp: number
) => {
  return provider.send('evm_mine', [timestamp]);
};

export const increaseTime = async (
  provider: providers.JsonRpcProvider,
  duration: number
) => {
  provider.send('evm_increaseTime', [duration]);
  provider.send('evm_mine', []);
};

/**
 * Gets the last block from passed provider
 */
export const getLastBlock = async (provider: providers.Provider) => {
  return provider.getBlock(await provider.getBlockNumber());
};
