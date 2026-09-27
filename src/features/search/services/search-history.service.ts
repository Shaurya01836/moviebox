import { createClient } from '@/lib/supabase/client';

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
}

const SEARCH_HISTORY_STORAGE_KEY = 'moviebox_search_history';
const PAUSE_SEARCH_HISTORY_KEY = 'moviebox_pause_search_history';
const MAX_SEARCH_HISTORY = 30;

function getSupabase() {
  return createClient();
}

export class SearchHistoryService {
  /**
   * Check if search history recording is currently paused
   */
  static isPaused(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PAUSE_SEARCH_HISTORY_KEY) === 'true';
  }

  /**
   * Set pause state for search history
   */
  static setPaused(paused: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PAUSE_SEARCH_HISTORY_KEY, String(paused));
  }

  /**
   * Get search history items (from local storage + Supabase if logged in)
   */
  static async getHistory(userId?: string): Promise<SearchHistoryItem[]> {
    if (typeof window === 'undefined') return [];

    let localItems: SearchHistoryItem[] = [];
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
      if (stored) {
        localItems = JSON.parse(stored);
      }
    } catch {
      localItems = [];
    }

    if (!userId) {
      return localItems;
    }

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(MAX_SEARCH_HISTORY);

      if (!error && data && data.length > 0) {
        const dbItems: SearchHistoryItem[] = data.map((row: any) => ({
          id: row.id,
          query: row.query,
          createdAt: row.created_at,
        }));

        // Merge local and DB, avoiding duplicates, keeping latest
        const map = new Map<string, SearchHistoryItem>();
        [...dbItems, ...localItems].forEach((item) => {
          const normalized = item.query.trim().toLowerCase();
          if (!map.has(normalized)) {
            map.set(normalized, item);
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Update local storage cache
        localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(merged.slice(0, MAX_SEARCH_HISTORY)));
        return merged.slice(0, MAX_SEARCH_HISTORY);
      }
    } catch (err) {
      console.warn('Unable to fetch search history from Supabase:', err);
    }

    return localItems;
  }

  /**
   * Add a new query to search history
   */
  static async addQuery(query: string, userId?: string): Promise<SearchHistoryItem[]> {
    const trimmed = query.trim();
    if (!trimmed || this.isPaused()) {
      return this.getHistory(userId);
    }

    const now = new Date().toISOString();
    const newItem: SearchHistoryItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      query: trimmed,
      createdAt: now,
    };

    let items = await this.getHistory(userId);

    // Filter out existing query (case-insensitive deduplication)
    items = items.filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase());

    // Prepend new item
    items.unshift(newItem);

    // Limit length
    if (items.length > MAX_SEARCH_HISTORY) {
      items = items.slice(0, MAX_SEARCH_HISTORY);
    }

    // Save to LocalStorage
    try {
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }

    // Sync to Supabase if logged in
    if (userId) {
      try {
        const supabase = getSupabase();
        // Remove existing equal query from db
        await supabase
          .from('search_history')
          .delete()
          .eq('user_id', userId)
          .ilike('query', trimmed);

        // Insert new entry
        await supabase.from('search_history').insert({
          user_id: userId,
          query: trimmed,
          created_at: now,
        });
      } catch (err) {
        console.warn('Unable to sync search history to Supabase:', err);
      }
    }

    return items;
  }

  /**
   * Remove a single query from search history
   */
  static async removeQuery(idOrQuery: string, userId?: string): Promise<SearchHistoryItem[]> {
    let items = await this.getHistory(userId);

    const targetItem = items.find((i) => i.id === idOrQuery || i.query.toLowerCase() === idOrQuery.toLowerCase());
    items = items.filter((i) => i.id !== idOrQuery && i.query.toLowerCase() !== idOrQuery.toLowerCase());

    try {
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {}

    if (userId && targetItem) {
      try {
        const supabase = getSupabase();
        await supabase
          .from('search_history')
          .delete()
          .eq('user_id', userId)
          .eq('id', targetItem.id);
      } catch (err) {
        console.warn('Error deleting search query from Supabase:', err);
      }
    }

    return items;
  }

  /**
   * Clear all search history
   */
  static async clearHistory(userId?: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    }

    if (userId) {
      try {
        const supabase = getSupabase();
        await supabase.from('search_history').delete().eq('user_id', userId);
      } catch (err) {
        console.warn('Error clearing search history from Supabase:', err);
      }
    }
  }
}
