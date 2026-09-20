'use client';

import * as React from 'react';
import { Plus, Check } from 'lucide-react';
import { WatchlistModal } from '@/features/watchlist/components/watchlist-modal';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';
import { MovieDetails, TvDetails } from '@/types/movie';

interface WatchlistActionButtonProps {
  media: MovieDetails | TvDetails;
  mediaKind: 'movie' | 'tv';
}

export function WatchlistActionButton({ media, mediaKind }: WatchlistActionButtonProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { getByMediaId } = useWatchlist();
  
  const isLogged = Boolean(getByMediaId(media.id));

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsModalOpen(!isModalOpen)}
        className={`flex items-center gap-2 rounded-full px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-base font-bold transition-all shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer select-none shrink-0 ${
          isLogged
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
            : 'bg-zinc-800/80 border border-zinc-700/60 text-white hover:bg-zinc-700'
        }`}
      >
        {isLogged ? (
          <>
            <Check className="h-4 w-4 sm:h-5 sm:w-5 font-bold" />
            In My List
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Add to Watchlist
          </>
        )}
      </button>

      <WatchlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        popover
        media={{
          mediaId: media.id,
          mediaKind,
          title: media.title,
          posterPath: media.posterPath,
          backdropPath: media.backdropPath,
          logoPath: media.logoPath,
          releaseYear: media.releaseYear,
          voteAverage: media.voteAverage,
          genres: media.genres,
        }}
      />
    </div>
  );
}
