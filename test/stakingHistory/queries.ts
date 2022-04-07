import { mapToGraphqlArrayOfString } from '../utils/graphql-helper';
import { querySubgraph } from '../utils/graph';

type StakeEventsListQueryResult = {
  stakeEvents: Array<{
    staker: string;
    amount: string;
    lockedUntil: string;
    totalStaked: string;
    transactionHash: string;
  }>;
};

/**
 * Query to get the list of staking events
 * @param addressesList - list of addresses
 */

export const stakeEventsListQuery = async (addressesList: string[]) => {
  const addressesToString = mapToGraphqlArrayOfString(addressesList);

  const { stakeEvents } = await querySubgraph<StakeEventsListQueryResult>(`{
    stakeEvents(where: { staker_in: ${addressesToString} }) {
      staker
      amount
      lockedUntil
      totalStaked
      transactionHash
    }
  }`);

  return stakeEvents;
};
