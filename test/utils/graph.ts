import axios from 'axios';
import { inspect } from 'util';
import { render } from 'mustache';
import { writeFile, readFile } from 'fs/promises';

// EVM utils
import { wait } from './time';
import { execAsync } from './bash';
import { getLastBlock } from './evm';
import {
  BuildSubgraphYmlProps,
  StartGraphParams,
  WaitForGraphSyncParams,
} from './types';
import { logger } from './logger';

const subgraphConfigDir = './subgraphConfig';

export const buildSubgraphYaml = async (viewProps: BuildSubgraphYmlProps) => {
  logger.info('Building subgraph manifest...');

  const { subgraphName } = viewProps;

  const subgraphYamlTemplate = await readFile('subgraph.template.yaml', {
    encoding: 'utf8',
  });
  const subgraphYamlOut = render(subgraphYamlTemplate, viewProps);

  await execAsync(`mkdir -p ${subgraphConfigDir}`);

  await writeFile(
    `${subgraphConfigDir}/${subgraphName}-subgraph.yaml`,
    subgraphYamlOut
  );

  logger.info(`${subgraphName}-subgraph.yaml file created!`);
};

export const waitForGraphSync = async ({
  provider,
  targetBlockNumber,
  subgraphName,
}: WaitForGraphSyncParams) => {
  targetBlockNumber =
    targetBlockNumber || (await getLastBlock(provider)).number;

  logger.info(
    `Waiting for subgraph "${subgraphName}" to sync block #${targetBlockNumber}`
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
            indexingStatusForCurrentVersion(subgraphName: "babelfish/${subgraphName}") {
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

      if (
        indexingStatusForCurrentVersion.synced &&
        indexingStatusForCurrentVersion.chains[0].latestBlock.number >=
          targetBlockNumber
      ) {
        logger.info(
          `Subgraph "${subgraphName}" has synced with block #${targetBlockNumber}`
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
export const querySubgraph = async <T>(query: string, subgraphName: string) => {
  const res = await axios.post(
    `http://graph-node-test:8000/subgraphs/name/babelfish/${subgraphName}`,
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

export const startGraph = async ({
  provider,
  subgraphName,
}: StartGraphParams) => {
  logger.info('Creating and deploying subgraph');

  await execAsync(
    `graph codegen ${subgraphConfigDir}/${subgraphName}-subgraph.yaml`
  );
  await execAsync(
    `graph build ${subgraphConfigDir}/${subgraphName}-subgraph.yaml`
  );
  await execAsync(
    `graph create --node http://graph-node-test:8020 babelfish/${subgraphName} ${subgraphConfigDir}/${subgraphName}-subgraph.yaml`
  );
  await execAsync(
    `graph deploy babelfish/${subgraphName} --ipfs http://ipfs-test:5001 --node http://graph-node-test:8020 ${subgraphConfigDir}/${subgraphName}-subgraph.yaml`
  );

  await waitForGraphSync({ provider, subgraphName });
};

export const clearSubgraph = async (subgraphName: string) => {
  await execAsync(
    `graph remove --node http://graph-node-test:8020/ babelfish/${subgraphName}`
  );
};
