import chalk from 'chalk';

import type { Status } from '@/types';

const STATUS_COLORS: Record<Status, (text: string) => string> = {
  todo: chalk.blue,
  active: chalk.yellow,
  done: chalk.green,
  dropped: chalk.gray,
};

export const formatStatus = (status: Status) => {
  const color = STATUS_COLORS[status] || chalk.white;
  return color(status.toUpperCase());
};

export const formatRating = (rating?: number) =>
  rating ? '*'.repeat(rating) : '-';

export const formatTags = (tags: string[]) =>
  tags.length > 0 ? tags.join(', ') : '-';

export const printSuccess = (message: string) =>
  console.log(chalk.green(`[OK] ${message}`));

export const printError = (message: string) =>
  console.log(chalk.red(`[ERR] ${message}`));

export const printWarning = (message: string) =>
  console.log(chalk.yellow(`[WARN] ${message}`));

export const printInfo = (message: string) =>
  console.log(chalk.cyan(`[INFO] ${message}`));

export const printHeader = (title: string) =>
  console.log(chalk.bold.cyan(`\n${title}`));

export const printField = (label: string, value: string) =>
  console.log(`${chalk.dim(label.padEnd(10))} ${value}`);

