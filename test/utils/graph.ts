import axios from 'axios';
import { inspect } from 'util';
import { render } from 'mustache';
import { writeFile, readFile } from 'fs/promises';

// EVM utils
import { wait } from './time';
import { execAsync } from './bash';
import { getLastBlock } from './evm';
// import { SUBGRAPH_NAME } from './constants';
import {
  BuildSubgraphYmlProps,
  StartGraphParams,
  WaitForGraphSyncParams,
} from './types';
import { logger } from './logger';

export const buildSubgraphYaml = async (viewProps: BuildSubgraphYmlProps) => {
  const { subgraphName } = viewProps;

  logger.info('Building subgraph manifest...');

  const subgraphYamlTemplate = await readFile('./subgraph.template.yaml', {
    encoding: 'utf8',
  });
  const subgraphYamlOut = render(subgraphYamlTemplate, viewProps);

  await writeFile(`./${subgraphName}-subgraph.yaml`, subgraphYamlOut);

  logger.info(`${subgraphName}-subgraph.yaml file created!`);

  const data = JSON.stringify({ subgraphName });
  await writeFile('./subgraphName.json', data);
};

export const waitForGraphSync = async ({
  provider,
  targetBlockNumber,
}: WaitForGraphSyncParams) => {
  const data = await readFile('./subgraphName.json')
  const SUBGRAPH_NAME = JSON.parse(data.toString()).subgraphName;

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
            indexingStatusForCurrentVersion(subgraphName: "${SUBGRAPH_NAME}-babelfish/test-graph") {
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
  const data = await readFile('./subgraphName.json')
  const SUBGRAPH_NAME = JSON.parse(data.toString()).subgraphName;

  const res = await axios.post(
    `http://graph-node-test:8000/subgraphs/name/${SUBGRAPH_NAME}-babelfish/test-graph`,
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

  await execAsync('yarn codegen');
  await execAsync('yarn build');
  await execAsync(
    `graph create --node http://graph-node-test:8020 ${subgraphName}-babelfish/test-graph ${subgraphName}-subgraph.yaml`
  );
  await execAsync(
    `graph deploy ${subgraphName}-babelfish/test-graph --ipfs http://ipfs-test:5001 --node http://graph-node-test:8020 ${subgraphName}-subgraph.yaml`
  );

  await waitForGraphSync({ provider });
};

export const clearSubgraph = async () => {
  await execAsync('yarn remove-local');
};
