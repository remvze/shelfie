export type MediaType =
  | 'book'
  | 'movie'
  | 'series'
  | 'game'
  | 'audio'
  | 'article'
  | 'other';

export type Status = 'todo' | 'active' | 'done' | 'dropped';

export interface ShelfItem {
  id: string;
  title: string;
  type: MediaType;
  status: Status;
  progress: string; // e.g. 50%, Page 100, S01E02
  rating?: number; // 1-5
  tags: string[];
  notes: string[];
  addedAt: string; // ISO
  startedAt?: string; // ISO
  finishedAt?: string; // ISO
  priority: number; // 1 (Low) - 3 (High)
}

export interface DatabaseSchema {
  items: ShelfItem[];
  config: {
    defaultType: MediaType;
  };
}
