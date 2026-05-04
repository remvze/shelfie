import type { Command } from 'commander';

import { saveDb } from '@/database';
import { printSuccess } from '@/lib/ui';
import { getItemOrExit } from '@/lib/utils';

export const registerLogCommand = (program: Command) => {
  program
    .command('log <target> <amount> [message...]')
    .description('Log progress on an item')
    .action(async (target, amount, messageArr) => {
      const result = await getItemOrExit(target);
      if (!result) return;
      const { item } = result;

      const note = messageArr ? messageArr.join(' ') : null;

      item.progress = amount;
      item.status = 'active';

      if (note) {
        const date = new Date();
        const timestamp = `${date.getMonth() + 1}/${date.getDate()}`;

        item.notes.push(`[${timestamp}] ${note} (at ${amount})`);
      }

      await saveDb();
      printSuccess(`Updated "${item.title}" -> ${amount}`);
    });
};

