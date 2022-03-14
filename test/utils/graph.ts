import axios from 'axios'
import Logs from 'node-logs'
import { inspect } from 'util'
import { render } from 'mustache'
import type { providers } from 'ethers'
import { writeFile, readFile } from 'fs/promises'

// EVM utils
import { wait } from './time'
import { execAsync } from './bash'
import { getLastBlock } from './evm'
import { GRAPH_ADMIN_ENDPOINT, SUBGRAPH_NAME, SUBGRAPH_SYNC_SECONDS } from './constants'
import { Networks } from './types'

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
  };
}
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
  provider: providers.JsonRpcProvider
  targetBlockNumber?: number
  subgraphName: string
}

export const waitForGraphSync = async ({ provider, targetBlockNumber, subgraphName }: WaitForGraphSyncParams) => {
  targetBlockNumber = targetBlockNumber || (await getLastBlock(provider)).number
  let isSynced = false

  logger.info(`Waiting for subgraph "${subgraphName}" to sync block #${targetBlockNumber}`)

  while (true) {
    try {
      await wait(100)
      const { data: {
        data: {
          indexingStatusForCurrentVersion
        }
      } } = await axios.post('http://localhost:8030/graphql', {
        query: `{
            indexingStatusForCurrentVersion(subgraphName: "${subgraphName}") {
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
        }`
      })


      if (indexingStatusForCurrentVersion.synced && indexingStatusForCurrentVersion.chains[0].latestBlock.number == targetBlockNumber) {
        logger.info(`Subgraph "${subgraphName}" has synced with block #${targetBlockNumber}`)
        isSynced = true
        break;
      }
    } catch (e) {
      console.error(e)
    }
  }
}



/**
 * Queries a given subgraph
 * @param subgraphName
 * @param query
 * @returns
 */
export async function querySubgraph(subgraphName: string, query: string) {
  const res = await axios.post(
    `http://localhost:8000/subgraphs/name/${subgraphName}`,
    {
      query
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  if (res.data?.data && !res.data?.errors?.length) {
    return res.data
  } else {
    throw new Error(`Query failed: ${inspect(res.data.errors, false, null, true)}`)
  }
}



/**
 * Waits for graph-node to be up after launching docker.
 * @param {number} [timeout=10000] (optional) Time in ms after which error is thrown
 */

export const waitForSubgraphUp =async () => {
  await execAsync('yarn wait-for-healthy')
}

export const startGraph = async (provider: providers.JsonRpcProvider) => {
  logger.info('Creating and deploying subgraph');

  await execAsync('yarn build');
  await execAsync('yarn run create-local');
  await execAsync('yarn deploy-local');

  await waitForGraphSync({
    subgraphName: SUBGRAPH_NAME,
    provider,
  });
};

