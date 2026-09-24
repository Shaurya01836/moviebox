'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Plus, Check, Trash2, Folder, CheckCircle2, Flame, BookmarkPlus } from 'lucide-react';
import { useWatchlist } from '../context/watchlist-context';
import { useCollections } from '@/features/collections/context/collections-context';
import { CreateCollectionModal } from '@/features/collections/components/create-collection-modal';
import { PersonalDataForm } from './personal-data-form';
import { MediaKind } from '@/types/movie';

import { X } from 'lucide-react';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number; align?: 'top' | 'bottom' } | null;
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
  const { collections, addMediaToCollection, removeMediaFromCollection, createCollection } = useCollections();
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
  const defaultCollectionNames = ['watched library', 'currently watching', 'bucket list'];
  const customCollections = collections.filter(c => !defaultCollectionNames.includes(c.name.toLowerCase()));

  const handleToggleStatus = async (status: 'watched' | 'watchlist' | 'watching') => {
    const isCurrentlyActive = isSaved && existingItem?.status === status;

    if (isCurrentlyActive) {
      // Remove from watchlist
      await remove(media.mediaId);
    } else {
      // Upsert with new status
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
        status: status,
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
        
        {/* Default Watchlist Options */}
        <div className="space-y-2.5">
          {[
            { 
              label: 'Watched Library', 
              status: 'watched' as const, 
              icon: CheckCircle2,
              activeColor: 'text-emerald-400',
              activeBg: 'bg-emerald-500/15',
              activeBorder: 'border-emerald-500/30'
            },
            { 
              label: 'Currently Watching', 
              status: 'watching' as const, 
              icon: Flame,
              activeColor: 'text-amber-400',
              activeBg: 'bg-amber-500/15',
              activeBorder: 'border-amber-500/30'
            },
            { 
              label: 'Bucket List', 
              status: 'watchlist' as const, 
              icon: BookmarkPlus,
              activeColor: 'text-blue-400',
              activeBg: 'bg-blue-500/15',
              activeBorder: 'border-blue-500/30'
            }
          ].map(option => {
            const isActive = isSaved && existingItem?.status === option.status;
            const Icon = option.icon;
            
            return (
              <button
                key={option.status}
                type="button"
                onClick={() => handleToggleStatus(option.status)}
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${
                  isActive
                    ? `${option.activeBg} ${option.activeColor} ${option.activeBorder} border font-semibold shadow-inner`
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white bg-zinc-900/60 border border-white/5 hover:border-white/20 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {isActive ? (
                      <Check className={`h-5 w-5 ${option.activeColor}`} />
                    ) : (
                      <Icon className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                    )}
                  </div>
                  <span className="tracking-wide">{isActive ? `In ${option.label}` : `Add to ${option.label}`}</span>
                </div>
                {isActive && (
                  <span className={`text-[10px] ${option.activeColor} font-black uppercase tracking-widest animate-in zoom-in duration-300`}>
                    Added
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Collections Section - Only show if saved to My Library */}
        {isSaved && (
          <div className="pt-2">
            <span className="px-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Collections</span>
            <div className="mt-2 space-y-1.5">
              {customCollections.length === 0 ? (
                <div className="px-3 py-3 rounded-xl bg-zinc-900/60 border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 font-medium">No custom collections yet.</p>
                </div>
              ) : (
                customCollections.map(col => {
                  const inCollection = (col as any).items?.some((i: any) => i.mediaId === media.mediaId) ?? false;
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
