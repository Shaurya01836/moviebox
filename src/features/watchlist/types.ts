import { MediaKind } from '@/types/movie';

export type WatchStatus = 'watching' | 'watched' | 'watchlist' | 'paused' | 'dropped';

export interface AspectRatings {
  story?: number;        // 1-10
  characters?: number;   // 1-10
  acting?: number;       // 1-10
  visuals?: number;      // 1-10
  music?: number;        // 1-10
  rewatchability?: number; // 1-10
}

export interface JournalEntry {
  review?: string;
  notes?: string;
  favoriteCharacter?: string;
  favoriteQuote?: string;
  favoriteEpisode?: string;
  emotionTag?: string; // e.g. "Mind-Blown 🤯", "Emotional 😭", "Thrilled ⚡", "Fun 😄"
  isSpoiler?: boolean;
}

export interface WatchlistItem {
  id: string; // unique item id
  mediaId: string;
  mediaKind: MediaKind;
  title: string;
  posterPath: string;
  backdropPath?: string;
  releaseYear?: number;
  voteAverage?: number;
  genres?: string[];

  status: WatchStatus;
  userRating?: number; // 1-10 overall
  aspects?: AspectRatings;
  journal?: JournalEntry;

  createdAt: string;
  updatedAt: string;
}

export const WATCH_STATUS_CONFIG: Record<
  WatchStatus,
  { label: string; emoji: string; badgeClass: string }
> = {
  watching: {
    label: 'Watching',
    emoji: '🔥',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  watched: {
    label: 'Watched',
    emoji: '✅',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  watchlist: {
    label: 'Watchlist',
    emoji: '📌',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  paused: {
    label: 'Paused',
    emoji: '⏸️',
    badgeClass: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  },
  dropped: {
    label: 'Dropped',
    emoji: '❌',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
};
