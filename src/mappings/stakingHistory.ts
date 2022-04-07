import { TokensStaked } from '../../generated/Staking/Staking';
import { StakeEvent } from '../../generated/schema';

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
}
