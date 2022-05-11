export type Networks = 'rskTestnet' | 'rsk' | 'local' | 'mainnet';

export type Fees = Record<
  'deposit' | 'depositBridge' | 'withdrawal' | 'withdrawalBridge',
  string
>;
