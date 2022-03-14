import { providers } from 'ethers';
import Logs from 'node-logs';

import {
  Staking__factory,
  TimelockMock__factory,
  GovernorAlpha__factory,
} from '../generated/types';

import {
  startGraph,
  EVM_ENDPOINT,
  waitForSubgraphUp,
  buildSubgraphYaml,
  execAsync,
} from './utils';

const logger = new Logs().showInConsole(true);

export const jestBeforeAll = async () => {
  await waitForSubgraphUp();
};

export const jestBeforeEach = async () => {
  // ---- constants -----
  const TIMELOCK_DELAY = 50;

  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT);

  logger.info('Deploying contracts...');

  const deployer = await provider.getSigner(0);
  const deployerAddress = await deployer.getAddress();

  const timelockMock = await new TimelockMock__factory(deployer).deploy(
    deployerAddress,
    TIMELOCK_DELAY
  );

  const staking = await new Staking__factory(deployer).deploy();

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

  await startGraph(provider);

  logger.info('Setup complete!');
};

export const jestAfterEach = async () => {
  await execAsync('yarn remove-local');
};
