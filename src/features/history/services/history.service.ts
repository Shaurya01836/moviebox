import { createClient } from '@/lib/supabase/client';
import { WatchHistoryItem } from '../types';
import { MediaKind } from '@/types/movie';

const WATCH_HISTORY_STORAGE_KEY = 'moviebox_watch_history';
const PAUSE_WATCH_HISTORY_KEY = 'moviebox_pause_watch_history';

function getSupabase() {
  return createClient();
}

export class HistoryService {
  /**
   * Check if watch history is paused
   */
  static isPaused(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(PAUSE_WATCH_HISTORY_KEY) === 'true';
  }

  /**
   * Set watch history pause state
   */
  static setPaused(paused: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PAUSE_WATCH_HISTORY_KEY, String(paused));
  }

  /**
   * Get watch history items locally from localStorage
   */
  static getLocalItems(): WatchHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save watch history items locally to localStorage
   */
  static saveLocalItems(items: WatchHistoryItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
    } catch {}
  }

  /**
   * Syncs playback progress to the database and/or local storage.
   */
  static async syncProgress(
    userId: string | undefined,
    payload: {
      mediaId: string;
      mediaKind: MediaKind;
      title: string;
      posterPath?: string;
      seasonNumber?: number;
      episodeNumber?: number;
      progressSeconds: number;
      durationSeconds: number;
    }
  ): Promise<void> {
    if (this.isPaused()) return;

    const isCompleted = payload.durationSeconds > 0
      ? (payload.progressSeconds / payload.durationSeconds) >= 0.9
      : false;

    const now = new Date().toISOString();

    // 1. Always update LocalStorage cache
    let localItems = this.getLocalItems();
    const existingLocalIdx = localItems.findIndex(
      (item) =>
        item.mediaId === payload.mediaId &&
        (item.seasonNumber || 0) === (payload.seasonNumber || 0) &&
        (item.episodeNumber || 0) === (payload.episodeNumber || 0)
    );

    let watchCount = 1;
    let wasCompleted = false;
    if (existingLocalIdx >= 0) {
      watchCount = localItems[existingLocalIdx].watchCount || 1;
      wasCompleted = localItems[existingLocalIdx].isCompleted || false;
    }

    const updatedLocalItem: WatchHistoryItem = {
      id: existingLocalIdx >= 0 ? localItems[existingLocalIdx].id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      userId: userId || 'guest',
      mediaId: payload.mediaId,
      mediaKind: payload.mediaKind,
      title: payload.title,
      posterPath: payload.posterPath,
      seasonNumber: payload.seasonNumber,
      episodeNumber: payload.episodeNumber,
      progressSeconds: payload.progressSeconds,
      durationSeconds: payload.durationSeconds,
      watchCount: wasCompleted && isCompleted ? watchCount + 1 : watchCount,
      isCompleted: wasCompleted || isCompleted,
      createdAt: existingLocalIdx >= 0 ? localItems[existingLocalIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingLocalIdx >= 0) {
      localItems.splice(existingLocalIdx, 1);
    }
    localItems.unshift(updatedLocalItem);
    this.saveLocalItems(localItems);

    // 2. Sync to Supabase if logged in
    if (!userId) return;

    try {
      const supabase = getSupabase();
      
      const { data: existingHistory } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .eq('media_id', payload.mediaId)
        .eq('season_number', payload.seasonNumber || 0)
        .maybeSingle();

      let historyRecord = existingHistory;
      if (!historyRecord) {
        const query = supabase
          .from('watch_history')
          .select('*')
          .eq('user_id', userId)
          .eq('media_id', payload.mediaId);
          
        if (payload.seasonNumber) query.eq('season_number', payload.seasonNumber);
        else query.is('season_number', null);
        
        if (payload.episodeNumber) query.eq('episode_number', payload.episodeNumber);
        else query.is('episode_number', null);

        const { data } = await query.maybeSingle();
        historyRecord = data;
      }

      let dbWatchCount = historyRecord?.watch_count || 1;
      let wasAlreadyCompleted = historyRecord?.is_completed || false;
      const newIsCompleted = wasAlreadyCompleted || isCompleted;

      const historyPayload = {
        user_id: userId,
        media_id: payload.mediaId,
        media_kind: payload.mediaKind,
        title: payload.title,
        poster_path: payload.posterPath,
        season_number: payload.seasonNumber,
        episode_number: payload.episodeNumber,
        progress_seconds: payload.progressSeconds,
        duration_seconds: payload.durationSeconds,
        watch_count: dbWatchCount,
        is_completed: newIsCompleted,
        updated_at: now
      };

      let historyId = historyRecord?.id;

      if (historyRecord) {
        await supabase
          .from('watch_history')
          .update(historyPayload)
          .eq('id', historyRecord.id);
      } else {
        const { data } = await supabase
          .from('watch_history')
          .insert(historyPayload)
          .select('id')
          .single();
        if (data) historyId = data.id;
      }

      // Upsert Session
      const { data: latestSession } = await supabase
        .from('watch_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('media_id', payload.mediaId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const sixHours = 6 * 60 * 60 * 1000;
      const nowObj = new Date();
      
      if (latestSession && (nowObj.getTime() - new Date(latestSession.updated_at).getTime() < sixHours)) {
        await supabase
          .from('watch_sessions')
          .update({
            progress_seconds: payload.progressSeconds,
            duration_seconds: payload.durationSeconds,
            is_completed: newIsCompleted,
            updated_at: now
          })
          .eq('id', latestSession.id);
      } else {
        await supabase
          .from('watch_sessions')
          .insert({
            user_id: userId,
            media_id: payload.mediaId,
            media_kind: payload.mediaKind,
            season_number: payload.seasonNumber,
            episode_number: payload.episodeNumber,
            progress_seconds: payload.progressSeconds,
            duration_seconds: payload.durationSeconds,
            is_completed: newIsCompleted,
            started_at: now,
            updated_at: now
          });
          
        if (historyRecord && wasAlreadyCompleted && historyId) {
          await supabase
            .from('watch_history')
            .update({ watch_count: dbWatchCount + 1 })
            .eq('id', historyId);
        }
      }
    } catch (err) {
      console.warn('Unable to sync watch progress to Supabase:', err);
    }
  }

  /**
   * Get recent watch history items
   */
  static async getRecent(userId?: string): Promise<WatchHistoryItem[]> {
    const localItems = this.getLocalItems();

    if (!userId) {
      return localItems;
    }

    try {
      const supabase = getSupabase();
      
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('Could not find the table') || error.code === 'PGRST205') {
          console.warn('Watch history tables not yet created in Supabase. Falling back to local storage.');
        } else {
          console.error('Error fetching watch history from Supabase:', error.message || error.details || error);
        }
        return localItems;
      }

      const dbItems: WatchHistoryItem[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        mediaId: row.media_id,
        mediaKind: row.media_kind,
        title: row.title,
        posterPath: row.poster_path,
        seasonNumber: row.season_number,
        episodeNumber: row.episode_number,
        progressSeconds: row.progress_seconds,
        durationSeconds: row.duration_seconds,
        watchCount: row.watch_count,
        isCompleted: row.is_completed,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      // Combine local and DB items keeping newest
      const map = new Map<string, WatchHistoryItem>();
      [...dbItems, ...localItems].forEach(item => {
        const key = `${item.mediaId}_${item.seasonNumber || 0}_${item.episodeNumber || 0}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      this.saveLocalItems(merged);
      return merged;
    } catch (err) {
      console.warn('Error in getRecent watch history:', err);
      return localItems;
    }
  }

  /**
   * Delete a single history item
   */
  static async deleteHistory(userId: string | undefined, historyId: string): Promise<boolean> {
    let localItems = this.getLocalItems();
    const itemToDelete = localItems.find(i => i.id === historyId);
    localItems = localItems.filter(i => i.id !== historyId);
    this.saveLocalItems(localItems);

    if (!userId) return true;

    try {
      const supabase = getSupabase();
      
      if (itemToDelete) {
        const query = supabase
          .from('watch_sessions')
          .delete()
          .eq('user_id', userId)
          .eq('media_id', itemToDelete.mediaId);
        
        if (itemToDelete.seasonNumber) query.eq('season_number', itemToDelete.seasonNumber);
        if (itemToDelete.episodeNumber) query.eq('episode_number', itemToDelete.episodeNumber);

        await query;
      }

      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('id', historyId)
        .eq('user_id', userId);

      return !error;
    } catch (err) {
      console.warn('Error deleting watch history:', err);
      return false;
    }
  }

  /**
   * Clear all watch history
   */
  static async clearAll(userId?: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WATCH_HISTORY_STORAGE_KEY);
    }

    if (!userId) return true;

    try {
      const supabase = getSupabase();
      await supabase.from('watch_sessions').delete().eq('user_id', userId);
      const { error } = await supabase.from('watch_history').delete().eq('user_id', userId);
      return !error;
    } catch (err) {
      console.warn('Error clearing watch history:', err);
      return false;
    }
  }
}
