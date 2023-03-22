import {
  VestingCreated,
  TeamVestingCreated,
} from '../../generated/VestingRegistry/VestingRegistry';
import { VestingContract } from '../../generated/schema';

export function handleVestingCreated(event: VestingCreated): void {
  let vesting = new VestingContract(event.params.vesting.toHex());
  vesting.owner = event.params.tokenOwner;
  vesting.address = event.params.vesting;
  vesting.stakes = [];
  vesting.type = 'genesis';
  vesting.save();
}

export function handleTeamVestingCreated(event: TeamVestingCreated): void {
  let vesting = new VestingContract(event.params.vesting.toHex());
  vesting.owner = event.params.tokenOwner;
  vesting.address = event.params.vesting;
  vesting.stakes = [];
  vesting.type = 'team';
  vesting.save();
}
