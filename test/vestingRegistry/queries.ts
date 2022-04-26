import { querySubgraph } from '../utils/graph';
import { Stake } from 'test/stakingHistory/queries';

export type VestingContract = {
  id: string;
  owner: string;
  address: string;
  stakes: Array<Stake>;
  type: string;
};

type VestingContractListQueryResult = {
  vestingContracts: VestingContract;
};

/**
 * Query to get the list of vesting contracts
 */

export const vestingContractsListQuery = async () => {
  const data = await querySubgraph<VestingContractListQueryResult>(`{
    vestingContracts {
      owner
      address
      stakes
      type
    }
  }`);

  return data;
};
