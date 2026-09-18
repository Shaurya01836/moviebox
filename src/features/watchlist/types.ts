import { MediaKind } from '@/types/movie';

export interface WatchlistItem {
  id: string;
  mediaId: string;
  mediaKind: MediaKind;
  addedAt: string;
  notes?: string;
}
