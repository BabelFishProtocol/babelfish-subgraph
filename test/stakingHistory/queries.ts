import { mapToGraphqlArrayOfString } from '../utils/graphql-helper';
import { querySubgraph } from '../utils/graph';
import { VestingContract } from 'test/vestingRegistry/queries';

export type Stake = {
  staker: string;
  amount: string;
  lockedUntil: string;
  totalStaked: string;
  transactionHash: string;
}

type StakeEventsListQueryResult = {
  stakeEvents: Array<Stake>;
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



type UserData = {
  id: string;
  address: string;
  stakes: Array<Stake>;
  vests: Array<VestingContract>;
};

type UserQueryResult = {
  user: UserData;
};

// const stakeFragment = gql`fragment stake on Stake {
//   staker
//   amount
//   lockedUntil
//   totalStaked
//   transactionHash
// }`


/**
 * Query to get the user data
 * @param accountAddress - user account addresses
 */

export const userQuery = async (accountAddress: string) => {
  // const addressesToString = mapToGraphqlArrayOfString(addressesList);

  const { user } = await querySubgraph<UserQueryResult>(`{
    user(id: "${accountAddress}") {
      address
      stakes {
        staker
        amount
        lockedUntil
        totalStaked
        transactionHash
      }
      vests {
        address
        owner
        stakes {
          staker
          amount
          lockedUntil
          totalStaked
          transactionHash
        }
      }
    }
  }`);

  return user;
};
