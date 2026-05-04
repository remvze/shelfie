import { Command } from 'commander';

import pkg from '../package.json';
import { registerCommands } from './commands';

const program = new Command();

program
  .name('shelfie')
  .description('Media consumption tracker.')
  .version(pkg.version);

registerCommands(program);

export { program };
