'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Film, Tv, Bookmark, Search, Settings } from 'lucide-react';
import { MobileNav } from './mobile-nav';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const isHome = pathname === '/';
  
  // On home page, we want it fixed and transparent at the top. On other pages, sticky and blurred.
  const headerClasses = isHome
    ? `fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 py-0' 
          : 'bg-transparent border-transparent py-2'
      }`
    : 'sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 transition-all';

  const navItems = [
    { title: 'Home', href: '/', icon: Home },
    { title: 'Movies', href: '/movies', icon: Film },
    { title: 'Shows', href: '/tv', icon: Tv },
    { title: 'My List', href: '/watchlist', icon: Bookmark },
  ];

  return (
    <header className={headerClasses}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Top Left Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 backdrop-blur-md shadow-lg group-hover:scale-105 transition-transform">
            <svg
              className="h-5 w-5 text-white fill-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 4v2h3V7H6zm5 0v2h3V7h-3zm5 0v2h3V7h-3zM6 11v2h3v-2H6zm5 0v2h3v-2h-3zm5 0v2h3v-2h-3zM6 15v2h3v-2H6zm5 0v2h3v-2h-3zm5 0v2h3v-2h-3z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Movie<span className="text-red-500">Box</span>
          </span>
        </Link>

        {/* Right Glassmorphic Floating Pill Header Navigation */}
        <div className="hidden md:flex items-center">
          <nav className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1.5 backdrop-blur-2xl shadow-xl shadow-black/30">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 select-none ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-md scale-100'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isActive && <Icon className="h-3.5 w-3.5 fill-zinc-950 text-zinc-950" />}
                  <span>{item.title}</span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="mx-1.5 h-4 w-px bg-white/20" />

            {/* Search Action Icon */}
            <button
              onClick={() => router.push('/search')}
              className="flex items-center gap-1.5 rounded-full text-zinc-300 hover:bg-white/15 hover:text-white px-3 py-1.5 transition-colors"
              title="Search (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/10 hidden sm:block">Ctrl K</span>
            </button>

            {/* Settings Action Icon */}
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/15 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </nav>
        </div>

        {/* Mobile Drawer Toggle */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
