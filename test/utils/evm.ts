import { providers } from 'ethers';
import { logger } from './logger';

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
  logger.info(`Increainsg timestamp by ${timestamp}`);
  return provider.send('evm_increaseTime', [timestamp]);
};

export const mineBlock = async (
  provider: providers.JsonRpcProvider,
  timestamp: number
) => {
  return provider.send('evm_mine', [timestamp]);
};

export const mineBlocks = async (
  provider: providers.JsonRpcProvider,
  offset: number
): Promise<void> => {
  logger.info(`Forcing mining ${offset} blocks`);

  for (let i = 0; i < offset; i++) {
    await increaseTime(provider, 1);
  }
};

export const mineBlocksFor = async (
  provider: providers.JsonRpcProvider,
  targetBlockNumber: number | string
) => {
  const currBlockNumber = await provider.getBlockNumber();
  const blocksAmount = Number(targetBlockNumber) - currBlockNumber;

  await mineBlocks(provider, blocksAmount);
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

/**
 * Finds timestamp of current block
 */
export const getCurrentTimestamp = async (provider: providers.Provider) => {
  const { timestamp } = await provider.getBlock('latest');

  return timestamp;
};
