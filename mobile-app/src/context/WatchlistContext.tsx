/**
 * WatchlistContext — Mobile
 * Replicates the website's watchlist-context.tsx with Supabase sync.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WatchlistItem, WatchlistService, UpsertPayload, WatchStatus, MediaKind } from '../services/WatchlistService';
import { useAuth } from './AuthContext';

interface WatchlistContextType {
  items: WatchlistItem[];
  isLoading: boolean;
  getByMediaId: (mediaId: string) => WatchlistItem | undefined;
  upsert: (data: UpsertPayload) => Promise<void>;
  remove: (mediaId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType>({
  items: [],
  isLoading: false,
  getByMediaId: () => undefined,
  upsert: async () => {},
  remove: async () => {},
  refresh: async () => {},
});

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user?.id) { setItems([]); return; }
    setIsLoading(true);
    try {
      const data = await WatchlistService.getAll(user.id);
      setItems(data);
    } catch (err) {
      console.warn('WatchlistContext fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const getByMediaId = (mediaId: string) =>
    items.find((i) => String(i.mediaId) === String(mediaId));

  const upsert = async (data: UpsertPayload) => {
    if (!user?.id) return;

    // Optimistic update
    const now = new Date().toISOString();
    const existing = items.find((i) => String(i.mediaId) === String(data.mediaId));
    const optimistic: WatchlistItem = {
      id: existing?.id ?? `temp_${Date.now()}`,
      createdAt: existing?.createdAt ?? now,
      ...existing,
      ...data,
      updatedAt: now,
    };
    setItems((prev) => {
      const idx = prev.findIndex((i) => String(i.mediaId) === String(data.mediaId));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = optimistic;
        return next;
      }
      return [optimistic, ...prev];
    });

    try {
      await WatchlistService.upsert(user.id, data);
      await fetchItems(); // re-fetch to get real DB ids
    } catch {
      await fetchItems(); // revert on failure
    }
  };

  const remove = async (mediaId: string) => {
    if (!user?.id) return;
    // Optimistic remove
    setItems((prev) => prev.filter((i) => String(i.mediaId) !== String(mediaId)));
    try {
      await WatchlistService.delete(user.id, mediaId);
    } catch {
      await fetchItems();
    }
  };

  return (
    <WatchlistContext.Provider value={{ items, isLoading, getByMediaId, upsert, remove, refresh: fetchItems }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
export type { WatchlistItem, WatchStatus, MediaKind };
