import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { customAlphabet } from 'nanoid';
import Fuse from 'fuse.js';

import type { DatabaseSchema, ShelfItem } from './types';

const HOME_DIR = os.homedir();
const DB_DIR = path.join(HOME_DIR, '.shelfie');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const adapter = new JSONFile<DatabaseSchema>(DB_FILE);
const defaultData: DatabaseSchema = {
  items: [],
  config: {
    defaultType: 'book',
  },
};
const db = new Low<DatabaseSchema>(adapter, defaultData);

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 4);

export const getDb = async () => {
  await db.read();

  db.data ||= defaultData;

  return db;
};

export const saveDb = async () => {
  await db.write();
};

export const generateId = () => nanoid();

export const findItem = (
  items: ShelfItem[],
  query: string,
): ShelfItem | null => {
  const exactId = items.find(i => i.id === query);

  if (exactId) return exactId;

  const fuse = new Fuse(items, {
    keys: ['title'],
    threshold: 0.4,
  });

  const result = fuse.search(query);

  return result.length > 0 ? result[0].item : null;
};
