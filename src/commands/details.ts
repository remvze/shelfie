import type { Command } from 'commander';

import {
  formatRating,
  formatStatus,
  formatTags,
  printField,
  printHeader,
  printInfo,
} from '@/lib/ui';
import { formatShortDate, getItemOrExit } from '@/lib/utils';

export const registerDetailsCommand = (program: Command) => {
  program
    .command('details <target>')
    .alias('info')
    .description('View full details and timeline of an item')
    .action(async target => {
      const result = await getItemOrExit(target, 'Item not found.');
      if (!result) return;

      const { item } = result;

      printHeader(item.title);
      printField('ID', item.id);
      printField('Type', item.type);
      printField('Status', formatStatus(item.status));
      printField('Progress', item.progress);
      printField('Rating', formatRating(item.rating));
      printField('Tags', formatTags(item.tags));

      printHeader('Timeline');
      printInfo(`Added on ${formatShortDate(item.addedAt)}`);

      if (item.startedAt) {
        printInfo(`Started on ${formatShortDate(item.startedAt)}`);
      }

      if (item.notes.length > 0) {
        for (const note of item.notes) {
          printInfo(note);
        }
      } else {
        printInfo('No logs recorded yet.');
      }

      if (item.finishedAt) {
        printInfo(`Finished on ${formatShortDate(item.finishedAt)}`);
      }
    });
};

