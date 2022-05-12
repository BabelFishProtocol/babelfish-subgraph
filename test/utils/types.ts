import { providers } from 'ethers';

export type Networks = 'rskTestnet' | 'rsk' | 'local' | 'mainnet';

export type Fees = Record<
  'deposit' | 'depositBridge' | 'withdrawal' | 'withdrawalBridge',
  string
>;

export type BuildSubgraphYmlProps = {
  network: Networks;
  subgraphName: string;
  startBlock: number;
  contracts: {
    GovernorAdmin: {
      address: string;
    };
    GovernorOwner: {
      address: string;
    };
    Staking: {
      address: string;
    };
    VestingRegistry: {
      address: string;
    };
    Masset: {
      address: string;
    };
  };
};

export type WaitForGraphSyncParams = {
  provider: providers.JsonRpcProvider;
  targetBlockNumber?: number;
  subgraphName: string;
};

export type StartGraphParams = {
  subgraphName: string;
  provider: providers.JsonRpcProvider;
};

export type SetupSystemParams = {
  subgraphName: string;
};
