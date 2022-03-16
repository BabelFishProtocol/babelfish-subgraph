import { exec as execBase } from 'child_process';

/**
 * Wraps `child_process.exec` in a promise
 * @param command
 */
export const execAsync = async (command: string) => {
  return new Promise<string>((resolve, reject) => {
    return execBase(command, (err, stdut) => {
      if (err) {
        return reject(err);
      }

      return resolve(stdut);
    });
  });
};
