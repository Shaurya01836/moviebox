import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Info, Sparkles } from 'lucide-react';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/shared/rating';

interface HeroBannerProps {
  movie: Movie;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 shadow-2xl">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={movie.backdropPath}
          alt={movie.title}
          fill
          priority
          className="object-cover object-center opacity-40 filter brightness-90 saturate-125"
        />
        {/* Gradient overlays for cinematic blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[500px] flex-col justify-end p-6 sm:p-10 lg:p-12">
        <div className="max-w-2xl space-y-4">
          {/* Top Tag */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent" className="gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-red-500" />
              Featured Spotlight
            </Badge>
            <Badge variant="glass" className="text-xs">
              {movie.releaseYear}
            </Badge>
            {movie.qualityBadge && (
              <Badge variant="glass" className="text-xs text-amber-300 border-amber-400/30">
                {movie.qualityBadge}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
            {movie.title}
          </h1>

          {/* Rating and Genres */}
          <div className="flex items-center gap-4 text-sm">
            <Rating value={movie.voteAverage} count={movie.voteCount} size="md" />
            <span className="text-zinc-600">•</span>
            <div className="flex gap-2">
              {movie.genres.map((genre) => (
                <span key={genre} className="text-xs text-zinc-300 font-medium">
                  {genre}
                </span>
              ))}
            </div>
            {movie.durationMinutes && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">{movie.durationMinutes} min</span>
              </>
            )}
          </div>

          {/* Overview */}
          <p className="line-clamp-3 text-sm text-zinc-300 leading-relaxed sm:text-base">
            {movie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link href={`/${movie.mediaKind === 'tv' ? 'tv' : 'movies'}/${movie.id}`}>
              <Button variant="primary" size="lg" className="shadow-red-600/40">
                <Play className="h-5 w-5 fill-white ml-0.5" />
                Watch Now
              </Button>
            </Link>
            <Button variant="glass" size="lg">
              <Plus className="h-5 w-5" />
              Add to Watchlist
            </Button>
            <Link href={`/${movie.mediaKind === 'tv' ? 'tv' : 'movies'}/${movie.id}`}>
              <Button variant="ghost" size="lg" className="text-zinc-300 hover:text-white">
                <Info className="h-5 w-5" />
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
