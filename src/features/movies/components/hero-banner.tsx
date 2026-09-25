'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Info, Star, Calendar, Film, Check } from 'lucide-react';
import { Movie } from '@/types/movie';
import { WatchlistModal } from '@/features/watchlist/components/watchlist-modal';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';

interface HeroBannerProps {
  movies: Movie[];
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number; align?: 'top' | 'bottom' } | null>(null);
  const { getByMediaId } = useWatchlist();

  // Swipe and Drag handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const minSwipeDistance = 50;

  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setTouchEnd(null);
    setDragOffset(0);
    if ('touches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart(e.clientX);
      setIsDragging(true);
    }
  };

  const onDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      const currentX = e.targetTouches[0].clientX;
      setTouchEnd(currentX);
      if (touchStart !== null) {
        setDragOffset(currentX - touchStart);
      }
    } else if (isDragging) {
      const currentX = e.clientX;
      setTouchEnd(currentX);
      if (touchStart !== null) {
        setDragOffset(currentX - touchStart);
      }
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
    if (!touchStart || !touchEnd) {
      setDragOffset(0);
      return;
    }
    const distance = touchStart - touchEnd;
    
    if (distance > minSwipeDistance) {
      setActiveIndex((current) => (current + 1) % movies.length);
    } else if (distance < -minSwipeDistance) {
      setActiveIndex((current) => (current - 1 + movies.length) % movies.length);
    }
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    if (!movies || movies.length <= 1 || isDragging) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [movies, isDragging]);

  if (!movies || movies.length === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden bg-zinc-950 cursor-grab active:cursor-grabbing select-none group"
      onTouchStart={onDragStart}
      onTouchMove={onDragMove}
      onTouchEnd={onDragEnd}
      onMouseDown={onDragStart}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
    >
      {/* Horizontal Carousel Track */}
      <div 
        className={`flex w-full h-full ${isDragging ? '' : 'transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'}`}
        style={{ transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))` }}
      >
        {movies.map((movie, index) => {
          const genreText = movie.genres.length > 0 ? movie.genres.join(', ') : 'Action';
          const isLogged = Boolean(getByMediaId(movie.id));

          return (
            <div key={movie.id} className="relative min-w-full h-full flex-shrink-0 flex items-end">
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={movie.backdropPath}
                  alt={movie.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center filter brightness-[0.8] saturate-110 pointer-events-none"
                  sizes="100vw"
                />
              </div>

              {/* Cinematic Vignette Overlay Gradients */}
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent lg:w-3/4 pointer-events-none" />

              {/* Content Container */}
              <div className="relative z-10 flex min-h-[480px] sm:min-h-[580px] lg:min-h-[680px] flex-col justify-end px-4 sm:px-10 lg:px-16 pb-12 sm:pb-16 pt-24 sm:pt-32 mx-auto max-w-7xl w-full">
                <div className={`max-w-2xl space-y-3.5 sm:space-y-5 transition-all duration-700 ${index === activeIndex && !isDragging ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  {/* Title */}
                  {movie.logoPath ? (
                    <div className="relative h-14 w-40 sm:h-28 sm:w-72 md:h-32 md:w-80 lg:h-40 lg:w-[450px] mb-2 drop-shadow-2xl pointer-events-none">
                      <Image 
                        src={movie.logoPath} 
                        alt={movie.title}
                        fill
                        className="object-contain object-left"
                        sizes="(max-width: 768px) 240px, 450px"
                        priority={index === 0}
                      />
                    </div>
                  ) : (
                    <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight pointer-events-none">
                      {movie.title}
                    </h1>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-zinc-200 drop-shadow pointer-events-none">
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-0.5 sm:py-1 rounded-md backdrop-blur-sm">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                      <span className="text-white font-bold">{movie.voteAverage}/10</span>
                    </div>
                    <span className="text-zinc-500">•</span>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                      <span>{movie.releaseYear}</span>
                    </div>
                    <span className="text-zinc-500">•</span>
                    <div className="flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
                      <span className="truncate max-w-[140px] sm:max-w-none">{genreText}</span>
                    </div>
                  </div>

                  {/* Overview */}
                  <p className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-base text-zinc-300 leading-relaxed max-w-xl drop-shadow pointer-events-none">
                    {movie.overview}
                  </p>

                  {/* Action Button Row */}
                  <div className="flex items-center gap-2.5 sm:gap-4 pt-2 sm:pt-4">
                    <Link href={`/play/${movie.mediaKind === 'tv' ? 'tv' : 'movie'}/${movie.id}${movie.mediaKind === 'tv' ? '/1/1' : ''}`} draggable={false}>
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-full bg-white px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer select-none"
                      >
                        <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-zinc-950 text-zinc-950 ml-0.5" />
                        Play
                      </button>
                    </Link>

                    <button
                      type="button"
                      onClick={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setModalPosition({
                          x: rect.left,
                          y: rect.top - 8,
                          align: 'bottom'
                        });
                      }}
                      className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                        isLogged
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'
                          : 'bg-white/15 text-white border-white/20 hover:bg-white/30 backdrop-blur-md'
                      }`}
                      title="Add to Watchlist"
                    >
                      {isLogged ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>

                    <Link href={`/${movie.mediaKind === 'tv' ? 'tv' : 'movies'}/${movie.id}`} draggable={false}>
                      <button
                        type="button"
                        className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md text-white hover:bg-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                        title="Details"
                      >
                        <Info className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Right Slide Pagination Dots */}
      <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 flex items-center gap-1.5 sm:gap-2 z-20">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'h-1.5 sm:h-2 w-6 sm:w-8 bg-white'
                : 'h-1.5 sm:h-2 w-1.5 sm:w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Watchlist Modal Editor */}
      <WatchlistModal
        isOpen={Boolean(modalPosition)}
        onClose={() => setModalPosition(null)}
        position={modalPosition}
        media={movies[activeIndex] ? {
          mediaId: movies[activeIndex].id,
          mediaKind: movies[activeIndex].mediaKind === 'tv' ? 'tv' : 'movie',
          title: movies[activeIndex].title,
          posterPath: movies[activeIndex].posterPath,
          backdropPath: movies[activeIndex].backdropPath,
          logoPath: movies[activeIndex].logoPath,
          releaseYear: movies[activeIndex].releaseYear,
          voteAverage: movies[activeIndex].voteAverage,
          genres: movies[activeIndex].genres,
        } : null}
      />
    </section>
  );
}
