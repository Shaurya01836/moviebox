import { createBrowserClient } from '@supabase/ssr';
import { WatchlistItem, WatchStatus, AspectRatings, JournalEntry } from '../types';
import { MediaKind } from '@/types/movie';

// Helper to get Supabase client directly in the service
function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class WatchlistService {
  static async getAll(userId: string): Promise<WatchlistItem[]> {
    if (!userId) return [];
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watchlist from Supabase:', error);
      return [];
    }

    // Map database snake_case columns back to camelCase for the frontend
    return (data || []).map(row => ({
      id: row.id,
      mediaId: row.media_id,
      mediaKind: row.media_kind,
      title: row.title,
      posterPath: row.poster_path,
      backdropPath: row.backdrop_path,
      releaseYear: row.release_year,
      voteAverage: row.vote_average,
      genres: row.genres || [],
      status: row.status,
      userRating: row.user_rating,
      aspects: row.aspects || {},
      journal: row.journal || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  static async upsert(
    userId: string, 
    data: {
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
    }
  ): Promise<void> {
    if (!userId) return;
    const supabase = getSupabase();
    
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
      aspects: data.aspects,
      journal: data.journal,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('watchlist')
      .upsert(payload, { onConflict: 'user_id, media_id' });

    if (error) {
      console.error('Error saving watchlist to Supabase:', error);
      throw error;
    }
  }

  static async delete(userId: string, mediaId: string): Promise<boolean> {
    if (!userId) return false;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .match({ user_id: userId, media_id: mediaId });

    if (error) {
      console.error('Error deleting from Supabase:', error);
      return false;
    }
    return true;
  }
}
