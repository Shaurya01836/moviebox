/**
 * WatchlistService — Mobile
 * Mirrors the web's watchlist.service.ts exactly.
 * Tables: watchlist, personal_moods, favorite_persons
 */
import { supabase } from '../lib/supabase';

export type WatchStatus = 'watching' | 'watched' | 'watchlist' | 'paused' | 'dropped';
export type MediaKind = 'movie' | 'tv';

export interface WatchlistItem {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface UpsertPayload {
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
}

function rowToItem(row: any): WatchlistItem {
  return {
    id: row.id || String(row.media_id),
    mediaId: String(row.media_id),
    mediaKind: row.media_kind,
    title: row.title,
    posterPath: row.poster_path ?? '',
    backdropPath: row.backdrop_path,
    releaseYear: row.release_year,
    voteAverage: row.vote_average,
    genres: row.genres || [],
    status: row.status,
    userRating: row.user_rating,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

export const WatchlistService = {
  async getAll(userId: string): Promise<WatchlistItem[]> {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('WatchlistService.getAll error:', error.message);
      return [];
    }
    return (data || []).map(rowToItem);
  },

  async upsert(userId: string, data: UpsertPayload): Promise<void> {
    if (!userId) return;
    const payload = {
      user_id: userId,
      media_id: data.mediaId,
      media_kind: data.mediaKind,
      title: data.title,
      poster_path: data.posterPath,
      backdrop_path: data.backdropPath,
      release_year: data.releaseYear,
      vote_average: data.voteAverage,
      genres: data.genres || [],
      status: data.status,
      user_rating: data.userRating,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('watchlist')
      .upsert(payload, { onConflict: 'user_id, media_id' });
    if (error) console.warn('WatchlistService.upsert error:', error.message);
  },

  async delete(userId: string, mediaId: string): Promise<boolean> {
    if (!userId) return false;
    await supabase.from('personal_moods').delete().match({ user_id: userId, media_id: mediaId });
    await supabase.from('favorite_persons').delete().match({ user_id: userId, media_id: mediaId });
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .match({ user_id: userId, media_id: mediaId });
    if (error) { console.warn('WatchlistService.delete error:', error.message); return false; }
    return true;
  },
};
