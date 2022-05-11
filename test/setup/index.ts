import { providers } from 'ethers';

import { execAsync } from '../utils/bash';
import { logger } from '../utils/logger';
import { EVM_ENDPOINT, standardFees } from '../utils/constants';
import { buildSubgraphYaml, startGraph } from '../utils/graph';
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

export const setupSystem = async () => {
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
    provider,
    deployer,
    staking
  );
  const [governorOwner, ownerTimelock] = await prepareGovernor(
    provider,
    deployer,
    staking
  );

  logger.info('Contracts deployed!');

  await buildSubgraphYaml({
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

  await execAsync('yarn codegen');

  await startGraph(provider);

  logger.info('Setup complete!');

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
  };
};
