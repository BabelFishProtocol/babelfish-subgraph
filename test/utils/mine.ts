import { providers } from 'ethers';
import { mineBlock } from './evm';

const run = async () => {
  const provider = new providers.JsonRpcProvider('http://localhost:8545');

  await mineBlock(provider, 1);
};

run();
