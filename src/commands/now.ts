import type { Command } from 'commander';

import { getDb } from '@/database';
import { renderTable } from '@/table';

export const registerNowCommand = (program: Command) => {
  program
    .command('now')
    .description('Show active items')
    .action(async () => {
      const db = await getDb();
      const items = db.data.items.filter(i => i.status === 'active');

      renderTable(items, 'Active Now');
    });
};

