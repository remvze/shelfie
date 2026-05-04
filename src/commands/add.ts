import type { Command } from 'commander';

import { generateId, getDb, saveDb } from '@/database';
import { printSuccess } from '@/lib/ui';
import type { MediaType, ShelfItem, Status } from '@/types';
import {
  clamp,
  isMediaType,
  isStatus,
  normalizeTags,
  nowIso,
  parseInteger,
  printInvalidOption,
} from '@/lib/utils';

export const registerAddCommand = (program: Command) => {
  program
    .command('add <title>')
    .alias('a')
    .alias('new')
    .description('Add a new item to the shelf')
    .option('-t, --type <type>', 'Type of media (book, movie, game, etc)', 'book')
    .option(
      '-s, --status <status>',
      'Initial status (todo, active, done)',
      'todo',
    )
    .option('-p, --priority <number>', 'Priority 1-3', '1')
    .option('--tag <tags...>', 'Tags for the item')
    .action(async (title, options) => {
      const type = String(options.type);
      const status = String(options.status);
      const priority = clamp(parseInteger(String(options.priority), 1), 1, 3);
      const tags = normalizeTags(options.tag ?? options.tags);

      if (!isMediaType(type)) {
        printInvalidOption('type', type, [
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

      if (!isStatus(status)) {
        printInvalidOption('status', status, ['todo', 'active', 'done', 'dropped']);
        return;
      }

      const db = await getDb();
      const timestamp = nowIso();

      const newItem: ShelfItem = {
        id: generateId(),
        title,
        type: type as MediaType,
        status: status as Status,
        progress: '0%',
        priority,
        tags,
        notes: [],
        addedAt: timestamp,
        startedAt: status === 'active' ? timestamp : undefined,
        finishedAt: status === 'done' ? timestamp : undefined,
      };

      db.data.items.push(newItem);
      await saveDb();

      printSuccess(`Added "${title}" as ${newItem.type}. ID: ${newItem.id}`);
    });
};

