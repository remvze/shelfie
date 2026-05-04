import Table from 'cli-table3';
import chalk from 'chalk';

import { formatRating, formatStatus, printInfo } from '@/lib/ui';
import type { ShelfItem } from './types';

export const renderTable = (items: ShelfItem[], title?: string) => {
  if (items.length === 0) {
    printInfo('No items to show.');
    return;
  }

  if (title) {
    console.log(chalk.bold.cyan(`\n${title}`));
  }

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('TYPE'),
      chalk.cyan('TITLE'),
      chalk.cyan('STATUS'),
      chalk.cyan('PROGRESS'),
      chalk.cyan('RATING'),
    ],
    colWidths: [6, 10, 28, 12, 16, 8],
    wordWrap: true,
  });

  for (const item of items) {
    table.push([
      chalk.dim(item.id),
      item.type,
      chalk.white(item.title),
      formatStatus(item.status),
      item.progress || '-',
      formatRating(item.rating),
    ]);
  }

  console.log(table.toString());
};

