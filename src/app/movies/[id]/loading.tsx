import { Skeleton } from '@/components/ui/skeleton';

export default function MovieLoading() {
  return (
    <div className="min-h-screen bg-[#10161a] pb-24">
      {/* Immersive Backdrop Skeleton */}
      <div className="relative min-h-[60vh] sm:min-h-[85vh] w-full bg-zinc-950 overflow-hidden">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-zinc-900/60 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10161a] via-[#10161a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10161a] via-[#10161a]/60 to-transparent lg:w-2/3" />

        {/* Back Button Skeleton */}
        <div className="absolute top-4 left-4 z-20 sm:top-6 sm:left-6 lg:top-8 lg:left-10">
          <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
        </div>

        {/* Content Container Skeleton */}
        <div className="relative z-10 flex min-h-[60vh] sm:min-h-[85vh] flex-col justify-center px-4 pt-20 pb-10 sm:px-8 sm:pt-24 lg:px-16 mx-auto max-w-[1600px]">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-8 lg:gap-12 w-full">
            
            {/* Left Side Skeleton */}
            <div className="max-w-3xl space-y-4 sm:space-y-5 w-full">
              <Skeleton className="h-10 sm:h-14 w-3/4 sm:w-2/3 bg-zinc-800/80 rounded-2xl" />
              <Skeleton className="h-4 w-48 bg-zinc-800/60" />
              
              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-10 sm:h-12 w-28 sm:w-36 rounded-full bg-zinc-800/90" />
                <Skeleton className="h-10 sm:h-12 w-32 sm:w-40 rounded-full bg-zinc-800/70" />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Skeleton className="h-5 w-12 bg-zinc-800/60" />
                <Skeleton className="h-5 w-16 bg-zinc-800/60" />
                <Skeleton className="h-5 w-12 bg-zinc-800/60" />
              </div>

              <div className="space-y-2 pt-2 max-w-2xl">
                <Skeleton className="h-4 w-full bg-zinc-800/60" />
                <Skeleton className="h-4 w-5/6 bg-zinc-800/60" />
                <Skeleton className="h-4 w-4/6 bg-zinc-800/60" />
              </div>
            </div>

            {/* Right Side Metadata Box Skeleton */}
            <div className="w-full lg:w-72 rounded-xl bg-zinc-900/60 border border-white/10 p-4 backdrop-blur-md shrink-0 space-y-3">
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
            </div>

          </div>
        </div>
      </div>

      {/* Cast Slider Skeleton */}
      <div className="py-8 sm:py-12 px-4 sm:px-8 lg:px-16 mx-auto max-w-[1600px]">
        <Skeleton className="h-7 w-24 bg-zinc-800/80 mb-6" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 w-20 sm:w-32 shrink-0">
              <Skeleton className="h-16 w-16 sm:h-28 sm:w-28 rounded-full bg-zinc-800/70" />
              <Skeleton className="h-3.5 w-16 bg-zinc-800/60" />
              <Skeleton className="h-3 w-12 bg-zinc-800/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
