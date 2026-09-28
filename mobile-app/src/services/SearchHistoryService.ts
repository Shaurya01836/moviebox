/**
 * SearchHistoryService — Mobile
 * Mirrors the web's search-history.service.ts.
 * Table: search_history
 */
import { supabase } from '../lib/supabase';

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
}

const MAX = 30;

export const SearchHistoryService = {
  async getHistory(userId?: string): Promise<SearchHistoryItem[]> {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX);

    if (error) { console.warn('SearchHistoryService.getHistory error:', error.message); return []; }
    return (data || []).map((row: any) => ({ id: row.id, query: row.query, createdAt: row.created_at }));
  },

  async addQuery(query: string, userId?: string): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed || !userId) return;
    const now = new Date().toISOString();

    try {
      // Remove existing same query (dedup)
      await supabase.from('search_history').delete().eq('user_id', userId).ilike('query', trimmed);
      // Insert fresh entry
      await supabase.from('search_history').insert({ user_id: userId, query: trimmed, created_at: now });

      // Trim to MAX
      const { data } = await supabase
        .from('search_history')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(MAX, 999);
      if (data && data.length > 0) {
        const ids = data.map((r: any) => r.id);
        await supabase.from('search_history').delete().in('id', ids);
      }
    } catch (err) {
      console.warn('SearchHistoryService.addQuery error:', err);
    }
  },

  async removeQuery(id: string, userId?: string): Promise<void> {
    if (!userId) return;
    try {
      await supabase.from('search_history').delete().eq('id', id).eq('user_id', userId);
    } catch (err) {
      console.warn('SearchHistoryService.removeQuery error:', err);
    }
  },

  async clearAll(userId?: string): Promise<void> {
    if (!userId) return;
    try {
      await supabase.from('search_history').delete().eq('user_id', userId);
    } catch (err) {
      console.warn('SearchHistoryService.clearAll error:', err);
    }
  },
};
