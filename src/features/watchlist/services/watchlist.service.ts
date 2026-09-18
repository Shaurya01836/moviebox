import { WatchlistItem, WatchStatus, AspectRatings, JournalEntry } from '../types';
import { MediaKind } from '@/types/movie';

const STORAGE_KEY = 'moviebox_watchlist_items';
const WATCHLIST_CHANGE_EVENT = 'moviebox_watchlist_updated';

export class WatchlistService {
  private static getStoredItems(): WatchlistItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Error reading watchlist from localStorage:', err);
      return [];
    }
  }

  private static saveStoredItems(items: WatchlistItem[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(WATCHLIST_CHANGE_EVENT, { detail: items }));
    } catch (err) {
      console.error('Error saving watchlist to localStorage:', err);
    }
  }

  static getAll(): WatchlistItem[] {
    return this.getStoredItems();
  }

  static getByMediaId(mediaId: string): WatchlistItem | undefined {
    const items = this.getStoredItems();
    return items.find((item) => item.mediaId === mediaId);
  }

  static upsert(data: {
    mediaId: string;
    mediaKind: MediaKind;
    title: string;
    posterPath: string;
    backdropPath?: string;
    releaseYear?: number;
    voteAverage?: number;
    genres?: string[];
    status: WatchStatus;
    userRating?: number;
    aspects?: AspectRatings;
    journal?: JournalEntry;
  }): WatchlistItem {
    const items = this.getStoredItems();
    const existingIndex = items.findIndex((i) => i.mediaId === data.mediaId);
    const now = new Date().toISOString();

    let newItem: WatchlistItem;

    if (existingIndex >= 0) {
      newItem = {
        ...items[existingIndex],
        ...data,
        updatedAt: now,
      };
      items[existingIndex] = newItem;
    } else {
      newItem = {
        id: `w_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      items.unshift(newItem);
    }

    this.saveStoredItems(items);
    return newItem;
  }

  static delete(mediaId: string): boolean {
    const items = this.getStoredItems();
    const filtered = items.filter((i) => i.mediaId !== mediaId);
    if (filtered.length !== items.length) {
      this.saveStoredItems(filtered);
      return true;
    }
    return false;
  }

  static subscribe(callback: (items: WatchlistItem[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<WatchlistItem[]>;
      callback(customEvent.detail || WatchlistService.getAll());
    };

    window.addEventListener(WATCHLIST_CHANGE_EVENT, handler);
    return () => {
      window.removeEventListener(WATCHLIST_CHANGE_EVENT, handler);
    };
  }
}
