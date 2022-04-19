import { TokensStaked } from '../../generated/Staking/Staking';
import { StakeEvent, User, VestingContract } from '../../generated/schema';
import { Address } from '@graphprotocol/graph-ts';

export function handleTokensStaked(event: TokensStaked): void {
  let stake = new StakeEvent(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );

  stake.amount = event.params.amount;
  stake.lockedUntil = event.params.lockedUntil;
  stake.totalStaked = event.params.totalStaked;
  stake.staker = event.params.staker;
  stake.transactionHash = event.transaction.hash;
  stake.save();

  let vestingContract = VestingContract.load(event.params.staker.toHex());
  let owner = event.params.staker;

  if(vestingContract) {
    owner = vestingContract.owner as Address;
  }

  let user = User.load(
    owner.toHex()
  );

  if(!user) {
    user = new User(
      owner.toHex()
    );
    user.stakes = [] as string[];
    user.vests = [] as string[];
  }

  let vestingEvents: string[] = [];
  let vestingContractStakes: string[] = [];
  let events: string[] = [];

  events = user.stakes as string[];
  events.push(stake.id);

  user.stakes = events;

  if(vestingContract) {
    vestingEvents = user.vests as string[];
    vestingEvents.push(stake.id);
    user.vests = vestingEvents;

    vestingContractStakes = vestingContract.stakes as string[];

    vestingContractStakes.push(stake.id);
    vestingContract.stakes = vestingContractStakes;
    vestingContract.save();
  }
  user.address = owner;

  user.save();
}
