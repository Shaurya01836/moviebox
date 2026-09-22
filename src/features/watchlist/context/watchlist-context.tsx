'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WatchlistItem, WatchStatus, AspectRatings, JournalEntry } from '../types';
import { WatchlistService } from '../services/watchlist.service';
import { getAnonymousId } from '@/lib/session';
import { useAuth } from '@/features/auth/context/auth-context';

interface WatchlistContextType {
  items: WatchlistItem[];
  isLoading: boolean;
  error: Error | null;
  getByMediaId: (mediaId: string | number) => WatchlistItem | undefined;
  upsert: (data: Partial<WatchlistItem> & { mediaId: string }) => Promise<void>;
  remove: (mediaId: string | number) => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const latestUserId = React.useRef(user?.id || getAnonymousId());

  useEffect(() => {
    latestUserId.current = user?.id || getAnonymousId();
    fetchItems();
  }, [user]);

  async function fetchItems() {
    try {
      setIsLoading(true);
      const currentUserId = user?.id || getAnonymousId();
      if (!currentUserId) {
        setIsLoading(false);
        return;
      }
      
      const fetchedItems = await WatchlistService.getAll(currentUserId);
      
      // Prevent race conditions from stale closures (e.g. anon fetch resolving after auth fetch)
      if (latestUserId.current === currentUserId) {
        setItems(fetchedItems);
      }
    } catch (err) {
      if (latestUserId.current === (user?.id || getAnonymousId())) {
        setError(err instanceof Error ? err : new Error('Failed to fetch watchlist'));
      }
    } finally {
      if (latestUserId.current === (user?.id || getAnonymousId())) {
        setIsLoading(false);
      }
    }
  }

  const getByMediaId = (mediaId: string | number) => {
    return items.find(item => String(item.mediaId) === String(mediaId));
  };

  const upsert = async (data: Partial<WatchlistItem> & { mediaId: string }) => {
    try {
      const userId = user?.id || getAnonymousId();
      if (!userId) return;
      
      // Optimistic update
      const now = new Date().toISOString();
      const stringMediaId = String(data.mediaId);
      const existingIndex = items.findIndex(i => String(i.mediaId) === stringMediaId);
      const existingItem = existingIndex >= 0 ? items[existingIndex] : undefined;
      let optimisticItems = [...items];

      const fullItem: WatchlistItem = {
        id: existingItem?.id || `temp_${Date.now()}`,
        mediaKind: 'movie',
        title: '',
        posterPath: '',
        status: 'watchlist',
        createdAt: now,
        ...existingItem,
        ...data,
        mediaId: stringMediaId,
        updatedAt: now,
      };

      if (existingIndex >= 0) {
        optimisticItems[existingIndex] = fullItem;
      } else {
        optimisticItems.unshift(fullItem);
      }
      setItems(optimisticItems);

      // Real update
      await WatchlistService.upsert(userId, fullItem);
      await fetchItems(); // Refresh to get proper DB IDs
    } catch (err) {
      console.error('Failed to upsert watchlist item:', err);
      await fetchItems(); // Revert optimistic update on failure
    }
  };

  const remove = async (mediaId: string | number) => {
    try {
      const userId = user?.id || getAnonymousId();
      if (!userId) return;

      // Optimistic update
      const stringMediaId = String(mediaId);
      setItems(items.filter(item => String(item.mediaId) !== stringMediaId));

      // Real update
      await WatchlistService.delete(userId, stringMediaId);
    } catch (err) {
      console.error('Failed to remove watchlist item:', err);
      await fetchItems(); // Revert optimistic update on failure
    }
  };

  return (
    <WatchlistContext.Provider value={{ items, isLoading, error, getByMediaId, upsert, remove }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
