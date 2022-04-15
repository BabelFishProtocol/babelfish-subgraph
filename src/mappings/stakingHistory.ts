import { TokensStaked } from '../../generated/Staking/Staking';
import { StakeEvent, User, VestingContract } from '../../generated/schema';

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

  if(vestingContract) {
    let owner = vestingContract.owner;
    let user = User.load(
      owner.toHex()
    );

    if(!user) {
      user = new User(
        owner.toHex()
      );
      user.stakes = [] as string[];
      user.vests = [] as string[];
      user.save();
    }
    let vestingEvents: string[] = [];
    let vestingContractStakes: string[] = [];
    let events: string[] = [];

    events = user.stakes as string[];
    events.push(stake.id);

    user.stakes = events;

    vestingEvents = user.vests as string[];
    vestingEvents.push(stake.id);
    user.vests = vestingEvents;
    user.save();

    vestingContractStakes = vestingContract.stakes as string[];

    vestingContractStakes.push(stake.id);
    vestingContract.stakes = vestingContractStakes;
    vestingContract.save();
    user.address = vestingContract.owner;

    user.save();
  } else {
    let user = User.load(
      event.params.staker.toHex()
    );

    if(!user) {
      user = new User(
        event.params.staker.toHex()
      );

      user.stakes = [] as string[];
      user.vests = [] as string[];
    }

    let events: string[] = [];
    if(!user.stakes) {
      user.stakes = [];

      events = [];
    }
    events = user.stakes as string[];
    events.push(stake.id);

    user.stakes = events;

    user.address = event.params.staker;
    user.save();
  }
}
