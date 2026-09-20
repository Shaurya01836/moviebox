'use client';

import * as React from 'react';
import { Plus, Check, Trash2 } from 'lucide-react';
import { useWatchlist } from '../context/watchlist-context';
import { MediaKind } from '@/types/movie';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  popover?: boolean;
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

export function WatchlistModal({ isOpen, onClose, media, popover = true }: WatchlistModalProps) {
  const { getByMediaId, upsert, remove } = useWatchlist();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

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
        status: 'watchlist',
      });
    }
    onClose();
  };

  const cardContent = (
    <div
      ref={dropdownRef}
      className={`${
        popover
          ? 'absolute top-full left-0 mt-2 z-[100] w-72 sm:w-80 animate-in zoom-in-95 duration-150'
          : 'relative w-full max-w-xs animate-in zoom-in-95 duration-150'
      } rounded-2xl border border-white/15 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-2xl shadow-black/90 space-y-2`}
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-white/10">
        <span className="text-xs font-bold text-white tracking-tight">Add to List</span>
        <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[120px]">{media.title}</span>
      </div>

      {/* Default Watchlist Option */}
      <button
        type="button"
        onClick={handleToggleDefaultList}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer select-none ${
          isSaved
            ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-semibold'
            : 'text-zinc-200 hover:bg-white/10 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          {isSaved ? <Check className="h-4 w-4 text-red-500" /> : <Plus className="h-4 w-4 text-zinc-400" />}
          <span>My Watchlist</span>
        </div>
        {isSaved && <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Added</span>}
      </button>

      {/* No Custom Lists Message */}
      <div className="px-3 py-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-center">
        <p className="text-[11px] text-zinc-400 font-medium">No custom lists yet. Create one below!</p>
      </div>

      {/* Create New List Button */}
      <button
        type="button"
        onClick={() => {
          handleToggleDefaultList();
        }}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4 text-red-500" />
        <span>+ Create New List</span>
      </button>

      {isSaved && (
        <button
          type="button"
          onClick={async () => {
            await remove(media.mediaId);
            onClose();
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer pt-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Remove from List</span>
        </button>
      )}
    </div>
  );

  if (popover) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {cardContent}
    </div>
  );
}
