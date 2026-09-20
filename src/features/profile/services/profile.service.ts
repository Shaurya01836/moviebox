import { createBrowserClient } from '@supabase/ssr';
import { UserProfile, AVATAR_OPTIONS } from '../types';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export class ProfileService {
  static async getProfilesByUser(userId: string): Promise<UserProfile[]> {
    if (!userId) return [];
    const supabase = getSupabase();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Profiles table fetch error or empty:', error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        avatarUrl: row.avatar_id || 'avatar-1',
        profileSetupCompleted: Boolean(row.profile_setup_completed),
        isLocked: Boolean(row.is_locked),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error('Failed to get profiles:', err);
      return [];
    }
  }

  static async saveProfile(
    userId: string,
    name: string,
    avatarId: string,
    existingProfileId?: string
  ): Promise<UserProfile | null> {
    if (!userId) return null;
    const supabase = getSupabase();

    const validAvatar = AVATAR_OPTIONS.find((a) => a.id === avatarId) ? avatarId : AVATAR_OPTIONS[0].id;

    const payload = {
      user_id: userId,
      name: name.trim() || 'Default Profile',
      avatar_id: validAvatar,
      profile_setup_completed: true,
      updated_at: new Date().toISOString(),
    };

    try {
      if (existingProfileId) {
        const { data, error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', existingProfileId)
          .select()
          .single();

        if (error) throw error;
        return {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          avatarUrl: data.avatar_id,
          profileSetupCompleted: true,
          isLocked: data.is_locked,
        };
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        return {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          avatarUrl: data.avatar_id,
          profileSetupCompleted: true,
          isLocked: data.is_locked,
        };
      }
    } catch (err) {
      console.error('Error persisting profile to database:', err);
      // Fallback object for UI continuity
      return {
        id: existingProfileId || `temp_${Date.now()}`,
        userId,
        name: name.trim() || 'Default Profile',
        avatarUrl: validAvatar,
        profileSetupCompleted: true,
      };
    }
  }
}
