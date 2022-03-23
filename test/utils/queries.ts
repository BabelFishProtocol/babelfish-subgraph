import { querySubgraph } from './graph';

type ProposalsBaseQueryResult = {
  proposals: Array<{ proposalId: string; startDate: string; eta: string }>;
};
/**
 * Query to get base proposal data: proposalId and startDate
 */
export const proposalsBaseQuery = async () => {
  const { proposals } = await querySubgraph<ProposalsBaseQueryResult>(
    `{ proposals { proposalId, startDate, eta } }`
  );

  return proposals;
};

type ProposalsListQueryResult = {
  proposals: Array<{
    proposalId: string;
    description: string;
    contractAddress: string;
    actions: {
      contract: string;
      signature: string;
      calldata: string;
    }[];
  }>;
};

/**
 * Query to get list of proposals with keys: proposalId, description, contractAddress
 */

export const proposalsListQuery = async () => {
  const { proposals } = await querySubgraph<ProposalsListQueryResult>(`{
    proposals {
      proposalId
      description
      contractAddress
      actions {
        contract
        signature
        calldata
      }
    }
  }`);

  return proposals;
};

type ProposalsWithVotesQueryResult = {
  proposals: Array<{
    description: string;
    contractAddress: string;
    votes: { isPro: boolean; voter: string }[];
  }>;
};

/**
 * Query to get proposals list with votes
 * @param governorAddress - address of governor contract
 */
export const proposalsWithVotesListQuery = async (governorAddress: string) => {
  const { proposals } = await querySubgraph<ProposalsWithVotesQueryResult>(`{
  proposals(where: { contractAddress: "${governorAddress}" }) {
    forVotesAmount
    againstVotesAmount
    votes{ voter, isPro }
  }
}`);
  return proposals;
};

type ProposalDetailsQuery = {
  proposals: {
    proposalId: string;
    endBlock: string;
    startDate: string;
    eta: string;
    description: string;
    contractAddress: string;
  }[];
};

/**
 * Query to get proposals list with details
 */
export const proposalsDetailsQuery = async () => {
  const { proposals } = await querySubgraph<ProposalDetailsQuery>(`{
    proposals {
      eta
      endBlock
      startDate
      proposalId
      description
      contractAddress
    }
  }`);

  return proposals;
};
