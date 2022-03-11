import { BigInt } from '@graphprotocol/graph-ts';
import {
  ProposalCreated,
  ProposalQueued,
  VoteCast,
} from '../../generated/GovernorAlpha/GovernorAlpha';
import { Vote, Proposal, ProposalAction } from '../../generated/schema';

export function handleNewProposal(event: ProposalCreated): void {
  let proposal = new Proposal(event.params.id.toHex());

  proposal.description = event.params.description;
  proposal.startBlock = event.params.startBlock;
  proposal.startDate = event.block.timestamp;
  proposal.endBlock = event.params.endBlock;
  proposal.proposer = event.params.proposer;
  proposal.forVotesAmount = new BigInt(0);
  proposal.againstVotesAmount = new BigInt(0);
  proposal.contractAddress = event.address;
  proposal.proposalId = event.params.id;

  let target = event.params.targets.shift() || null;
  let signature = event.params.signatures.shift() || null;

  for (let i = 0; i < event.params.targets.length; i++) {
    if (target != null && signature != null) {
      let proposalAction = new ProposalAction(proposal.id + '_' + i.toString());

      proposalAction.contract = target;
      proposalAction.signature = signature;
      proposalAction.proposal = proposal.id;

      proposalAction.save();

      target = event.params.targets.shift() || null;
      signature = event.params.signatures.shift() || null;
    }
  }

  proposal.save();
}

export function handleProposalQueued(event: ProposalQueued): void {
  let proposal = Proposal.load(event.params.id.toHex());

  if (proposal) {
    proposal.eta = event.params.eta;
    proposal.save();
  }
}

export function handleVoteCast(event: VoteCast): void {
  let proposal = Proposal.load(event.params.proposalId.toHex());

  if (!proposal) {
    return;
  }

  let votesAmount = event.params.votes;
  let voteId = event.transaction.hash.toHex() + '-' + event.logIndex.toString();

  if (event.params.support) {
    proposal.forVotesAmount = proposal.forVotesAmount.plus(votesAmount);
  } else {
    proposal.againstVotesAmount = proposal.againstVotesAmount.plus(votesAmount);
  }
  proposal.save();

  let vote = new Vote(voteId);

  vote.proposal = proposal.id;
  vote.votes = votesAmount;
  vote.txHash = event.transaction.hash;
  vote.voter = event.params.voter;
  vote.isPro = event.params.support;

  vote.save();
}
