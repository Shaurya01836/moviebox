import { createBrowserClient } from '@supabase/ssr';
import { WatchHistoryItem, WatchSession } from '../types';
import { MediaKind } from '@/types/movie';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class HistoryService {
  /**
   * Syncs playback progress to the database.
   * Calculates completion based on a 90% threshold.
   */
  static async syncProgress(
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
    const supabase = getSupabase();
    
    const isCompleted = payload.durationSeconds > 0 
      ? (payload.progressSeconds / payload.durationSeconds) >= 0.9 
      : false;

    // 1. Check if a history record already exists
    const { data: existingHistory } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .eq('media_id', payload.mediaId)
      .eq('season_number', payload.seasonNumber || 0) // Supabase nullable matching is tricky, might need coalesce but we'll try IS NOT DISTINCT FROM later if needed. Actually we defined UNIQUE constraint on these 4 columns.
      .maybeSingle();

    // Workaround for NULL in unique constraints: in Postgres, NULL != NULL. 
    // To properly upsert, if we have season=null, we need to query explicitly.
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

    let watchCount = historyRecord?.watch_count || 1;
    let wasAlreadyCompleted = historyRecord?.is_completed || false;

    // If it was previously completed, and they started a new session (e.g. progress is small now but it was completed), 
    // we could increment watch_count, but for simplicity we'll just keep it at 1 unless we build a dedicated "Rewatch" button.
    // For now, if it flips from incomplete to complete, make sure it stays complete.
    const newIsCompleted = wasAlreadyCompleted || isCompleted;

    // 2. Upsert History
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
      watch_count: watchCount,
      is_completed: newIsCompleted,
      updated_at: new Date().toISOString()
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

    // 3. Upsert Session (Find an active session from today, or create a new one)
    // For a real prod app, you might find a session within the last 4 hours.
    // Here we'll just find the latest session and if it's < 6 hours old, update it.
    const { data: latestSession } = await supabase
      .from('watch_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('media_id', payload.mediaId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sixHours = 6 * 60 * 60 * 1000;
    const now = new Date();
    
    if (latestSession && (now.getTime() - new Date(latestSession.updated_at).getTime() < sixHours)) {
      // Update existing session
      await supabase
        .from('watch_sessions')
        .update({
          progress_seconds: payload.progressSeconds,
          duration_seconds: payload.durationSeconds,
          is_completed: newIsCompleted,
          updated_at: now.toISOString()
        })
        .eq('id', latestSession.id);
    } else {
      // Create new session
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
          started_at: now.toISOString(),
          updated_at: now.toISOString()
        });
        
        // If we created a NEW session for something already completed, that's a rewatch!
        if (historyRecord && wasAlreadyCompleted && historyId) {
          await supabase
            .from('watch_history')
            .update({ watch_count: watchCount + 1 })
            .eq('id', historyId);
        }
    }
  }

  static async getRecent(userId: string): Promise<WatchHistoryItem[]> {
    if (!userId) return [];
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching watch history:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
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
  }

  static async deleteHistory(userId: string, historyId: string): Promise<boolean> {
    if (!userId) return false;
    const supabase = getSupabase();

    // Find the history record to get the media_id to also delete sessions
    const { data: record } = await supabase
      .from('watch_history')
      .select('media_id, season_number, episode_number')
      .eq('id', historyId)
      .eq('user_id', userId)
      .single();

    if (!record) return false;

    // Delete sessions
    const query = supabase
      .from('watch_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('media_id', record.media_id);
    
    if (record.season_number) query.eq('season_number', record.season_number);
    else query.is('season_number', null);
    
    if (record.episode_number) query.eq('episode_number', record.episode_number);
    else query.is('episode_number', null);

    await query;

    // Delete history
    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', userId);

    return !error;
  }
}
