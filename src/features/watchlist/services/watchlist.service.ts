import { createClient } from '@/lib/supabase/client';
import { WatchlistItem, WatchStatus, AspectRatings, JournalEntry, Person } from '../types';
import { MediaKind } from '@/types/movie';

// Helper to get Supabase client directly in the service
function getSupabase() {
  return createClient();
}

export class WatchlistService {
  static async getAll(userId: string): Promise<WatchlistItem[]> {
    if (!userId) return [];
    const supabase = getSupabase();
    
    // Fetch all three tables in parallel for this user
    const [watchlistRes, moodsRes, personsRes] = await Promise.all([
      supabase.from('watchlist').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('personal_moods').select('*').eq('user_id', userId),
      supabase.from('favorite_persons').select('*').eq('user_id', userId),
    ]);

    if (watchlistRes.error) {
      console.error('Error fetching watchlist from Supabase:', watchlistRes.error);
      throw watchlistRes.error;
    }

    const moodsMap = new Map<string, string[]>();
    (moodsRes.data || []).forEach((row: any) => {
      const existing = moodsMap.get(row.media_id) || [];
      moodsMap.set(row.media_id, [...existing, row.mood]);
    });

    const charsMap = new Map<string, Person[]>();
    const actorsMap = new Map<string, Person[]>();
    (personsRes.data || []).forEach((row: any) => {
      const person: Person = {
        id: row.person_id,
        name: row.person_name || row.name,
        roleType: row.role_type,
        profilePath: row.profile_path,
      };
      if (row.role_type === 'character') {
        const existing = charsMap.get(row.media_id) || [];
        charsMap.set(row.media_id, [...existing, person]);
      } else if (row.role_type === 'actor') {
        const existing = actorsMap.get(row.media_id) || [];
        actorsMap.set(row.media_id, [...existing, person]);
      }
    });

    return (watchlistRes.data || []).map((row: any) => {
      const mediaId = String(row.media_id);
      return {
        id: row.id || mediaId,
        mediaId,
        mediaKind: row.media_kind,
        title: row.title,
        posterPath: row.poster_path,
        backdropPath: row.backdrop_path,
        releaseYear: row.release_year,
        voteAverage: row.vote_average,
        genres: row.genres || [],
        status: row.status,
        userRating: row.user_rating,
        aspects: row.aspects || undefined,
        journal: row.journal || undefined,
        moods: moodsMap.get(mediaId) || [],
        favoriteCharacters: charsMap.get(mediaId) || [],
        favoriteActors: actorsMap.get(mediaId) || [],
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
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
      moods?: string[];
      favoriteCharacters?: Person[];
      favoriteActors?: Person[];
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
      console.error('Error saving watchlist to Supabase:', JSON.stringify(error, null, 2));
      throw error;
    }

    // Sync Moods
    if (data.moods !== undefined) {
      await supabase.from('personal_moods').delete().match({ user_id: userId, media_id: data.mediaId });
      if (data.moods.length > 0) {
        const moodPayloads = data.moods.map(mood => ({
          user_id: userId,
          media_id: data.mediaId,
          mood
        }));
        await supabase.from('personal_moods').insert(moodPayloads);
      }
    }

    // Sync Persons (Actors & Characters)
    if (data.favoriteActors !== undefined || data.favoriteCharacters !== undefined) {
      // If either array is provided, we sync the whole media_id for persons
      await supabase.from('favorite_persons').delete().match({ user_id: userId, media_id: data.mediaId });
      
      const personsPayloads: any[] = [];
      if (data.favoriteActors) {
        data.favoriteActors.forEach(a => {
          personsPayloads.push({
            user_id: userId,
            media_id: data.mediaId,
            person_id: a.id,
            person_name: a.name,
            role_type: 'actor',
            profile_path: a.profilePath
          });
        });
      }
      if (data.favoriteCharacters) {
        data.favoriteCharacters.forEach(c => {
          personsPayloads.push({
            user_id: userId,
            media_id: data.mediaId,
            person_id: c.id,
            person_name: c.name,
            role_type: 'character',
            profile_path: c.profilePath
          });
        });
      }

      if (personsPayloads.length > 0) {
        await supabase.from('favorite_persons').insert(personsPayloads);
      }
    }
  }

  static async delete(userId: string, mediaId: string): Promise<boolean> {
    if (!userId) return false;
    const supabase = getSupabase();

    // Cascading deletes manually
    await supabase.from('personal_moods').delete().match({ user_id: userId, media_id: mediaId });
    await supabase.from('favorite_persons').delete().match({ user_id: userId, media_id: mediaId });

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .match({ user_id: userId, media_id: mediaId });

    if (error) {
      console.error('Error deleting from Supabase:', JSON.stringify(error, null, 2));
      return false;
    }
    return true;
  }
}
