import Link from 'next/link';
import { BarChart3, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StatsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-4 items-center justify-center relative">
      <div className="relative max-w-md w-full text-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-white/10 bg-zinc-950/70 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/80">
        
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-red-500 shadow-md">
          <BarChart3 className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Analytics Coming Soon
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            Deep insights into your top genres, total watch time, and ratings distribution are on the way.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button
              className="w-full rounded-xl bg-white py-3 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-transform active:scale-95 shadow-lg cursor-pointer"
            >
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
