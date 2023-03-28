import { TokensStaked } from '../../generated/Staking/Staking';
import { StakeEvent, User, VestingContract } from '../../generated/schema';
import { Address } from '@graphprotocol/graph-ts';

export function handleTokensStaked(event: TokensStaked): void {
  let stake = new StakeEvent(
    event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  );

  stake.amount = event.params.amount;
  stake.lockedUntil = event.params.lockedUntil;
  stake.totalStaked = event.params.totalStaked;
  stake.staker = event.params.staker;
  stake.transactionHash = event.transaction.hash;
  stake.blockTimestamp = event.block.timestamp;
  stake.save();

  // if vesting contract exist, staker is an address of vesting or team vesting
  let vestingContract = VestingContract.load(event.params.staker.toHex());
  let owner = event.params.staker;

  if (vestingContract !== null) {
    owner = changetype<Address>(vestingContract.owner);
  }

  let user = User.load(owner.toHex());

  if (user === null) {
    user = new User(owner.toHexString());
    user.allStakes = [];
    user.stakes = [];
    user.vests = [];
  }

  let vestingContracts: string[] = [];
  let vestingContractStakes: string[] = [];
  let stakeEvents: string[] = [];
  let allStakesEvents: string[] = [];

  allStakesEvents = user.allStakes;
  allStakesEvents.push(stake.id);

  user.allStakes = allStakesEvents;

  if (vestingContract !== null) {
    vestingContractStakes = vestingContract.stakes;

    vestingContractStakes.push(stake.id);
    vestingContract.stakes = vestingContractStakes;
    vestingContract.save();

    vestingContracts = user.vests;
    vestingContracts.push(vestingContract.id);
    user.vests = vestingContracts;
  } else {
    stakeEvents = user.stakes;
    stakeEvents.push(stake.id);

    user.stakes = stakeEvents;
  }
  user.address = owner;

  user.save();
}
