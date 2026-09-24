'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Check, X, Clock, Repeat, Tv, Film } from 'lucide-react';
import { WatchHistoryItem } from '@/features/history/types';
import { HistoryService } from '@/features/history/services/history.service';

interface HistoryCardProps {
  item: WatchHistoryItem;
  onRemove: (id: string) => void;
}

export function HistoryCard({ item, onRemove }: HistoryCardProps) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Remove this title from your Watch History?')) {
      setIsRemoving(true);
      const success = await HistoryService.deleteHistory(item.userId, item.id);
      if (success) onRemove(item.id);
      else setIsRemoving(false);
    }
  };

  const progressPct = item.durationSeconds > 0 
    ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
    : 0;

  const linkUrl = item.mediaKind === 'movie' 
    ? `/movies/${item.mediaId}`
    : `/tv/${item.mediaId}`;

  const playUrl = item.mediaKind === 'movie'
    ? `/play/movie/${item.mediaId}`
    : `/play/tv/${item.mediaId}/${item.seasonNumber}/${item.episodeNumber}`;

  return (
    <div className={`relative group flex gap-4 p-4 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all duration-300 ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Poster */}
      <Link href={linkUrl} className="shrink-0 relative w-24 sm:w-28 rounded-lg overflow-hidden border border-white/10 shadow-lg aspect-[2/3]">
        <img src={item.posterPath} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-8 h-8 text-white fill-white drop-shadow-md" />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          {item.mediaKind === 'movie' ? (
            <><Film className="w-3.5 h-3.5" /> Movie</>
          ) : (
            <><Tv className="w-3.5 h-3.5" /> S{item.seasonNumber} E{item.episodeNumber}</>
          )}
          {item.watchCount > 1 && (
            <span className="flex items-center gap-1 text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded ml-2">
              <Repeat className="w-3 h-3" /> Watched {item.watchCount}x
            </span>
          )}
        </div>
        
        <Link href={linkUrl} className="text-lg sm:text-xl font-bold text-white hover:text-red-400 transition-colors line-clamp-1 mb-3">
          {item.title}
        </Link>

        {/* Status / Progress */}
        <div className="mt-auto">
          {item.isCompleted ? (
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-500">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <Check className="w-3 h-3" />
              </div>
              Completed
            </div>
          ) : (
            <div className="space-y-1.5 max-w-[200px]">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={handleRemove}
          title="Remove from History"
          className="p-1.5 rounded-full bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="hidden sm:flex absolute bottom-4 right-4 flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={playUrl} className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shadow-lg">
          {item.isCompleted ? 'Watch Again' : 'Resume'}
        </Link>
      </div>
    </div>
  );
}
