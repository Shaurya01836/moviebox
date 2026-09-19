'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Bookmark, Calendar, BarChart3, Search, User, LogOut } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { useAuth } from '@/features/auth/context/auth-context';
import { AuthModal } from '@/features/auth/components/auth-modal';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shortcut Ctrl+K / Cmd+K behavior:
  // If on /search, Ctrl+K / ESC goes back to Home (/)
  // If NOT on /search, Ctrl+K navigates to /search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (pathname === '/search') {
          router.push('/');
        } else {
          router.push('/search');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, router]);

  const headerClasses = `fixed top-0 z-50 w-full transition-all duration-300 ${
    isScrolled 
      ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 py-0' 
      : 'bg-transparent border-transparent py-2'
  }`;

  const navItems = [
    { title: 'Home', href: '/', icon: Home },
    { title: 'My Library', href: '/watchlist', icon: Bookmark },
    { title: 'Timeline', href: '/timeline', icon: Calendar },
    { title: 'Analytics', href: '/stats', icon: BarChart3 },
  ];

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className={headerClasses}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Top Left Brand Logo */}
          <Link href="/" className="flex items-center group">
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

              {/* Professional Search Page Link / Trigger */}
              <Link
                href="/search"
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                  pathname === '/search'
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-300 hover:bg-white/15 hover:text-white'
                }`}
                title="Search (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/10 hidden sm:block">Ctrl K</span>
              </Link>

              {/* User Authentication Pill / Menu */}
              {user ? (
                <div className="flex items-center gap-2 pl-1 pr-2">
                  <span className="text-xs font-medium text-zinc-200 max-w-[100px] truncate" title={user.email || ''}>
                    {user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-colors cursor-pointer shadow-md"
                >
                  <User className="h-3.5 w-3.5" />
                  Sign In
                </button>
              )}
            </nav>
          </div>

          {/* Mobile Drawer Toggle */}
          <div className="md:hidden">
            <MobileNav onOpenAuth={handleOpenAuth} />
          </div>
        </div>
      </header>

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}
