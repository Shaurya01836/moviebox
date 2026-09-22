'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Collection, CollectionItem, CollectionWithItems } from '../types';
import { CollectionsService } from '../services/collections.service';
import { useAuth } from '@/features/auth/context/auth-context';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';

interface CollectionsContextType {
  collections: CollectionWithItems[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<Collection | null>;
  deleteCollection: (collectionId: string) => Promise<boolean>;
  addMediaToCollection: (collectionId: string, mediaId: string) => Promise<boolean>;
  removeMediaFromCollection: (collectionId: string, mediaId: string) => Promise<boolean>;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { items: watchlistItems } = useWatchlist();
  const [collectionsRaw, setCollectionsRaw] = useState<Collection[]>([]);
  const [itemsRaw, setItemsRaw] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = async () => {
    if (!user) {
      setCollectionsRaw([]);
      setItemsRaw([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [fetchedCols, fetchedItems] = await Promise.all([
        CollectionsService.getCollections(user.id),
        CollectionsService.getCollectionItems(user.id)
      ]);
      setCollectionsRaw(fetchedCols);
      setItemsRaw(fetchedItems);
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [user]);

  // Derive collections with items, including generated covers
  const collections = useMemo<CollectionWithItems[]>(() => {
    return collectionsRaw.map(col => {
      const colItems = itemsRaw.filter(i => i.collectionId === col.id);
      
      // Auto-generate cover if not present by finding the first 4 posters from the watchlist
      let generatedCover = col.coverPath;
      if (!generatedCover && colItems.length > 0) {
        // We'll leave cover generation to the UI components which have access to the watchlist,
        // but here we just bundle the items.
      }

      return {
        ...col,
        items: colItems,
      };
    });
  }, [collectionsRaw, itemsRaw]);

  const createCollection = async (name: string, description?: string) => {
    if (!user) return null;
    const newCol = await CollectionsService.createCollection(user.id, name, description);
    if (newCol) {
      setCollectionsRaw(prev => [...prev, newCol]);
    }
    return newCol;
  };

  const deleteCollection = async (collectionId: string) => {
    if (!user) return false;
    const success = await CollectionsService.deleteCollection(user.id, collectionId);
    if (success) {
      setCollectionsRaw(prev => prev.filter(c => c.id !== collectionId));
      setItemsRaw(prev => prev.filter(i => i.collectionId !== collectionId));
    }
    return success;
  };

  const addMediaToCollection = async (collectionId: string, mediaId: string) => {
    if (!user) return false;
    // Optimistic update
    const newItem: CollectionItem = { collectionId, mediaId, userId: user.id, addedAt: new Date().toISOString() };
    setItemsRaw(prev => {
      if (prev.some(i => i.collectionId === collectionId && i.mediaId === mediaId)) return prev;
      return [...prev, newItem];
    });

    const success = await CollectionsService.addItem(user.id, collectionId, mediaId);
    if (!success) {
      // Revert on failure
      setItemsRaw(prev => prev.filter(i => !(i.collectionId === collectionId && i.mediaId === mediaId)));
    }
    return success;
  };

  const removeMediaFromCollection = async (collectionId: string, mediaId: string) => {
    if (!user) return false;
    
    // Backup for revert
    const itemToRemove = itemsRaw.find(i => i.collectionId === collectionId && i.mediaId === mediaId);
    
    // Optimistic update
    setItemsRaw(prev => prev.filter(i => !(i.collectionId === collectionId && i.mediaId === mediaId)));

    const success = await CollectionsService.removeItem(user.id, collectionId, mediaId);
    if (!success && itemToRemove) {
      // Revert on failure
      setItemsRaw(prev => [...prev, itemToRemove]);
    }
    return success;
  };

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        isLoading,
        refresh: fetchCollections,
        createCollection,
        deleteCollection,
        addMediaToCollection,
        removeMediaFromCollection
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
}
