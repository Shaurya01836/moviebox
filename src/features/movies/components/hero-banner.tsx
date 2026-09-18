import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Info, Star, Calendar, Film } from 'lucide-react';
import { Movie } from '@/types/movie';

interface HeroBannerProps {
  movie: Movie;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  const genreText = movie.genres.length > 0 ? movie.genres.join(', ') : 'Action';

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={movie.backdropPath}
          alt={movie.title}
          fill
          priority
          className="object-cover object-center filter brightness-90 saturate-110"
          sizes="100vw"
        />
        {/* Cinematic Vignette Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/50 to-transparent lg:w-3/4" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[520px] flex-col justify-end p-6 sm:p-10 lg:p-14">
        <div className="max-w-xl space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
            {movie.title}
          </h1>

          {/* Metadata Row (★ 7.8/10 · 🗓 2026 · 🚀 Genre) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-300 sm:text-sm drop-shadow">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-bold">{movie.voteAverage}/10</span>
            </div>
            <span className="text-zinc-500">•</span>
            <div className="flex items-center gap-1 text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>{movie.releaseYear}</span>
            </div>
            <span className="text-zinc-500">•</span>
            <div className="flex items-center gap-1 text-zinc-300">
              <Film className="h-3.5 w-3.5 text-zinc-400" />
              <span>{genreText}</span>
            </div>
          </div>

          {/* Overview */}
          <p className="line-clamp-3 text-xs text-zinc-300 leading-relaxed sm:text-sm max-w-lg drop-shadow">
            {movie.overview}
          </p>

          {/* Action Button Row */}
          <div className="flex items-center gap-3 pt-4">
            {/* White Solid Play Button */}
            <Link href={`/${movie.mediaKind === 'tv' ? 'tv' : 'movies'}/${movie.id}`}>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-extrabold text-zinc-950 hover:bg-zinc-200 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer select-none"
              >
                <Play className="h-4 w-4 fill-zinc-950 text-zinc-950 ml-0.5" />
                Play
              </button>
            </Link>

            {/* Circular Glassmorphic Add Button */}
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md text-white hover:bg-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              title="Add to Watchlist"
            >
              <Plus className="h-5 w-5" />
            </button>

            {/* Circular Glassmorphic Details Button */}
            <Link href={`/${movie.mediaKind === 'tv' ? 'tv' : 'movies'}/${movie.id}`}>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 backdrop-blur-md text-white hover:bg-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                title="Details"
              >
                <Info className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Right Slide Pagination Dots */}
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex items-center gap-1.5 opacity-80">
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-6 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  );
}
