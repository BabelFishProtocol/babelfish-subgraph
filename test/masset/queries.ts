import { querySubgraph } from '../utils/graph';

type TransactionsQueryResult = {
  xusdTransactions: Array<{
    id: string;
    event: 'Deposit' | 'Withdraw';
    asset: string;
    amount: string;
    date: string;
    user: string;
  }>;
};

/**
 * Query to get the transactions
 */

export const xusdTransactionsQuery = async () => {
  const { xusdTransactions } = await querySubgraph<TransactionsQueryResult>(`{
    xusdTransactions(orderBy: date) {
      id
      event
      asset
      amount
      date
      user
    }
  }`);

  return xusdTransactions;
};
