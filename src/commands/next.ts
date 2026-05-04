import type { Command } from 'commander';

import { getDb } from '@/database';
import { renderTable } from '@/table';

export const registerNextCommand = (program: Command) => {
  program
    .command('next')
    .description('Show high priority todo items')
    .action(async () => {
      const db = await getDb();
      const items = db.data.items
        .filter(i => i.status === 'todo')
        .sort((a, b) => b.priority - a.priority);

      renderTable(items, 'Next Up');
    });
};

