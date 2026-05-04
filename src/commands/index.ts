import type { Command } from 'commander';

import { registerAddCommand } from './add';
import { registerDetailsCommand } from './details';
import { registerEditCommand } from './edit';
import { registerFinishCommand } from './finish';
import { registerHistoryCommand } from './history';
import { registerListCommand } from './list';
import { registerLogCommand } from './log';
import { registerNextCommand } from './next';
import { registerNowCommand } from './now';
import { registerPickCommand } from './pick';
import { registerRemoveCommand } from './remove';
import { registerStartCommand } from './start';
import { registerStatsCommand } from './stats';

export const registerCommands = (program: Command) => {
  registerAddCommand(program);
  registerListCommand(program);
  registerPickCommand(program);
  registerDetailsCommand(program);
  registerNowCommand(program);
  registerNextCommand(program);
  registerHistoryCommand(program);
  registerStartCommand(program);
  registerLogCommand(program);
  registerFinishCommand(program);
  registerEditCommand(program);
  registerRemoveCommand(program);
  registerStatsCommand(program);
};

