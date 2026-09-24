import { createClient } from '@/lib/supabase/client';
import { Collection, CollectionItem } from '../types';

function getSupabase() {
  return createClient();
}

export class CollectionsService {
  static async getCollections(userId: string): Promise<Collection[]> {
    if (!userId) return [];
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching collections:', JSON.stringify(error, null, 2));
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      coverPath: row.cover_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  static async createCollection(userId: string, name: string, description?: string): Promise<Collection | null> {
    if (!userId) return null;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('collections')
      .insert({ user_id: userId, name, description })
      .select()
      .single();

    if (error) {
      console.error('Error creating collection:', JSON.stringify(error, null, 2));
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      coverPath: data.cover_path,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  static async updateCollection(userId: string, id: string, updates: Partial<Pick<Collection, 'name' | 'description' | 'coverPath'>>): Promise<boolean> {
    if (!userId) return false;
    const supabase = getSupabase();
    
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.coverPath !== undefined) payload.cover_path = updates.coverPath;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('collections')
      .update(payload)
      .match({ id, user_id: userId });

    if (error) {
      console.error('Error updating collection:', JSON.stringify(error, null, 2));
      return false;
    }
    return true;
  }

  static async deleteCollection(userId: string, id: string): Promise<boolean> {
    if (!userId) return false;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('collections')
      .delete()
      .match({ id, user_id: userId });

    if (error) {
      console.error('Error deleting collection:', JSON.stringify(error, null, 2));
      return false;
    }
    return true;
  }

  static async getCollectionItems(userId: string): Promise<CollectionItem[]> {
    if (!userId) return [];
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('collection_items')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching collection items:', JSON.stringify(error, null, 2));
      return [];
    }

    return (data || []).map(row => ({
      collectionId: row.collection_id,
      mediaId: row.media_id,
      userId: row.user_id,
      addedAt: row.added_at
    }));
  }

  static async addItem(userId: string, collectionId: string, mediaId: string): Promise<boolean> {
    if (!userId) return false;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('collection_items')
      .insert({ collection_id: collectionId, media_id: mediaId, user_id: userId });

    if (error) {
      // Ignore unique constraint violations (already added)
      if (error.code !== '23505') {
        console.error('Error adding item to collection:', JSON.stringify(error, null, 2));
        return false;
      }
    }
    return true;
  }

  static async removeItem(userId: string, collectionId: string, mediaId: string): Promise<boolean> {
    if (!userId) return false;
    const supabase = getSupabase();

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .match({ collection_id: collectionId, media_id: mediaId, user_id: userId });

    if (error) {
      console.error('Error removing item from collection:', JSON.stringify(error, null, 2));
      return false;
    }
    return true;
  }
}
