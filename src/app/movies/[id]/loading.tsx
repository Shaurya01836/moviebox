import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function MovieLoading() {
  return (
    <div className="relative min-h-screen pb-20 bg-zinc-950">
      {/* Backdrop Skeleton */}
      <div className="relative h-[60vh] w-full lg:h-[75vh] bg-zinc-900 overflow-hidden">
        <Skeleton className="h-full w-full rounded-none bg-zinc-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
      </div>

      {/* Content Skeleton */}
      <div className="relative z-10 -mt-[40vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Poster Skeleton */}
          <div className="hidden sm:block shrink-0 z-20">
            <Skeleton className="h-[450px] w-[300px] rounded-2xl bg-zinc-900 border border-white/5" />
          </div>

          {/* Details Skeleton */}
          <div className="flex flex-col justify-end pt-4 lg:pt-16 pb-12 w-full space-y-4">
            <div className="flex items-center gap-2 text-red-500 font-semibold text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading Details...</span>
            </div>
            <Skeleton className="h-12 w-3/4 bg-zinc-900" />
            <Skeleton className="h-6 w-1/2 bg-zinc-900" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-36 rounded-full bg-zinc-900" />
              <Skeleton className="h-12 w-44 rounded-full bg-zinc-900" />
            </div>
            <Skeleton className="h-24 w-full bg-zinc-900 mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
