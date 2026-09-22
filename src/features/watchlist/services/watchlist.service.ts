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
    
    // Fetch all three tables in parallel for this user
    const [watchlistRes, moodsRes, personsRes] = await Promise.all([
      supabase.from('watchlist').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('personal_moods').select('*').eq('user_id', userId),
      supabase.from('favorite_persons').select('*').eq('user_id', userId)
    ]);

    if (watchlistRes.error) {
      console.error('Error fetching watchlist from Supabase:', JSON.stringify(watchlistRes.error, null, 2));
      return [];
    }

    const moods = moodsRes.data || [];
    const persons = personsRes.data || [];

    // Map database snake_case columns back to camelCase for the frontend
    return (watchlistRes.data || []).map(row => {
      const rowMoods = moods.filter(m => m.media_id === row.media_id).map(m => m.mood);
      const rowPersons = persons.filter(p => p.media_id === row.media_id);
      const favoriteActors = rowPersons.filter(p => p.role_type === 'actor').map(p => ({
        id: p.person_id,
        name: p.person_name,
        roleType: p.role_type as 'actor',
        profilePath: p.profile_path
      }));
      const favoriteCharacters = rowPersons.filter(p => p.role_type === 'character').map(p => ({
        id: p.person_id,
        name: p.person_name,
        roleType: p.role_type as 'character',
        profilePath: p.profile_path
      }));

      return {
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
        moods: rowMoods,
        favoriteActors,
        favoriteCharacters,
        createdAt: row.created_at,
        updatedAt: row.updated_at
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
      favoriteCharacters?: { id: string; name: string; roleType: 'character'; profilePath?: string }[];
      favoriteActors?: { id: string; name: string; roleType: 'actor'; profilePath?: string }[];
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
