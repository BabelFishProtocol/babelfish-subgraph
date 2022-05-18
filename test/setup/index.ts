import { providers } from 'ethers';

import { logger } from '../utils/logger';
import { EVM_ENDPOINT, standardFees } from '../utils/constants';
import {
  buildSubgraphYaml,
  clearSubgraph,
  startGraph,
  waitForGraphSync,
} from '../utils/graph';
import {
  deployBasketManager,
  deployfishToken,
  deployMasset,
  deployStaking,
  deployVesting,
  deployXusd,
  initMassetV3,
  prepareGovernor,
} from './initializeContracts';
import { SetupSystemParams, WaitForGraphSyncParams } from '../utils/types';

let testIndex = 0;

export const setupSystem = async ({ testName }: SetupSystemParams) => {
  const subgraphName = `${testName}-${testIndex}`;

  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT);
  const deployer = provider.getSigner(0);

  logger.info('Deploying contracts...');

  const { fishToken, fishTokenOwner } = await deployfishToken(deployer);

  const masset = await deployMasset(deployer);

  const { basketManager, mockToken } = await deployBasketManager(
    masset,
    deployer
  );

  const mockXusd = await deployXusd(masset, deployer);

  await initMassetV3(
    masset,
    deployer,
    basketManager.address,
    mockXusd.address,
    standardFees
  );

  const staking = await deployStaking(fishToken.address, deployer);

  const vesting = await deployVesting(
    fishToken.address,
    staking,
    fishTokenOwner,
    deployer
  );

  const [governorAdmin, adminTimelock] = await prepareGovernor(
    deployer,
    staking
  );
  const [governorOwner, ownerTimelock] = await prepareGovernor(
    deployer,
    staking
  );

  logger.info('Contracts deployed!');

  await buildSubgraphYaml({
    subgraphName,
    network: 'mainnet',
    startBlock: fishToken.deployTransaction.blockNumber as number,
    contracts: {
      GovernorAdmin: {
        address: governorAdmin.address,
      },
      GovernorOwner: {
        address: governorOwner.address,
      },
      Staking: {
        address: staking.address,
      },
      VestingRegistry: {
        address: vesting.address,
      },
      Masset: {
        address: masset.address,
      },
    },
  });

  await startGraph({ provider, subgraphName });

  logger.info('Setup complete!');

  const syncSubgraph = ({
    targetBlockNumber,
  }: Pick<WaitForGraphSyncParams, 'targetBlockNumber'>) =>
    waitForGraphSync({ provider, subgraphName, targetBlockNumber });

  const stopSubgraph = () => clearSubgraph(subgraphName);

  testIndex++;

  return {
    provider,
    masset,
    mockToken,
    basketManager,
    staking,
    vesting,
    mockXusd,
    fishToken,
    governorAdmin,
    governorOwner,
    adminTimelock,
    ownerTimelock,
    syncSubgraph,
    stopSubgraph,
    subgraphName,
  };
};
