import type { Command } from 'commander';

import { getDb } from '@/database';
import { printField, printHeader } from '@/lib/ui';

export const registerStatsCommand = (program: Command) => {
  program
    .command('stats')
    .description('Show consumption statistics')
    .action(async () => {
      const db = await getDb();
      const items = db.data.items;

      const doneCount = items.filter(i => i.status === 'done').length;
      const todoCount = items.filter(i => i.status === 'todo').length;
      const activeCount = items.filter(i => i.status === 'active').length;

      const byType = items.reduce(
        (acc, curr) => {
          acc[curr.type] = (acc[curr.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      printHeader('Shelf Stats');
      printField('Total', String(items.length));
      printField('Done', String(doneCount));
      printField('Active', String(activeCount));
      printField('Backlog', String(todoCount));

      printHeader('By Type');
      for (const [type, count] of Object.entries(byType)) {
        printField(type, String(count));
      }
    });
};
