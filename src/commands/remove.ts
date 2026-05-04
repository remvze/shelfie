import type { Command } from 'commander';
import inquirer from 'inquirer';

import { saveDb } from '@/database';
import { printInfo, printSuccess } from '@/lib/ui';
import { getItemOrExit } from '@/lib/utils';

export const registerRemoveCommand = (program: Command) => {
  program
    .command('rm <target>')
    .alias('del')
    .description('Remove an item')
    .option('-f, --force', 'Skip confirmation')
    .action(async (target, options) => {
      const result = await getItemOrExit(target);
      if (!result) return;
      const { db, item } = result;

      if (!options.force) {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Delete "${item.title}"?`,
          },
        ]);

        if (!answer.confirm) {
          printInfo('Delete cancelled.');
          return;
        }
      }

      db.data.items = db.data.items.filter(i => i.id !== item.id);
      await saveDb();

      printSuccess(`Deleted "${item.title}".`);
    });
};

