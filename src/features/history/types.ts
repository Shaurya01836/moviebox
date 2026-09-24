import { MediaKind } from '@/types/movie';

export interface WatchHistoryItem {
  id: string;
  userId: string;
  mediaId: string;
  mediaKind: MediaKind;
  title: string;
  posterPath?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  durationSeconds: number;
  watchCount: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WatchSession {
  id: string;
  userId: string;
  mediaId: string;
  mediaKind: MediaKind;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  durationSeconds: number;
  isCompleted: boolean;
  startedAt: string;
  updatedAt: string;
}
