import Link from 'next/link';
import { Play, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from './mobile-nav';
import { siteConfig } from '@/lib/config/site';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-red-500 shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Movie<span className="text-red-500">Box</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-red-400"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <Link href="/search" className="hidden sm:block">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <span>Search movies...</span>
              <kbd className="pointer-events-none ml-4 inline-flex h-5 select-none items-center gap-1 rounded border border-zinc-800 bg-zinc-950 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                ⌘K
              </kbd>
            </div>
          </Link>

          <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-zinc-300 hover:text-white">
            <User className="h-4 w-4 mr-1.5" />
            Sign In
          </Button>

          <Button variant="primary" size="sm" className="hidden sm:inline-flex">
            Get Started
          </Button>

          {/* Mobile menu */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
