import Link from 'next/link';
import { Play, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-red-600 to-red-500">
                <Play className="h-4 w-4 text-white fill-white ml-0.5" />
              </div>
              <span className="text-lg font-bold text-white">
                Movie<span className="text-red-500">Box</span>
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-zinc-400">
              MovieBox is a modern frontend architecture foundation designed for high-performance movie & TV streaming experiences, watchlist management, and community reviews.
            </p>
            <div className="flex items-center gap-4 text-zinc-400 pt-2">
              <Link href="#" className="hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Browse</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/movies" className="hover:text-white transition-colors">Movies</Link>
              </li>
              <li>
                <Link href="/tv" className="hover:text-white transition-colors">TV Shows</Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-white transition-colors">Trending</Link>
              </li>
              <li>
                <Link href="/top-rated" className="hover:text-white transition-colors">Top Rated</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Account</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/watchlist" className="hover:text-white transition-colors">My Watchlist</Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">Profile</Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-white transition-colors">Watch History</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Legal</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Preferences</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} MovieBox Inc. Designed for clean scalable architecture.
        </div>
      </div>
    </footer>
  );
}
