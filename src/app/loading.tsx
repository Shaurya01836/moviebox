import { HeroBannerSkeleton } from '@/features/movies/components/hero-banner-skeleton';
import { MovieCardSkeleton } from '@/components/shared/movie-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full pb-12 bg-zinc-950 min-h-screen">
      {/* Hero Spotlight Skeleton */}
      <HeroBannerSkeleton />

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 mt-8 space-y-12 sm:px-6 lg:px-8">
        {/* Genre Exploration Bar Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32 bg-zinc-800/60" />
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full bg-zinc-800/60 shrink-0" />
            ))}
          </div>
        </div>

        {/* Trending Movies Grid Skeleton */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-7 w-48 bg-zinc-800/80" />
            <Skeleton className="h-4 w-80 bg-zinc-800/50" />
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
