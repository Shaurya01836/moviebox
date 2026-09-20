import Link from 'next/link';

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-zinc-900 bg-zinc-950/90 py-6 sm:py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8 text-center sm:text-left">
        {/* Left Brand & Copyright */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="font-extrabold tracking-tight text-white">
            Movie<span className="text-red-500">Box</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span>© {new Date().getFullYear()} MovieBox. All rights reserved.</span>
        </div>

        {/* Right Minimal Nav Links */}
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-zinc-400">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/watchlist" className="hover:text-white transition-colors">Watchlist</Link>
          <Link href="/search" className="hover:text-white transition-colors">Search</Link>
        </nav>
      </div>
    </footer>
  );
}
