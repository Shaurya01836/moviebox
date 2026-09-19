import { Skeleton } from '@/components/ui/skeleton';

export function WatchlistHeroSkeleton() {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh]">
      {/* Background Mock */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-zinc-950 animate-pulse" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent lg:w-3/4 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[50vh] sm:min-h-[60vh] lg:min-h-[70vh] flex-col justify-end px-4 sm:px-10 lg:px-16 pb-12 sm:pb-16 pt-24 sm:pt-32 mx-auto max-w-7xl w-full">
        <div className="max-w-2xl space-y-4 sm:space-y-5">
          {/* Badge Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-28 rounded-full bg-zinc-800/80" />
            <Skeleton className="h-6 w-32 rounded-full bg-zinc-800/60" />
          </div>

          {/* Title Skeleton */}
          <Skeleton className="h-10 sm:h-14 w-3/4 sm:w-2/3 bg-zinc-800/80 rounded-xl" />

          {/* Sub-meta Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-12 bg-zinc-800/60" />
            <Skeleton className="h-4 w-32 bg-zinc-800/60" />
          </div>

          {/* Review Quote Skeleton */}
          <Skeleton className="h-12 w-full max-w-xl bg-zinc-800/50 rounded-lg" />

          {/* Actions Skeleton */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-11 w-32 rounded-full bg-zinc-800/90" />
            <Skeleton className="h-11 w-28 rounded-full bg-zinc-800/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
