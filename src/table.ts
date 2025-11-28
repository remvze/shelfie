import Table from 'cli-table3';
import chalk from 'chalk';

import type { ShelfItem } from './types';

export const renderTable = (items: ShelfItem[]) => {
  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('Type'),
      chalk.cyan('Title'),
      chalk.cyan('Status'),
      chalk.cyan('Progress'),
      chalk.cyan('Rating'),
    ],
    colWidths: [6, 10, 20, 10, 15, 8],
  });

  if (items.length === 0) {
    console.log(chalk.yellow('Shelf is empty!'));
    return;
  }

  items.forEach(item => {
    let statusColor = chalk.white;

    if (item.status === 'active') statusColor = chalk.yellow;
    if (item.status === 'done') statusColor = chalk.green;
    if (item.status === 'dropped') statusColor = chalk.gray;

    table.push([
      chalk.dim(item.id),
      item.type,
      item.title,
      statusColor(item.status),
      item.progress || '',
      item.rating ? '★'.repeat(item.rating) : '-',
    ]);
  });

  console.log(table.toString());
};
