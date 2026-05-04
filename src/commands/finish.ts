import type { Command } from 'commander';
import inquirer from 'inquirer';

import { saveDb } from '@/database';
import { printSuccess } from '@/lib/ui';
import { clamp, getItemOrExit, nowIso, parseInteger } from '@/lib/utils';

export const registerFinishCommand = (program: Command) => {
  program
    .command('finish <target> [rating]')
    .alias('done')
    .alias('f')
    .description('Mark an item as finished')
    .action(async (target, ratingArg) => {
      const result = await getItemOrExit(target);
      if (!result) return;
      const { item } = result;

      let rating = ratingArg ? clamp(parseInteger(ratingArg, 0), 0, 5) : null;

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
      item.finishedAt = nowIso();

      await saveDb();
      printSuccess(`Finished "${item.title}" with rating ${rating}/5.`);
    });
};

