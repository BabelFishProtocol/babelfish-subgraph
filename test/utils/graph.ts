import axios from 'axios';
import Logs from 'node-logs';
import { inspect } from 'util';
import { render } from 'mustache';
import { providers } from 'ethers';
import { writeFile, readFile } from 'fs/promises';

// EVM utils
import { wait } from './time';
import { execAsync } from './bash';
import { getLastBlock } from './evm';
import { SUBGRAPH_NAME } from './constants';
import { Networks } from './types';

const logger = new Logs().showInConsole(true);

export type BuildSubgraphYmlProps = {
  network: Networks;
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
    Masset: {
      address: string;
    };
  };
};
export const buildSubgraphYaml = async (viewProps: BuildSubgraphYmlProps) => {
  logger.info('Building subgraph manifest...');

  const subgraphYamlTemplate = await readFile('./subgraph.template.yaml', {
    encoding: 'utf8',
  });
  const subgraphYamlOut = render(subgraphYamlTemplate, viewProps);

  await writeFile('./subgraph.yaml', subgraphYamlOut);

  logger.info('subgraph.yaml file created!');
};

type WaitForGraphSyncParams = {
  provider: providers.JsonRpcProvider;
  targetBlockNumber?: number;
};

export const waitForGraphSync = async ({
  provider,
  targetBlockNumber,
}: WaitForGraphSyncParams) => {
  targetBlockNumber =
    targetBlockNumber || (await getLastBlock(provider)).number;

  logger.info(
    `Waiting for subgraph "${SUBGRAPH_NAME}" to sync block #${targetBlockNumber}`
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await wait(1000);
      const {
        data: {
          data: { indexingStatusForCurrentVersion },
        },
      } = await axios.post('http://graph-node-test:8030/graphql', {
        query: `{
            indexingStatusForCurrentVersion(subgraphName: "${SUBGRAPH_NAME}") {
            synced
            chains {
              chainHeadBlock {
                number
              }
              latestBlock {
                number
              }
            }
          }
        }`,
      });

      console.log({ indexingStatusForCurrentVersion });

      if (
        indexingStatusForCurrentVersion.synced &&
        indexingStatusForCurrentVersion.chains[0].latestBlock.number >=
          targetBlockNumber
      ) {
        logger.info(
          `Subgraph "${SUBGRAPH_NAME}" has synced with block #${targetBlockNumber}`
        );
        break;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
};

/**
 * Queries a given subgraph
 * @param query
 * @returns
 */
export const querySubgraph = async <T>(query: string) => {
  const res = await axios.post(
    `http://graph-node-test:8000/subgraphs/name/${SUBGRAPH_NAME}`,
    {
      query,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (res.data?.data && !res.data?.errors?.length) {
    return res.data.data as T;
  } else {
    throw new Error(
      `Query failed: ${inspect(res.data.errors, false, null, true)}`
    );
  }
};

export const startGraph = async (provider: providers.JsonRpcProvider) => {
  logger.info('Creating and deploying subgraph');
  try {
    await execAsync('yarn build');
    await execAsync('yarn run create-local');
    await execAsync('yarn deploy-local');

    await waitForGraphSync({ provider }); // tutaj sie wywalil
  } catch (e) {
    console.log('error in starting suvbgrpaogusdfghjdgfh', e);
  }
};
