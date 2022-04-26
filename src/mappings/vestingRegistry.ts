import { VestingCreated } from '../../generated/VestingRegistry/VestingRegistry';
import { VestingContract } from '../../generated/schema';

export function handleVestingCreated(event: VestingCreated): void {
  let vesting = new VestingContract(
    event.params.vesting.toHex()
  );
  vesting.owner = event.params.tokenOwner;
  vesting.address = event.params.vesting;
  vesting.stakes = [];

  vesting.save();
}
