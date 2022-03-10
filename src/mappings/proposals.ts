import { TokensStaked } from "../../generated/Staking/Staking";
import { ProposalCreated } from "../../generated/GovernorAlpha/GovernorAlpha";
import { Proposal } from "../../generated/schema";

export function handleNewProposal(event: ProposalCreated): void {
  let proposal = new Proposal(event.params.id.toHex());

  proposal.title = event.params.description;
  proposal.state = "Pending";
  proposal.startBlock = event.params.startBlock;
  proposal.endBlock = event.params.endBlock;
  proposal.save();
}
