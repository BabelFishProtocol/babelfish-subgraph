import { JsonRpcSigner } from '@ethersproject/providers';
import { providers, utils } from 'ethers';
import { AbiCoder } from 'ethers/lib/utils';
import Logs from 'node-logs';

import {
  Staking,
  Fish__factory,
  Staking__factory,
  TimelockMock__factory,
  StakingProxy__factory,
  GovernorAlpha__factory,
} from '../generated/types';
import { execAsync } from './utils/bash';
import { EVM_ENDPOINT } from './utils/constants';
import { mineBlock } from './utils/evm';
import { buildSubgraphYaml, startGraph } from './utils/graph';

const logger = new Logs().showInConsole(true);

const TIMELOCK_DELAY = 50;

const deployStaking = async (tokenAddress: string, deployer: JsonRpcSigner) => {
  const stakingLogic = await new Staking__factory(deployer).deploy();
  const stakingProxy = await new StakingProxy__factory(deployer).deploy(
    tokenAddress
  );

  await stakingProxy.setImplementation(stakingLogic.address);

  const staking = Staking__factory.connect(stakingProxy.address, deployer);

  return staking;
};

const prepareGovernor = async (
  provider: providers.JsonRpcProvider,
  deployer: JsonRpcSigner,
  staking: Staking
) => {
  const deployerAddress = await deployer.getAddress();

  const timelockMock = await new TimelockMock__factory(deployer).deploy(
    deployerAddress,
    TIMELOCK_DELAY
  );

  const governor = await new GovernorAlpha__factory(deployer).deploy(
    timelockMock.address,
    staking.address,
    deployerAddress,
    1,
    20
  );

  const currBlock = await provider.getBlock('latest');
  const eta = currBlock.timestamp + TIMELOCK_DELAY + 30;

  const signature = 'setPendingAdmin(address)';
  const encoder = new AbiCoder();
  const abiParameters = encoder.encode(['address'], [governor.address]);

  await timelockMock.queueTransaction(
    timelockMock.address,
    0,
    signature,
    abiParameters,
    eta
  );

  await mineBlock(provider, eta + 10);

  await (
    await timelockMock.executeTransaction(
      timelockMock.address,
      0,
      signature,
      abiParameters,
      eta
    )
  ).wait();

  await (await governor.__acceptAdmin()).wait();

  return [governor, timelockMock] as const;
};

export const setupSystem = async () => {
  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT);

  const deployer = await provider.getSigner(0);

  logger.info('Deploying contracts...');

  const initialTokenAmount = utils.parseEther('100');

  const fishToken = await new Fish__factory(deployer).deploy(
    initialTokenAmount
  );

  const staking = await deployStaking(fishToken.address, deployer);

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
    network: 'local',
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
    adminTimelock,
    ownerTimelock,
    TIMELOCK_DELAY,
  };
};

export const prepareTest = async () => {
  await execAsync('yarn prepare-test');
};

export const clearSubgraph = async () => {
  await execAsync('yarn remove-local');
};
