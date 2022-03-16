import { JsonRpcSigner } from '@ethersproject/providers';
import { providers, utils } from 'ethers';
import Logs from 'node-logs';

import {
  Fish__factory,
  Staking__factory,
  TimelockMock__factory,
  GovernorAlpha__factory,
  StakingProxy__factory,
} from '../generated/types';
import { execAsync } from './utils/bash';
import { EVM_ENDPOINT } from './utils/constants';
import { buildSubgraphYaml, startGraph } from './utils/graph';

const logger = new Logs().showInConsole(true);

const deployStaking = async (tokenAddress: string, deployer: JsonRpcSigner) => {
  const stakingLogic = await new Staking__factory(deployer).deploy();
  const stakingProxy = await new StakingProxy__factory(deployer).deploy(
    tokenAddress
  );

  await stakingProxy.setImplementation(stakingLogic.address);

  const staking = Staking__factory.connect(stakingProxy.address, deployer);

  return staking;
};

export const setupSystem = async () => {
  await execAsync('yarn prepare-test');
  // ---- constants -----
  const TIMELOCK_DELAY = 50;

  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT);

  const deployer = await provider.getSigner(0);
  const deployerAddress = await deployer.getAddress();

  logger.info('Deploying contracts...');

  const timelockMock = await new TimelockMock__factory(deployer).deploy(
    deployerAddress,
    TIMELOCK_DELAY
  );

  const initialTokenAmount = utils.parseEther('100');

  const fishToken = await new Fish__factory(deployer).deploy(
    initialTokenAmount
  );

  const staking = await deployStaking(fishToken.address, deployer);

  const governorAdmin = await new GovernorAlpha__factory(deployer).deploy(
    timelockMock.address,
    staking.address,
    deployerAddress,
    1,
    20
  );
  const governorOwner = await new GovernorAlpha__factory(deployer).deploy(
    timelockMock.address,
    staking.address,
    deployerAddress,
    1,
    20
  );

  logger.info('Contracts deployed!');

  await buildSubgraphYaml({
    network: 'local',
    startBlock: timelockMock.deployTransaction.blockNumber as number,
    contracts: {
      GovernorAdmin: {
        address: governorAdmin.address,
      },
      GovernorOwner: {
        address: governorOwner.address,
      },
    },
  });

  await execAsync('yarn codegen');

  await startGraph(provider);

  logger.info('Setup complete!');

  return {
    provider,
    staking,
    fishToken,
    governorAdmin,
    governorOwner,
    timelockMock,
  };
};

export const clearSubgraph = async () => {
  await execAsync('yarn remove-local');
};
