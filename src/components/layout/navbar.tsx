'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Bookmark, Calendar, BarChart3, Search, User, LogOut, Settings } from 'lucide-react';
import { MobileNav } from './mobile-nav';
import { useAuth } from '@/features/auth/context/auth-context';
import { useProfile } from '@/features/profile/context/profile-context';
import { AVATAR_OPTIONS, getAvatarOption } from '@/features/profile/types';
import { AuthModal } from '@/features/auth/components/auth-modal';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const { user, signOut } = useAuth();
  const { activeProfile, setIsPickerOpen, clearActiveProfile } = useProfile();

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

  const headerClasses = 'fixed top-0 z-50 w-full py-2 bg-transparent border-transparent transition-all duration-300';

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
          {/* Top Left Brand Logo (Desktop Only) */}
          <Link href="/" className="hidden md:flex items-center group select-none">
            <div className="flex items-center px-4 py-1.5 rounded-full transition-all active:scale-95">
              <span className="text-lg font-bold tracking-tight text-white">
                Movie<span className="text-red-500 font-bold"> Box</span>
              </span>
            </div>
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

              {/* Profile & Account Dropdown Trigger */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-full bg-white/10 pl-1.5 pr-3 py-1 text-xs font-semibold text-zinc-200 hover:bg-white/20 transition-all cursor-pointer border border-white/15 backdrop-blur-md shadow-lg"
                    aria-label="Profile menu"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs shadow-md overflow-hidden p-0.5">
                      <img
                        src={getAvatarOption(activeProfile?.avatarUrl).url}
                        alt="Avatar"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                    <span className="max-w-[80px] truncate">{activeProfile?.name || 'Profile'}</span>
                  </button>

                  {/* Dropdown Menu with Enhanced Glassmorphism */}
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/15 bg-zinc-950/75 p-2 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 animate-in zoom-in-95 duration-150 z-50 shadow-black/80"
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      {/* Active Profile Info Header */}
                      <div className="flex items-center gap-3 p-2.5 border-b border-white/10">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 shadow-md overflow-hidden p-0.5">
                          <img
                            src={getAvatarOption(activeProfile?.avatarUrl).url}
                            alt="Avatar"
                            className="h-full w-full object-cover rounded-full"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{activeProfile?.name || 'User Profile'}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="pt-1.5 space-y-1">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsPickerOpen(true);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                          <Settings className="h-4 w-4 text-zinc-400" />
                          <span>Manage Profile & Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            clearActiveProfile();
                            signOut();
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/15 transition-colors border-t border-white/5 pt-2 cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-red-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-all cursor-pointer shadow-lg shadow-red-950/50 active:scale-95 border border-red-500/30"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </nav>
          </div>

          {/* Mobile Top Header Actions with Frosted Glass Floating Pill */}
          <div className="flex md:hidden items-center ml-auto">
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 p-1.5 backdrop-blur-2xl shadow-xl shadow-black/30">
              <Link
                href="/search"
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  pathname === '/search'
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-300 hover:text-white'
                }`}
                aria-label="Search"
              >
                <Search className="h-3.5 w-3.5" />
              </Link>

              {user ? (
                <button
                  onClick={() => {
                    clearActiveProfile();
                    signOut();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-400" />
                </button>
              ) : (
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-md cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Independent of top header) */}
      <MobileNav onOpenAuth={handleOpenAuth} />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}
