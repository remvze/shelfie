import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { getDb, saveDb, generateId, findItem } from './database';
import type { MediaType, Status, ShelfItem } from './types';

import pkg from '../package.json';
import { renderTable } from './table';

const program = new Command();

program
  .name('shelfie')
  .description('Media consumption tracker.')
  .version(pkg.version);

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
    /**
     * TODO: Add validator for the options
     */

    const db = await getDb();

    const newItem: ShelfItem = {
      id: generateId(),
      title: title,
      type: options.type as MediaType,
      status: options.status as Status,
      progress: '0%',
      priority: parseInt(options.priority),
      tags: options.tags || [],
      notes: [],
      addedAt: new Date().toISOString(),
      startedAt:
        options.status === 'active' ? new Date().toISOString() : undefined,
      finishedAt:
        options.status === 'done' ? new Date().toISOString() : undefined,
    };

    db.data.items.push(newItem);

    await saveDb();

    console.log(
      chalk.green(
        `Added "${title}" (${newItem.type}) with ID: ${chalk.bold(newItem.id)}`,
      ),
    );
  });

program
  .command('list')
  .alias('ls')
  .description('List items on the shelf')
  .option('-s, --status <status>', 'Filter by status')
  .option('-t, --type <type>', 'Filter by type')
  .option('-l, --limit <number>', 'Limit results', '20')
  .option('--sort <field>', 'Sort by (recent, priority, rating)', 'recent')
  .action(async options => {
    const db = await getDb();
    let items = db.data.items;

    /**
     * Filtering
     */
    if (options.status) {
      items = items.filter(i => i.status === options.status);
    }

    if (options.type) {
      items = items.filter(i => i.type === options.type);
    }

    /**
     * Sorting
     */
    if (options.sort === 'priority') {
      items.sort((a, b) => b.priority - a.priority);
    } else if (options.sort === 'rating') {
      items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      items.sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      );
    }

    /**
     * Limit:
     */
    items = items.slice(0, parseInt(options.limit));

    renderTable(items);
  });

export { program };
