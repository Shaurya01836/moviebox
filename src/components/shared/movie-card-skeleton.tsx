import { Skeleton } from '@/components/ui/skeleton';

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col space-y-2.5">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/5">
        <Skeleton className="h-full w-full rounded-2xl bg-zinc-800/50" />
      </div>

      {/* Details Skeleton */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-10 bg-zinc-800/60" />
          <Skeleton className="h-3 w-12 bg-zinc-800/60" />
        </div>
        <Skeleton className="h-4 w-5/6 bg-zinc-800/70" />
        <div className="flex gap-1.5 pt-0.5">
          <Skeleton className="h-3.5 w-12 rounded-full bg-zinc-800/50" />
          <Skeleton className="h-3.5 w-14 rounded-full bg-zinc-800/50" />
        </div>
      </div>
    </div>
  );
}
