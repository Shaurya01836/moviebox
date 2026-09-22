'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Plus, Check, Trash2, Folder } from 'lucide-react';
import { useWatchlist } from '../context/watchlist-context';
import { useCollections } from '@/features/collections/context/collections-context';
import { CreateCollectionModal } from '@/features/collections/components/create-collection-modal';
import { PersonalDataForm } from './personal-data-form';
import { MediaKind } from '@/types/movie';

import { X } from 'lucide-react';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number; align?: 'top' | 'bottom' } | null; // Kept for backwards compatibility but ignored
  media: {
    mediaId: string;
    mediaKind: MediaKind;
    title: string;
    posterPath: string;
    backdropPath?: string;
    logoPath?: string;
    releaseYear?: number;
    voteAverage?: number;
    genres?: string[];
  } | null;
}

export function WatchlistModal({ isOpen, onClose, media }: WatchlistModalProps) {
  const { getByMediaId, upsert, remove } = useWatchlist();
  const { collections, addMediaToCollection, removeMediaFromCollection } = useCollections();
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isCreateModalOpen) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, isCreateModalOpen]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !media || !mounted) return null;

  const existingItem = getByMediaId(media.mediaId);
  const isSaved = Boolean(existingItem);

  const handleToggleDefaultList = async () => {
    if (isSaved) {
      await remove(media.mediaId);
    } else {
      await upsert({
        mediaId: media.mediaId,
        mediaKind: media.mediaKind,
        title: media.title,
        posterPath: media.posterPath,
        backdropPath: media.backdropPath,
        logoPath: media.logoPath,
        releaseYear: media.releaseYear,
        voteAverage: media.voteAverage,
        genres: media.genres,
        status: 'watched',
      });
    }
  };

  const handleToggleCollection = async (collectionId: string, inCollection: boolean) => {
    if (!inCollection && !isSaved) {
      await upsert({
        mediaId: media.mediaId,
        mediaKind: media.mediaKind,
        title: media.title,
        posterPath: media.posterPath,
        backdropPath: media.backdropPath,
        logoPath: media.logoPath,
        releaseYear: media.releaseYear,
        voteAverage: media.voteAverage,
        genres: media.genres,
        status: 'watched', 
      });
    }

    if (inCollection) {
      await removeMediaFromCollection(collectionId, media.mediaId);
    } else {
      await addMediaToCollection(collectionId, media.mediaId);
    }
  };

  const cardContent = (
    <div
      ref={modalRef}
      className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border border-white/15 bg-zinc-950/95 shadow-2xl backdrop-blur-2xl shadow-black/90 animate-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div>
          <span className="text-sm font-bold text-white tracking-tight block">Add to List</span>
          <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[200px] block">{media.title}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {/* Default Watchlist Option */}
        <button
          type="button"
          onClick={handleToggleDefaultList}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer select-none ${
            isSaved
              ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-semibold'
              : 'text-zinc-200 hover:bg-white/10 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            {isSaved ? <Check className="h-5 w-5 text-red-500" /> : <Plus className="h-5 w-5 text-zinc-400" />}
            <span>{isSaved ? 'In My Library' : 'Add to My Library'}</span>
          </div>
          {isSaved && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Added</span>}
        </button>

        {/* Collections Section - Only show if saved to My Library */}
        {isSaved && (
          <div className="pt-2">
            <span className="px-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Collections</span>
            <div className="mt-2 space-y-1.5">
              {collections.length === 0 ? (
                <div className="px-3 py-3 rounded-xl bg-zinc-900/60 border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 font-medium">No custom collections yet.</p>
                </div>
              ) : (
                collections.map(col => {
                  const inCollection = col.items.some(i => i.mediaId === media.mediaId);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleToggleCollection(col.id, inCollection)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all cursor-pointer select-none ${
                        inCollection
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-300 hover:bg-white/5 hover:text-white bg-zinc-900/40 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Folder className={`h-4 w-4 ${inCollection ? 'text-zinc-200' : 'text-zinc-500'}`} />
                        <span className="truncate max-w-[200px] text-left">{col.name}</span>
                      </div>
                      {inCollection && <Check className="h-4 w-4 text-zinc-200" />}
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Create New Collection Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer mt-3"
            >
              <Plus className="h-4 w-4 text-red-500" />
              <span>+ Create New Collection</span>
            </button>

            <PersonalDataForm mediaId={media.mediaId} mediaKind={media.mediaKind} />
          </div>
        )}

        {!isSaved && (
          <div className="px-4 py-3 mt-2 rounded-xl bg-zinc-900/60 border border-white/5 text-center text-[12px] text-zinc-400">
            Add to My Library to unlock Collections and Personal Data
          </div>
        )}
      </div>
    </div>
  );

  const modalNode = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      {cardContent}
    </div>
  );
  
  const resultNode = typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;

  return (
    <>
      {resultNode}
      <CreateCollectionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
}
