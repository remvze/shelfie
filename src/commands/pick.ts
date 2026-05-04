import type { Command } from 'commander';
import inquirer from 'inquirer';

import { getDb, saveDb } from '@/database';
import {
  printError,
  printField,
  printHeader,
  printInfo,
  printSuccess,
} from '@/lib/ui';
import { isMediaType, nowIso, printInvalidOption } from '@/lib/utils';

export const registerPickCommand = (program: Command) => {
  program
    .command('pick')
    .alias('random')
    .description('Randomly pick an item from your backlog')
    .option('-t, --type <type>', 'Filter by type')
    .option('--tag <tag>', 'Filter by tag')
    .action(async options => {
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
      let pool = db.data.items.filter(i => i.status === 'todo');

      if (options.type) {
        pool = pool.filter(i => i.type === options.type);
      }

      if (options.tag) {
        pool = pool.filter(i => i.tags.includes(options.tag));
      }

      if (pool.length === 0) {
        printError('No backlog items match your criteria.');
        return;
      }

      const winner = pool[Math.floor(Math.random() * pool.length)];

      printHeader('Random Pick');
      printField('Title', winner.title);
      printField('Type', winner.type);
      printField('Priority', String(winner.priority));
      if (winner.tags.length > 0) {
        printField('Tags', winner.tags.join(', '));
      }

      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'start',
          message: 'Start this now?',
          default: true,
        },
      ]);

      if (!answer.start) {
        printInfo('Kept in backlog.');
        return;
      }

      winner.status = 'active';
      winner.startedAt = nowIso();
      await saveDb();

      printSuccess(`Started "${winner.title}".`);
    });
};

