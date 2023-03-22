import { constants, utils } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';

import { Fees } from '../utils/types';
import {
  Staking,
  Fish__factory,
  Staking__factory,
  TimelockMock__factory,
  StakingProxy__factory,
  GovernorAlpha__factory,
  VestingRegistry__factory,
  FeeSharingProxy__factory,
  VestingLogic__factory,
  VestingFactory__factory,
  MassetV3__factory,
  BasketManagerV3__factory,
  MockERC20__factory,
  MassetV3,
  Token__factory,
  FeesManager__factory,
  FeesVault__factory,
} from '../../generated/types';
import { TIMELOCK_DELAY, ZERO_ADDRESS } from '../utils/constants';

export const deployStaking = async (
  tokenAddress: string,
  deployer: JsonRpcSigner
) => {
  const stakingLogic = await new Staking__factory(deployer).deploy();
  const stakingProxy = await new StakingProxy__factory(deployer).deploy(
    tokenAddress
  );

  await stakingProxy.setImplementation(stakingLogic.address);

  const staking = Staking__factory.connect(stakingProxy.address, deployer);

  return staking;
};

export const deployVesting = async (
  tokenAddress: string,
  staking: Staking,
  multisigAddress: string,
  deployer: JsonRpcSigner
) => {
  const feeSharingProxy = await new FeeSharingProxy__factory(deployer).deploy(
    constants.AddressZero,
    staking.address
  );

  await staking.setFeeSharing(feeSharingProxy.address);

  const vestingLogic = await new VestingLogic__factory(deployer).deploy();

  const vestingFactory = await new VestingFactory__factory(deployer).deploy(
    vestingLogic.address
  );

  const vestingRegistry = await new VestingRegistry__factory(deployer).deploy(
    vestingFactory.address,
    tokenAddress,
    staking.address,
    feeSharingProxy.address,
    multisigAddress
  );

  vestingFactory.transferOwnership(vestingRegistry.address);

  return vestingRegistry;
};

export const deployMasset = async (deployer: JsonRpcSigner) =>
  await new MassetV3__factory(deployer).deploy();

export const deployfishToken = async (deployer: JsonRpcSigner) => {
  const initialFishAmount = utils.parseEther('100');

  const fishToken = await new Fish__factory(deployer).deploy(initialFishAmount);
  const fishTokenOwner = await fishToken.owner();

  return { fishToken, fishTokenOwner };
};

export const deployXusd = async (masset: MassetV3, deployer: JsonRpcSigner) => {
  const mockXusd = await new Token__factory(deployer).deploy(
    'MockXusd',
    'mx',
    18
  );
  await mockXusd.transferOwnership(masset.address);
  return mockXusd;
};

export const initMassetV3 = async (
  masset: MassetV3,
  deployer: JsonRpcSigner,
  basketManagerAddress: string,
  mockXusdAddress: string,
  fees: Fees
) => {
  const feesManager = await new FeesManager__factory(deployer).deploy();
  const vault = await new FeesVault__factory(deployer).deploy();

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
    vault.address,
    feesManager.address
  );
};

export const deployBasketManager = async (
  masset: MassetV3,
  deployer: JsonRpcSigner,
  factor = 100,
  bridge = ZERO_ADDRESS
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

  return { basketManager, mockToken };
};

export const prepareGovernor = async (
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

  return [governor, timelockMock] as const;
};
