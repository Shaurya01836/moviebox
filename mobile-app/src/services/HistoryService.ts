/**
 * HistoryService — Mobile
 * Mirrors the web's history.service.ts.
 * Tables: watch_history, watch_sessions
 */
import { supabase } from '../lib/supabase';

export type MediaKind = 'movie' | 'tv';

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

function rowToHistoryItem(row: any): WatchHistoryItem {
  return {
    id: row.id,
    userId: row.user_id,
    mediaId: row.media_id,
    mediaKind: row.media_kind,
    title: row.title,
    posterPath: row.poster_path,
    seasonNumber: row.season_number,
    episodeNumber: row.episode_number,
    progressSeconds: row.progress_seconds ?? 0,
    durationSeconds: row.duration_seconds ?? 0,
    watchCount: row.watch_count ?? 1,
    isCompleted: row.is_completed ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const HistoryService = {
  async getRecent(userId: string): Promise<WatchHistoryItem[]> {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('HistoryService.getRecent error:', error.message);
      return [];
    }
    return (data || []).map(rowToHistoryItem);
  },

  async syncProgress(
    userId: string,
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
    if (!userId) return;

    const isCompleted =
      payload.durationSeconds > 0
        ? payload.progressSeconds / payload.durationSeconds >= 0.9
        : false;
    const now = new Date().toISOString();

    try {
      // Check existing history row
      const { data: existing } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .eq('media_id', payload.mediaId)
        .eq('season_number', payload.seasonNumber ?? 0)
        .maybeSingle();

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
        watch_count: (existing?.watch_count ?? 1),
        is_completed: (existing?.is_completed ?? false) || isCompleted,
        updated_at: now,
      };

      if (existing) {
        await supabase.from('watch_history').update(historyPayload).eq('id', existing.id);
      } else {
        await supabase.from('watch_history').insert(historyPayload);
      }

      // Upsert session (update if < 6h old, else insert new)
      const { data: latestSession } = await supabase
        .from('watch_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('media_id', payload.mediaId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const sixHours = 6 * 60 * 60 * 1000;
      if (latestSession && Date.now() - new Date(latestSession.updated_at).getTime() < sixHours) {
        await supabase.from('watch_sessions').update({
          progress_seconds: payload.progressSeconds,
          duration_seconds: payload.durationSeconds,
          is_completed: isCompleted,
          updated_at: now,
        }).eq('id', latestSession.id);
      } else {
        await supabase.from('watch_sessions').insert({
          user_id: userId,
          media_id: payload.mediaId,
          media_kind: payload.mediaKind,
          season_number: payload.seasonNumber,
          episode_number: payload.episodeNumber,
          progress_seconds: payload.progressSeconds,
          duration_seconds: payload.durationSeconds,
          is_completed: isCompleted,
          started_at: now,
          updated_at: now,
        });
      }
    } catch (err) {
      console.warn('HistoryService.syncProgress error:', err);
    }
  },

  async deleteItem(userId: string, historyId: string, mediaId?: string): Promise<boolean> {
    if (!userId) return false;
    try {
      if (mediaId) {
        await supabase.from('watch_sessions').delete().match({ user_id: userId, media_id: mediaId });
      }
      const { error } = await supabase.from('watch_history').delete().eq('id', historyId).eq('user_id', userId);
      return !error;
    } catch {
      return false;
    }
  },

  async clearAll(userId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      await supabase.from('watch_sessions').delete().eq('user_id', userId);
      const { error } = await supabase.from('watch_history').delete().eq('user_id', userId);
      return !error;
    } catch {
      return false;
    }
  },
};
