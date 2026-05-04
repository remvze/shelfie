import type { Command } from 'commander';
import inquirer from 'inquirer';

import { saveDb } from '@/database';
import { printSuccess } from '@/lib/ui';
import { getItemOrExit, tagsFromCommaSeparated } from '@/lib/utils';

export const registerEditCommand = (program: Command) => {
  program
    .command('edit <target>')
    .description('Edit an item metadata interactively')
    .action(async target => {
      const result = await getItemOrExit(target);
      if (!result) return;
      const { item } = result;

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
      item.tags = tagsFromCommaSeparated(answers.tags);

      await saveDb();
      printSuccess(`Updated "${item.title}".`);
    });
};

