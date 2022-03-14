import Logs from 'node-logs';

import { jestBeforeAll, jestBeforeEach } from './setup';

const logger = new Logs().showInConsole(true);

describe('Proposals', function() {
  beforeAll(async () => {
    await jestBeforeAll();
    await jestBeforeEach();
  });

  beforeEach(async () => {});

  it('test graph sync', async () => {
    console.log('works');
  });
});
