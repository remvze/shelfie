import { findItem, getDb } from '@/database';
import type { MediaType, ShelfItem, Status } from '@/types';
import { printError } from './ui';

const MEDIA_TYPES: MediaType[] = [
  'book',
  'movie',
  'series',
  'game',
  'audio',
  'article',
  'other',
];

const STATUSES: Status[] = ['todo', 'active', 'done', 'dropped'];

export const nowIso = () => new Date().toISOString();

export const parseInteger = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isNaN(parsed) ? fallback : parsed;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const isMediaType = (value: string): value is MediaType =>
  MEDIA_TYPES.includes(value as MediaType);

export const isStatus = (value: string): value is Status =>
  STATUSES.includes(value as Status);

export const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map(tag => String(tag).trim())
    .filter(Boolean);
};

export const tagsFromCommaSeparated = (value: string): string[] =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

export const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString();

export const printInvalidOption = (
  option: string,
  value: string,
  allowed: string[],
) => {
  printError(
    `Invalid ${option}: "${value}". Allowed values: ${allowed.join(', ')}`,
  );
};

type ItemLookupResult = {
  db: Awaited<ReturnType<typeof getDb>>;
  item: ShelfItem;
};

export const getItemOrExit = async (
  target: string,
  notFoundMessage = 'Item not found.',
): Promise<ItemLookupResult | null> => {
  const db = await getDb();
  const item = findItem(db.data.items, target);

  if (!item) {
    printError(notFoundMessage);
    return null;
  }

  return { db, item };
};

