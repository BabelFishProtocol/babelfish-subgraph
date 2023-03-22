import { BigNumberish, ContractReceipt } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { VestingRegistry } from 'generated/types';
import { ONE_DAY } from './constants';

type CreateVestingProps = {
  stakeAmount: BigNumberish;
  deployer: JsonRpcSigner;
  userAddress: string;
  vesting: VestingRegistry;
  cliff?: BigNumberish;
  duration?: BigNumberish;
};

type CreateVestingReturn = {
  vestingAddress: string;
  createdVesting: ContractReceipt;
};

export const createVesting = async ({
  stakeAmount,
  deployer,
  userAddress,
  vesting,
  cliff = ONE_DAY,
  duration = ONE_DAY * 100,
}: CreateVestingProps): Promise<CreateVestingReturn> => {
  const createdVesting = await (
    await vesting
      .connect(deployer)
      .createVesting(userAddress, stakeAmount, cliff, duration)
  ).wait();

  const vestingAddress = (await vesting.getVesting(userAddress)).toLowerCase();

  return { vestingAddress, createdVesting };
};
