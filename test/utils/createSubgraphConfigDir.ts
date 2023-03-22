export const subgraphConfigDir = './subgraphConfig';
import { execAsync } from './bash';

export const createSubgraphConfigDir = async () => {
  await execAsync(`mkdir -p ${subgraphConfigDir}`);
}
