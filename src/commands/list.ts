import type { Command } from 'commander';

import { getDb } from '@/database';
import { printWarning } from '@/lib/ui';
import {
  isMediaType,
  isStatus,
  parseInteger,
  printInvalidOption,
} from '@/lib/utils';
import { renderTable } from '@/table';

export const registerListCommand = (program: Command) => {
  program
    .command('list')
    .alias('ls')
    .description('List items on the shelf')
    .option('-s, --status <status>', 'Filter by status')
    .option('-t, --type <type>', 'Filter by type')
    .option('-l, --limit <number>', 'Limit results', '20')
    .option('--sort <field>', 'Sort by (recent, priority, rating)', 'recent')
    .action(async options => {
      if (options.status && !isStatus(String(options.status))) {
        printInvalidOption('status', String(options.status), [
          'todo',
          'active',
          'done',
          'dropped',
        ]);
        return;
      }

      if (options.type && !isMediaType(String(options.type))) {
        printInvalidOption('type', String(options.type), [
          'book',
          'movie',
          'series',
          'game',
          'audio',
          'article',
          'other',
        ]);
        return;
      }

      const db = await getDb();
      let items = db.data.items;

      if (options.status) {
        items = items.filter(i => i.status === options.status);
      }

      if (options.type) {
        items = items.filter(i => i.type === options.type);
      }

      if (options.sort === 'priority') {
        items.sort((a, b) => b.priority - a.priority);
      } else if (options.sort === 'rating') {
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        items.sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        );
      }

      const limit = Math.max(parseInteger(String(options.limit), 20), 0);
      items = items.slice(0, limit);

      if (
        options.sort !== 'recent' &&
        options.sort !== 'priority' &&
        options.sort !== 'rating'
      ) {
        printWarning(`Unknown sort "${options.sort}". Using "recent" instead.`);
      }

      renderTable(items, 'Shelf Items');
    });
};

