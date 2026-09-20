import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 px-4 items-center justify-center relative">
      <div className="relative max-w-md w-full text-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-white/10 bg-zinc-950/70 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/80">
        
        {/* Minimal 404 Badge */}
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-mono font-bold text-red-500">
          <span>ERROR 404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved.
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
