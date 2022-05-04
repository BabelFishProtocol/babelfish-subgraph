import { querySubgraph } from '../utils/graph';

type TransactionsQueryResult = {
  transactions: Array<{
    id: string;
    event: 'Deposit' | 'Withdraw';
    asset: string;
    amount: string;
    date: string;
  }>;
};

/**
 * Query to get the transactions
 */

export const transactionsQuery = async () => {
  const { transactions } = await querySubgraph<TransactionsQueryResult>(`{
    transactions {
      id
      event
      asset
      amount
      date
    }
  }`);

  return transactions;
};
