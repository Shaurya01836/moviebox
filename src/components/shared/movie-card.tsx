'use client';

import * as React from 'react';
import Link from 'next/link';
import { Play, Plus, Check } from 'lucide-react';
import { Movie } from '@/types/movie';
import { Poster } from './poster';
import { Rating } from './rating';
import { GenreBadge } from './genre-badge';
import { Badge } from '@/components/ui/badge';
import { WatchlistModal } from '@/features/watchlist/components/watchlist-modal';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { getByMediaId } = useWatchlist();
  
  const isLogged = Boolean(getByMediaId(movie.id));

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="group relative flex flex-col space-y-2.5 transition-all">
        {/* Poster Image Container */}
        <Link href={`/${movie.mediaKind === 'tv' ? 'tv' : 'movies'}/${movie.id}`} className="relative block overflow-hidden rounded-2xl">
          <Poster src={movie.posterPath} alt={movie.title} priority={index !== undefined && index < 8} />

          {/* Quality or Age Badge */}
          {movie.qualityBadge && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="glass" className="bg-black/60 backdrop-blur-md border-white/20 text-[10px]">
                {movie.qualityBadge}
              </Badge>
            </div>
          )}

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-zinc-950/60 opacity-0 backdrop-blur-xs transition-all duration-300 group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 transition-transform group-hover:scale-110">
              <Play className="h-5 w-5 fill-white ml-0.5" />
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors cursor-pointer ${
                isLogged
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-zinc-800/80 text-white border-zinc-700/60 hover:bg-zinc-700'
              }`}
              title={isLogged ? 'Edit in My List' : 'Add to My List'}
            >
              {isLogged ? <Check className="h-4 w-4 font-bold" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
        </Link>

        {/* Details */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{movie.releaseYear}</span>
            <Rating value={movie.voteAverage} />
          </div>

          <Link href={`/${movie.mediaKind === 'tv' ? 'tv' : 'movies'}/${movie.id}`} className="block">
            <h3 className="line-clamp-1 text-sm font-semibold text-zinc-100 group-hover:text-red-400 transition-colors">
              {movie.title}
            </h3>
          </Link>

          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              <GenreBadge name={movie.genres[0]} />
              {movie.genres[1] && <GenreBadge name={movie.genres[1]} />}
            </div>
          )}
        </div>
      </div>

      {/* Watchlist Modal Editor */}
      <WatchlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        media={{
          mediaId: movie.id,
          mediaKind: movie.mediaKind === 'tv' ? 'tv' : 'movie',
          title: movie.title,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          releaseYear: movie.releaseYear,
          voteAverage: movie.voteAverage,
          genres: movie.genres,
        }}
      />
    </>
  );
}
