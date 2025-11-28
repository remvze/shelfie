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

program
  .command('pick')
  .alias('random')
  .description('Randomly pick an item from your backlog')
  .option('-t, --type <type>', 'Filter by type')
  .option('--tag <tag>', 'Filter by tag')
  .action(async options => {
    const db = await getDb();

    let pool = db.data.items.filter(i => i.status === 'todo');

    if (options.type) {
      pool = pool.filter(i => i.type === options.type);
    }

    if (options.tag) {
      pool = pool.filter(i => i.tags.includes(options.tag));
    }

    if (pool.length === 0) {
      console.log(
        chalk.red('No items found in backlog matching your criteria.'),
      );
    }

    const winner = pool[Math.floor(Math.random() * pool.length)];

    console.log(chalk.magenta(`The Shelf has spoken!\n`));
    console.log(`${chalk.bold.cyan(winner.title)} (${winner.type})`);

    if (winner.priority > 1) {
      console.log(chalk.yellow(`Priority: ${winner.priority}`));
    }

    if (winner.tags.length > 0) {
      console.log(chalk.dim(`Tags: ${winner.tags.join(', ')}`));
    }

    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'start',
        message: 'Do you want to start this now?',
        default: true,
      },
    ]);

    if (answer.start) {
      winner.status = 'active';
      winner.startedAt = new Date().toISOString();

      await saveDb();

      console.log(chalk.green(`▶ Started "${winner.title}"`));
    }
  });

program
  .command('details <target>')
  .alias('info')
  .description('View full details and timeline of an item')
  .action(async target => {
    const db = await getDb();
    const item = findItem(db.data.items, target);

    if (!item) {
      console.log(chalk.red('Item not found'));
      return;
    }

    console.log(chalk.bold.underline(`\n${item.title}`));
    console.log(`ID:       ${chalk.dim(item.id)}`);
    console.log(`Type:     ${item.type}`);
    console.log(`Status:   ${item.status.toUpperCase()}`);
    console.log(`Progress: ${item.progress}`);

    if (item.rating) {
      console.log(`Rating:   ${'★'.repeat(item.rating)}`);
    }

    if (item.tags.length) {
      console.log(`Tags:     ${chalk.blue(item.tags.join(', '))}`);
    }

    console.log(chalk.bold('\nTimeline:'));
    console.log(
      chalk.dim(`• Added on ${new Date(item.addedAt).toLocaleDateString()}`),
    );

    if (item.startedAt) {
      console.log(
        chalk.dim(
          `• Started on ${new Date(item.startedAt).toLocaleDateString()}`,
        ),
      );
    }

    if (item.notes && item.notes.length > 0) {
      item.notes.forEach(note => {
        console.log(`  | ${chalk.white(note)}`);
      });
    } else {
      console.log(chalk.dim('  (No logs recorded yet)'));
    }

    if (item.finishedAt) {
      console.log(
        chalk.green(
          `• Finished on ${new Date(item.finishedAt).toLocaleDateString()}`,
        ),
      );
    }

    console.log('');
  });

program
  .command('now')
  .description('Show active items')
  .action(async () => {
    const db = await getDb();
    const items = db.data.items.filter(i => i.status === 'active');

    renderTable(items);
  });

program
  .command('next')
  .description('Show high priority todo items')
  .action(async () => {
    const db = await getDb();
    const items = db.data.items
      .filter(i => i.status === 'todo')
      .sort((a, b) => b.priority - a.priority);

    renderTable(items);
  });

export { program };
