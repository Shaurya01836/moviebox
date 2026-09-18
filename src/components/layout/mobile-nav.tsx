'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X, Bookmark, Search, Home, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
        className="text-zinc-200 hover:text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-zinc-800 bg-zinc-950/95 p-6 backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-zinc-200 hover:text-red-500 transition-colors"
            >
              <Home className="h-5 w-5 text-red-500" />
              Home
            </Link>
            <Link
              href="/watchlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-zinc-200 hover:text-red-500 transition-colors"
            >
              <Bookmark className="h-5 w-5 text-zinc-400" />
              My Library
            </Link>
            <Link
              href="/timeline"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-zinc-200 hover:text-red-500 transition-colors"
            >
              <Calendar className="h-5 w-5 text-zinc-400" />
              Timeline
            </Link>
            <Link
              href="/stats"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-base font-medium text-zinc-200 hover:text-red-500 transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-zinc-400" />
              Analytics
            </Link>

            <div className="pt-4 border-t border-zinc-800 flex flex-col gap-3">
              <Link href="/search" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Search className="h-4 w-4" />
                  Search Movies & Shows...
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
