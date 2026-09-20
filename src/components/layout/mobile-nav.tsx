'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, Search, Calendar, BarChart3, User } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';
import { useProfile } from '@/features/profile/context/profile-context';
import { AVATAR_OPTIONS, getAvatarOption } from '@/features/profile/types';

interface MobileNavProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export function MobileNav({ onOpenAuth }: MobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeProfile, setIsPickerOpen } = useProfile();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { title: 'Home', href: '/', icon: Home },
    { title: 'Search', href: '/search', icon: Search },
    { title: 'Library', href: '/watchlist', icon: Bookmark },
    { title: 'Timeline', href: '/timeline', icon: Calendar },
    { title: 'Stats', href: '/stats', icon: BarChart3 },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-red-500 font-semibold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
              }`}
            >
              <div className={`relative p-1 rounded-full transition-colors ${isActive ? 'bg-red-500/15' : ''}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-red-500 stroke-[2.5]' : 'text-zinc-400 stroke-2'}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] tracking-tight leading-none">{item.title}</span>
            </Link>
          );
        })}

        {/* Auth / Profile Tab */}
        <button
          onClick={() => {
            if (user && activeProfile) {
              setIsPickerOpen(true);
            } else if (onOpenAuth) {
              onOpenAuth('login');
            }
          }}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-2 rounded-xl transition-all duration-200 select-none text-zinc-400 hover:text-zinc-200 active:scale-95`}
        >
          <div className="relative flex items-center justify-center">
            {user && activeProfile ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600/80 shadow-md overflow-hidden p-0.5 border border-white/20">
                <img
                  src={getAvatarOption(activeProfile.avatarUrl).url}
                  alt={activeProfile.name}
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            ) : user ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[10px] shadow-md">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="p-1">
                <User className="h-5 w-5 text-zinc-400 stroke-2" />
              </div>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none max-w-[56px] truncate">
            {user && activeProfile ? activeProfile.name : user ? 'Profile' : 'Sign In'}
          </span>
        </button>
      </nav>
    </div>
  );
}


