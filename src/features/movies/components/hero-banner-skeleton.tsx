import { Skeleton } from '@/components/ui/skeleton';

export function HeroBannerSkeleton() {
  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 min-h-[480px] sm:min-h-[580px] lg:min-h-[680px]">
      {/* Background Gradient Mock */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-900/60 to-zinc-950 animate-pulse" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent lg:w-3/4 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[480px] sm:min-h-[580px] lg:min-h-[680px] flex-col justify-end px-4 sm:px-10 lg:px-16 pb-12 sm:pb-16 pt-24 sm:pt-32 mx-auto max-w-7xl w-full">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          {/* Title Skeleton */}
          <Skeleton className="h-10 sm:h-16 w-3/4 sm:w-2/3 bg-zinc-800/80 rounded-2xl" />

          {/* Metadata Row Skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16 bg-zinc-800/60 rounded-md" />
            <Skeleton className="h-5 w-12 bg-zinc-800/60 rounded-md" />
            <Skeleton className="h-5 w-24 bg-zinc-800/60 rounded-md" />
          </div>

          {/* Overview Skeleton */}
          <div className="space-y-2 max-w-xl">
            <Skeleton className="h-4 w-full bg-zinc-800/60" />
            <Skeleton className="h-4 w-5/6 bg-zinc-800/60" />
            <Skeleton className="h-4 w-2/3 bg-zinc-800/60" />
          </div>

          {/* Action Button Row Skeleton */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-10 sm:h-12 w-28 sm:w-36 rounded-full bg-zinc-800/90" />
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-zinc-800/70" />
            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-zinc-800/70" />
          </div>
        </div>

        {/* Pagination Dots Skeleton */}
        <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 flex items-center gap-2 z-20">
          <Skeleton className="h-2 w-8 rounded-full bg-zinc-700" />
          <Skeleton className="h-2 w-2 rounded-full bg-zinc-800" />
          <Skeleton className="h-2 w-2 rounded-full bg-zinc-800" />
        </div>
      </div>
    </section>
  );
}
