'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  Film, Tv, Star, Bookmark, Folder, Trophy, 
  ChevronDown, ArrowRight, Play, Heart, Award,
  Sparkles, History, Map, Users, Quote, Smile,
  TrendingUp, BarChart3
} from 'lucide-react';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';
import { useCollections } from '@/features/collections/context/collections-context';
import { useAuth } from '@/features/auth/context/auth-context';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { Button } from '@/components/ui/button';
import { StatCard } from './components/stat-card';
import { TimelineChart } from './components/timeline-chart';
import { RatingDistribution } from './components/rating-distribution';
import { MoodAnalytics } from './components/mood-analytics';
import { PeopleAnalytics } from './components/people-analytics';
import { GenreAnalytics } from './components/genre-analytics';
import { RecordsAnalytics } from './components/records-analytics';
import { CollectionAnalytics } from './components/collection-analytics';
import { WatchStatus } from '@/features/watchlist/types';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { items, isLoading: isWatchlistLoading } = useWatchlist();
  const { collections, isLoading: isCollectionsLoading } = useCollections();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');

  // Derive all years present in data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    items.forEach(item => {
      if (item.createdAt) {
        const date = new Date(item.createdAt);
        if (!isNaN(date.getTime())) years.add(date.getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [items]);

  // Filter items by selected year
  const activeItems = useMemo(() => {
    if (selectedYear === 'all') return items;
    return items.filter(item => {
      if (!item.createdAt) return false;
      const date = new Date(item.createdAt);
      return !isNaN(date.getTime()) && date.getFullYear() === selectedYear;
    });
  }, [items, selectedYear]);

  // Basic Stats
  const stats = useMemo(() => {
    const movies = activeItems.filter(i => i.mediaKind === 'movie' && !i.genres?.includes('Animation'));
    const series = activeItems.filter(i => i.mediaKind === 'tv' && !i.genres?.includes('Animation'));
    const anime = activeItems.filter(i => i.genres?.includes('Animation'));
    
    const rated = activeItems.filter(i => typeof i.userRating === 'number');
    const avgRating = rated.length > 0 
      ? (rated.reduce((sum, i) => sum + i.userRating!, 0) / rated.length).toFixed(1)
      : 'N/A';

    return {
      total: activeItems.length,
      movies: movies.length,
      series: series.length,
      anime: anime.length,
      avgRating,
      ratedCount: rated.length,
    };
  }, [activeItems]);

  const isLoading = isWatchlistLoading || isCollectionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0c]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 px-4 items-center justify-center relative">
        <div className="relative max-w-md w-full text-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-white/10 bg-zinc-950/70 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/80">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-red-500 shadow-md">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Your Entertainment Life
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Sign in to unlock deep insights, statistics, and the hidden story of your entertainment library.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full rounded-xl bg-red-600 py-3 text-xs font-bold text-white hover:bg-red-500 transition-transform active:scale-95 shadow-lg shadow-red-950/40 border border-red-500/30 cursor-pointer"
            >
              Sign In to View
            </Button>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultMode="login" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a0a0c] px-4 items-center justify-center text-center">
        <Sparkles className="h-12 w-12 text-zinc-600 mb-6" />
        <h1 className="text-3xl font-black text-white mb-3">You're just getting started.</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          Add a few watched titles and your entertainment story will start appearing here.
        </p>
        <Link href="/search">
          <Button variant="primary" className="rounded-xl px-8 font-bold">Explore Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] pb-24 pt-20 sm:pt-28 selection:bg-red-500/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full space-y-24">
        
        {/* HEADER & FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter">
              YOUR ENTERTAINMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">LIFE</span>
            </h1>
            <p className="text-lg text-zinc-400 font-medium tracking-tight">Everything you've watched, measured.</p>
          </div>
          
          {availableYears.length > 0 && (
            <div className="relative inline-flex self-start sm:self-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="appearance-none bg-zinc-900 border border-white/10 rounded-2xl py-3 pl-6 pr-12 text-sm font-bold text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
              >
                <option value="all">ALL TIME</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* SECTION 1: OVERVIEW */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              label="Movies" 
              value={stats.movies} 
              icon={Film} 
              colorClass="red"
            />
            <StatCard 
              label="Series" 
              value={stats.series} 
              icon={Tv} 
              colorClass="amber"
            />
            <StatCard 
              label="Anime" 
              value={stats.anime} 
              icon={Sparkles} 
              colorClass="blue"
            />
            <StatCard 
              label="Avg Rating" 
              value={stats.avgRating} 
              icon={Star} 
              subtext={`Based on ${stats.ratedCount} ratings`}
              colorClass="emerald"
            />
          </div>
        </section>

        {/* SECTION 2: TIMELINE */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
          <TimelineChart items={activeItems} />
        </section>

        {/* SECTION 3: RECORDS */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <RecordsAnalytics items={activeItems} />
        </section>

        {/* SECTION 4: RATINGS & GENRES */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-both">
          <div className="lg:col-span-1">
            <RatingDistribution items={activeItems} />
          </div>
          <div className="lg:col-span-2">
            <GenreAnalytics items={activeItems} />
          </div>
        </section>

        {/* SECTION 5: MOODS */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
          <MoodAnalytics items={activeItems} />
        </section>

        {/* SECTION 6: PEOPLE */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600 fill-mode-both">
          <PeopleAnalytics items={activeItems} />
        </section>

        {/* SECTION 7: COLLECTIONS */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
          <CollectionAnalytics collections={collections} items={activeItems} />
        </section>

        {/* SECTION 8: DID YOU KNOW */}
        <section className="rounded-3xl border border-red-500/20 bg-red-950/10 p-8 sm:p-12 text-center max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-1000 fill-mode-both">
          <h2 className="text-sm font-black text-red-500 uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> DID YOU KNOW?
          </h2>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-snug">
            {stats.ratedCount > 0 
              ? `You've rated ${activeItems.filter(i => i.userRating === 10).length} titles a perfect 10/10, making up ${Math.round((activeItems.filter(i => i.userRating === 10).length / stats.ratedCount) * 100)}% of your rated library.`
              : `You've added ${stats.total} titles to your library but haven't rated them yet. Start rating to uncover deeper patterns in your taste!`
            }
          </p>
        </section>

      </div>
    </div>
  );
}
