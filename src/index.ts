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

program
  .command('history')
  .description('Show items that are finished')
  .action(async () => {
    const db = await getDb();
    const items = db.data.items.filter(i => i.status === 'done');

    renderTable(items);
  });

program
  .command('start <target>')
  .alias('s')
  .description('Start consuming an item')
  .action(async target => {
    const db = await getDb();
    const item = findItem(db.data.items, target);

    if (!item) {
      console.log(chalk.red('Item not found.'));
      return;
    }

    if (item.status === 'active') {
      console.log(chalk.yellow('Item is already active.'));
      return;
    }

    item.status = 'active';
    item.startedAt = new Date().toISOString();

    await saveDb();

    console.log(chalk.green(`Started "${item.title}"`));
  });

program
  .command('log <target> <amount> [message...]')
  .description('Log progress on an item')
  .action(async (target, amount, messageArr) => {
    const db = await getDb();
    const item = findItem(db.data.items, target);

    if (!item) {
      console.log(chalk.red('Item not found.'));
      return;
    }

    const note = messageArr ? messageArr.join(' ') : null;

    item.progress = amount;
    item.status = 'active';

    if (note) {
      const date = new Date();
      const timestamp = `${date.getMonth() + 1}/${date.getDate()}`;

      item.notes.push(`[${timestamp}] ${note} (at ${amount})`);
    }

    await saveDb();

    console.log(chalk.green(`Updated "${item.title}": ${amount}`));
  });

program
  .command('finish <target> [rating]')
  .alias('done')
  .alias('f')
  .description('Mark an item as finished')
  .action(async (target, ratingArg) => {
    const db = await getDb();
    const item = findItem(db.data.items, target);

    if (!item) {
      console.log(chalk.red('Item not found.'));
      return;
    }

    let rating = ratingArg
      ? Math.min(Math.max(parseInt(ratingArg), 0), 5)
      : null;

    if (!rating) {
      const answer = await inquirer.prompt([
        {
          type: 'number',
          name: 'rating',
          message: 'How would you rate it? (1-5)',
          validate: val =>
            val && val >= 1 && val <= 5 ? true : '1 to 5 please.',
        },
      ]);

      rating = answer.rating;
    }

    item.status = 'done';
    item.rating = rating || undefined;
    item.progress = '100%';
    item.finishedAt = new Date().toISOString();

    await saveDb();

    console.log(chalk.green(`Finished "${item.title}"! Rated: ${rating}/5`));
  });

program
  .command('edit <target>')
  .description('Edit an item metadata interactively')
  .action(async target => {
    const db = await getDb();
    const item = findItem(db.data.items, target);

    if (!item) {
      console.log(chalk.red('Item not found.'));
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Title:',
        default: item.title,
      },
      {
        type: 'select',
        name: 'type',
        message: 'Type:',
        choices: ['book', 'movie', 'series', 'game', 'article'],
        default: item.type,
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (comma separated):',
        default: item.tags.join(', '),
      },
    ]);

    item.title = answers.title;
    item.type = answers.type;
    item.tags = answers.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    await saveDb();

    console.log(chalk.green(`Updated "${item.title}"`));
  });

program
  .command('rm <target>')
  .alias('del')
  .description('Remove an item')
  .option('-f, --force', 'Skip confirmation')
  .action(async (target, options) => {
    const db = await getDb();
    const item = findItem(db.data.items, target);

    if (!item) {
      console.log(chalk.red('Item not found.'));
      return;
    }

    if (!options.force) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete "${item.title}"?`,
        },
      ]);

      if (!answer.confirm) return;
    }

    db.data.items = db.data.items.filter(i => i.id !== item.id);

    await saveDb();

    console.log(chalk.red(`Deleted "${item.title}"`));
  });

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

    console.log(chalk.bold.underline('\nShelfie Stats\n'));
    console.log(`Total Items:  ${chalk.bold(items.length)}`);
    console.log(`Completed:    ${chalk.green(doneCount)}`);
    console.log(`Active:       ${chalk.yellow(activeCount)}`);
    console.log(`Backlog:      ${chalk.dim(todoCount)}`);

    console.log(chalk.bold('\nBy Type:'));

    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type.padEnd(10)}: ${count}`);
    });

    console.log('');
  });

export { program };
