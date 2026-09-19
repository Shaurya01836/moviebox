'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bookmark, Search, Home, Calendar, BarChart3, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/auth-context';

interface MobileNavProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export function MobileNav({ onOpenAuth }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { title: 'Home', href: '/', icon: Home },
    { title: 'My Library', href: '/watchlist', icon: Bookmark },
    { title: 'Timeline', href: '/timeline', icon: Calendar },
    { title: 'Analytics', href: '/stats', icon: BarChart3 },
  ];

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
        <div className="fixed inset-x-0 top-16 z-50 border-b border-zinc-800/80 bg-zinc-950/95 p-5 backdrop-blur-xl animate-in slide-in-from-top duration-200 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-red-600/15 text-red-500 font-semibold border border-red-500/20'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-red-500' : 'text-zinc-400'}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}

            <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-3">
              <Link href="/search" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-2.5 bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Search className="h-4 w-4 text-zinc-400" />
                  Search Movies & Shows...
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center justify-between rounded-xl bg-zinc-900/80 p-3 border border-zinc-800">
                  <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-500 font-bold text-xs border border-red-500/30">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-zinc-200 truncate">
                      {user.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 shrink-0"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth?.('login');
                  }}
                  className="w-full justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md"
                >
                  <User className="h-4 w-4" />
                  Sign In / Register
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

