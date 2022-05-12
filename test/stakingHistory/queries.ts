import { mapToGraphqlArrayOfString } from '../utils/graphql-helper';
import { querySubgraph } from '../utils/graph';
import { VestingContract } from 'test/vestingRegistry/queries';

export type Stake = {
  staker: string;
  amount: string;
  lockedUntil: string;
  totalStaked: string;
  transactionHash: string;
};

type StakeEventsListQueryResult = {
  stakeEvents: Array<Stake>;
};

const stakeFragment = `
  staker
  amount
  lockedUntil
  totalStaked
  transactionHash
`;

/**
 * Query to get the list of staking events
 * @param addressesList - list of addresses
 */

export const stakeEventsListQuery = async (
  addressesList: string[],
  subgraphName: string
) => {
  const addressesToString = mapToGraphqlArrayOfString(addressesList);

  const { stakeEvents } = await querySubgraph<StakeEventsListQueryResult>(
    `{
    stakeEvents(where: { staker_in: ${addressesToString} }) {
      ${stakeFragment}
    }
  }`,
    subgraphName
  );

  return stakeEvents;
};

type UserData = {
  id: string;
  address: string;
  allStakes: Array<Stake>;
  stakes: Array<Stake>;
  vests: Array<VestingContract>;
};

type UserQueryResult = {
  user: UserData;
};

/**
 * Query to get the user data
 * @param accountAddress - user account addresses
 */
export const userQuery = async (
  accountAddress: string,
  subgraphName: string
) => {
  const { user } = await querySubgraph<UserQueryResult>(
    `{
    user(id: "${accountAddress}") {
      address
      allStakes {
        ${stakeFragment}
      }
      stakes {
        ${stakeFragment}
      }
      vests {
        address
        owner
        stakes {
          ${stakeFragment}
        }
      }
    }
  }`,
    subgraphName
  );

  return user;
};
