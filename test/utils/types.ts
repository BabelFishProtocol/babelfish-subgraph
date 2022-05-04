export type Networks = 'rskTestnet' | 'rsk' | 'local';

export type Fees = Record<
  'deposit' | 'depositBridge' | 'withdrawal' | 'withdrawalBridge',
  string
>;
