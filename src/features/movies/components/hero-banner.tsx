'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Info, Star, Calendar, Film } from 'lucide-react';
import { Movie } from '@/types/movie';

interface HeroBannerProps {
  movies: Movie[];
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[activeIndex];
  const genreText = currentMovie.genres.length > 0 ? currentMovie.genres.join(', ') : 'Action';

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950">
      {/* Background Slides */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src={movie.backdropPath}
            alt={movie.title}
            fill
            priority={index === 0}
            className="object-cover object-center filter brightness-[0.8] saturate-110"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Cinematic Vignette Overlay Gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent lg:w-3/4 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[600px] flex-col justify-end px-6 sm:px-10 lg:px-16 pb-16 pt-32 mx-auto max-w-7xl w-full">
        <div 
          key={activeIndex} 
          className="max-w-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out"
        >
          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg leading-tight">
            {currentMovie.title}
          </h1>

          {/* Metadata Row (★ 7.8/10 · 🗓 2026 · 🚀 Genre) */}
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-zinc-200 drop-shadow">
            <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md backdrop-blur-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-bold">{currentMovie.voteAverage}/10</span>
            </div>
            <span className="text-zinc-500">•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <span>{currentMovie.releaseYear}</span>
            </div>
            <span className="text-zinc-500">•</span>
            <div className="flex items-center gap-1.5">
              <Film className="h-4 w-4 text-zinc-400" />
              <span>{genreText}</span>
            </div>
          </div>

          {/* Overview */}
          <p className="line-clamp-3 text-sm text-zinc-300 leading-relaxed sm:text-base max-w-xl drop-shadow">
            {currentMovie.overview}
          </p>

          {/* Action Button Row */}
          <div className="flex items-center gap-4 pt-4">
            {/* White Solid Play Button */}
            <Link href={`/${currentMovie.mediaKind === 'tv' ? 'tv' : 'movies'}/${currentMovie.id}`}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer select-none"
              >
                <Play className="h-4 w-4 fill-zinc-950 text-zinc-950 ml-0.5" />
                Play
              </button>
            </Link>

            {/* Circular Glassmorphic Add Button */}
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md text-white hover:bg-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              title="Add to Watchlist"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* Circular Glassmorphic Details Button */}
            <Link href={`/${currentMovie.mediaKind === 'tv' ? 'tv' : 'movies'}/${currentMovie.id}`}>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md text-white hover:bg-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                title="Details"
              >
                <Info className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Right Slide Pagination Dots */}
        <div className="absolute bottom-8 right-6 sm:bottom-10 sm:right-10 flex items-center gap-2 z-20">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'h-2 w-8 bg-white'
                  : 'h-2 w-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
