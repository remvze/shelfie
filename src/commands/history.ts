import type { Command } from 'commander';

import { getDb } from '@/database';
import { renderTable } from '@/table';

export const registerHistoryCommand = (program: Command) => {
  program
    .command('history')
    .description('Show items that are finished')
    .action(async () => {
      const db = await getDb();
      const items = db.data.items.filter(i => i.status === 'done');

      renderTable(items, 'Completed');
    });
};

