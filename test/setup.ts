import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber, providers, utils } from 'ethers';
import { AbiCoder } from 'ethers/lib/utils';
import Logs from 'node-logs';

import {
  Staking,
  Fish__factory,
  Staking__factory,
  TimelockMock__factory,
  StakingProxy__factory,
  GovernorAlpha__factory,
  MassetV3__factory,
  BasketManagerV3__factory,
  MockERC20__factory,
  MassetV3,
  Token__factory,
  FeesManager__factory,
  FeesVault__factory,
} from '../generated/types';
import { execAsync } from './utils/bash';
import { EVM_ENDPOINT, zeroBridges } from './utils/constants';
import { mineBlock } from './utils/evm';
import { buildSubgraphYaml, startGraph } from './utils/graph';
import { Fees } from './utils/types';

const logger = new Logs().showInConsole(true);

const standardFees: Fees = {
  deposit: utils.parseUnits('100'),
  depositBridge: utils.parseUnits('200'),
  withdrawal: utils.parseUnits('300'),
  withdrawalBridge: utils.parseUnits('400'),
};

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

const createXusd = async (masset: MassetV3, deployer: JsonRpcSigner) => {
  const mockXusd = await new Token__factory(deployer).deploy(
    'MockXusd',
    'mx',
    18
  );
  await mockXusd.transferOwnership(masset.address);
  return mockXusd;
};

const initMassetV3 = async (
  masset: MassetV3,
  deployer: JsonRpcSigner,
  basketManagerAddress: string,
  mockXusdAddress: string,
  vaultAddress: string,
  fees: Fees
) => {
  const feesManager = await new FeesManager__factory(deployer).deploy();

  await feesManager.initialize(
    fees.deposit,
    fees.depositBridge,
    fees.withdrawal,
    fees.withdrawalBridge
  );

  await masset.initialize(basketManagerAddress, mockXusdAddress, false);

  await masset.upgradeToV3(
    basketManagerAddress,
    mockXusdAddress,
    vaultAddress,
    feesManager.address
  );
};

const createBasketManager = async (
  masset: MassetV3,
  deployer: JsonRpcSigner,
  factor = 100,
  bridge = zeroBridges
) => {
  const deployerAddress = await deployer.getAddress();

  const mockToken = await new MockERC20__factory(deployer).deploy(
    'mockToken',
    'MT1',
    18,
    deployerAddress,
    10000
  );

  const basset = mockToken.address;

  const mins = 0;
  const maxs = 1000;
  const pauses = false;

  const basketManager = await new BasketManagerV3__factory(deployer).deploy();
  await basketManager.initialize(masset.address);
  await basketManager.addBasset(basset, factor, bridge, mins, maxs, pauses);

  return basketManager;
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

  const deployer = provider.getSigner(0);

  logger.info('Deploying contracts...');

  const initialTokenAmount = utils.parseEther('100');

  const fishToken = await new Fish__factory(deployer).deploy(
    initialTokenAmount
  );

  const masset = await new MassetV3__factory(deployer).deploy();
  const vault = await new FeesVault__factory(deployer).deploy();

  const basketManager = await createBasketManager(masset, deployer);
  const mockXusd = await createXusd(masset, deployer);

  await masset.initialize(basketManager.address, mockXusd.address, false);

  await initMassetV3(
    masset,
    deployer,
    basketManager.address,
    mockXusd.address,
    vault.address,
    standardFees
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
