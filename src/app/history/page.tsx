'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { History, Search } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { Button } from '@/components/ui/button';
import { WatchHistoryItem } from '@/features/history/types';
import { HistoryService } from '@/features/history/services/history.service';
import { HistoryCard } from './components/history-card';
import Link from 'next/link';

export default function HistoryPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    HistoryService.getRecent(user.id).then(data => {
      setHistory(data);
      setIsLoading(false);
    });
  }, [user]);

  const handleRemove = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const groupedHistory = useMemo(() => {
    let filtered = history;
    if (filter !== 'all') {
      filtered = filtered.filter(i => i.mediaKind === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.title.toLowerCase().includes(q));
    }

    const groups: { label: string; items: WatchHistoryItem[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'This Week', items: [] },
      { label: 'Earlier', items: [] },
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    filtered.forEach(item => {
      const d = new Date(item.updatedAt);
      if (d >= today) {
        groups[0].items.push(item);
      } else if (d >= yesterday) {
        groups[1].items.push(item);
      } else if (d >= thisWeek) {
        groups[2].items.push(item);
      } else {
        groups[3].items.push(item);
      }
    });

    return groups.filter(g => g.items.length > 0);
  }, [history, filter, searchQuery]);


  if (!user && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 px-4 items-center justify-center relative">
        <div className="relative max-w-md w-full text-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-white/10 bg-zinc-950/70 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/80">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-red-500 shadow-md">
            <History className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Watch History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Sign in to keep track of everything you watch and resume exactly where you left off.
            </p>
          </div>
          <div className="pt-2">
            <Button onClick={() => setIsAuthModalOpen(true)} className="w-full rounded-xl bg-red-600 py-3 text-xs font-bold text-white hover:bg-red-500">
              Sign In to View
            </Button>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultMode="login" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] pb-24 pt-20 sm:pt-28 selection:bg-red-500/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <History className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">WATCH HISTORY</h1>
              <p className="text-sm text-zinc-400 font-medium">Everything you've watched on Movie Box.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center pt-4">
            <div className="flex gap-2">
              {(['all', 'movie', 'tv'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                    filter === f 
                      ? 'bg-white text-black border-white' 
                      : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'Series'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : groupedHistory.length > 0 ? (
          <div className="space-y-12">
            {groupedHistory.map(group => (
              <div key={group.label} className="space-y-4">
                <h2 className="text-sm font-black text-zinc-500 tracking-widest uppercase pl-1">{group.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map(item => (
                    <HistoryCard key={item.id} item={item} onRemove={handleRemove} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-white/5 rounded-3xl bg-zinc-900/20">
            <History className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No watch history found</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
              {searchQuery ? "No matches for your search." : "Start watching movies and series to build your history."}
            </p>
            {!searchQuery && (
              <Link href="/search">
                <Button variant="primary" className="rounded-xl px-8">Find Something to Watch</Button>
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
