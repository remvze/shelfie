import type { Command } from 'commander';

import { saveDb } from '@/database';
import { printInfo, printSuccess } from '@/lib/ui';
import { getItemOrExit, nowIso } from '@/lib/utils';

export const registerStartCommand = (program: Command) => {
  program
    .command('start <target>')
    .alias('s')
    .description('Start consuming an item')
    .action(async target => {
      const result = await getItemOrExit(target);
      if (!result) return;
      const { item } = result;

      if (item.status === 'active') {
        printInfo('Item is already active.');
        return;
      }

      item.status = 'active';
      item.startedAt = nowIso();
      await saveDb();

      printSuccess(`Started "${item.title}".`);
    });
};

