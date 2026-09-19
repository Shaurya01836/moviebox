'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Search, Film, Star, CheckCircle2, Flame, Bookmark } from 'lucide-react';
import { WatchlistItem, WatchStatus, WATCH_STATUS_CONFIG } from '@/features/watchlist/types';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';
import { WatchlistCard } from '@/features/watchlist/components/watchlist-card';
import { WatchlistModal } from '@/features/watchlist/components/watchlist-modal';
import { WatchlistHero } from '@/features/watchlist/components/watchlist-hero';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function WatchlistPage() {
  const { items, isLoading, remove } = useWatchlist();
  const [selectedStatus, setSelectedStatus] = React.useState<WatchStatus | 'all'>('all');
  const [selectedMedia, setSelectedMedia] = React.useState<'all' | 'movie' | 'tv' | 'anime'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingMedia, setEditingMedia] = React.useState<{
    mediaId: string;
    mediaKind: 'movie' | 'tv';
    title: string;
    posterPath: string;
    backdropPath?: string;
    logoPath?: string;
    releaseYear?: number;
    voteAverage?: number;
    genres?: string[];
  } | null>(null);

  // Filter items by status, media kind, and search query
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      
      let matchesMedia = true;
      if (selectedMedia === 'movie') {
        matchesMedia = item.mediaKind === 'movie' && !(item.genres?.includes('Animation'));
      }
      if (selectedMedia === 'tv') {
        matchesMedia = item.mediaKind === 'tv' && !(item.genres?.includes('Animation'));
      }
      if (selectedMedia === 'anime') {
        matchesMedia = item.genres?.includes('Animation') ?? false;
      }

      const matchesQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.journal?.review?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.journal?.favoriteCharacter?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesMedia && matchesQuery;
    });
  }, [items, selectedStatus, selectedMedia, searchQuery]);

  // Compute Dashboard Stats
  const stats = React.useMemo(() => {
    const total = items.length;
    const watching = items.filter((i) => i.status === 'watching').length;
    const watched = items.filter((i) => i.status === 'watched').length;
    const ratedItems = items.filter((i) => i.userRating);
    const avgRating =
      ratedItems.length > 0
        ? (ratedItems.reduce((acc, i) => acc + (i.userRating || 0), 0) / ratedItems.length).toFixed(1)
        : 'N/A';
    return { total, watching, watched, avgRating };
  }, [items]);

  // Select top 5 items for the Hero Slideshow
  const heroItems = React.useMemo(() => {
    if (isLoading) return [];
    
    // Priority 1: Currently watching or paused
    const active = items.filter(i => i.status === 'watching' || i.status === 'paused');
    // Priority 2: Highly rated watched items
    const watched = items.filter(i => i.status === 'watched' && (i.userRating || 0) >= 8);
    // Priority 3: Fallback to any items
    
    let candidates = [...active, ...watched];
    if (candidates.length === 0) candidates = items;

    // Deduplicate and take top 5
    const unique = Array.from(new Map(candidates.map(item => [item.mediaId, item])).values());
    return unique.slice(0, 5);
  }, [items, isLoading]);

  const handleEdit = (item: WatchlistItem) => {
    setEditingMedia({
      mediaId: item.mediaId,
      mediaKind: item.mediaKind,
      title: item.title,
      posterPath: item.posterPath,
      backdropPath: item.backdropPath,
      logoPath: item.logoPath,
      releaseYear: item.releaseYear,
      voteAverage: item.voteAverage,
      genres: item.genres,
    });
  };

  const handleDelete = (mediaId: string) => {
    remove(mediaId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 pb-20">
      
      {/* Dynamic Hero Section */}
      {!isLoading && (
        <WatchlistHero 
          items={heroItems} 
          onOpenItem={handleEdit} 
        />
      )}

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 space-y-8 sm:px-6 lg:px-8 pt-12 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              My Library 🎬
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Your personal cinematic journal. Track, review, and organize.
            </p>
          </div>

        <Link href="/search">
          <Button variant="primary" className="gap-2 font-bold shadow-red-600/30">
            <Plus className="h-4 w-4" />
            Add New Title
          </Button>
        </Link>
      </div>

      {/* Dashboard Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Bookmark className="h-4 w-4 text-blue-400" />
            Total Logged
          </div>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Flame className="h-4 w-4 text-amber-400" />
            Watching Now
          </div>
          <p className="text-2xl font-black text-amber-400">{stats.watching}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Completed
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats.watched}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Avg Rating
          </div>
          <p className="text-2xl font-black text-amber-400">{stats.avgRating}</p>
        </div>
      </div>

      {/* Controls Bar: Media Filter & Local Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Media Type Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          {[
            { id: 'all', label: 'All' },
            { id: 'movie', label: 'Movies' },
            { id: 'tv', label: 'TV Shows' },
            { id: 'anime', label: 'Anime' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedMedia(type.id as any)}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                selectedMedia === type.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Local Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter your list..."
            className="pl-9 h-10 bg-zinc-900 border-zinc-800 text-xs text-white"
          />
        </div>
      </div>

      {/* Watchlist Grid / Cards */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8">
          <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
          <p className="text-zinc-400 font-medium text-sm animate-pulse">Loading your cinematic universe...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
            <Film className="h-8 w-8 text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No titles in this list yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Start building your personal cinema journal by searching for movies and TV shows to add!
            </p>
          </div>
          <Link href="/search">
            <Button variant="primary" size="sm" className="font-bold gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Explore Movies & TV Shows
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
          {filteredItems.map((item, index) => (
            <WatchlistCard
              key={item.id}
              item={item}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Floating Glassmorphic Status Filter */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-1.5 p-2 rounded-full bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl hide-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-white text-zinc-950 shadow-md scale-100'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            All ({items.length})
          </button>
          {(Object.keys(WATCH_STATUS_CONFIG) as WatchStatus[]).map((st) => {
            const cfg = WATCH_STATUS_CONFIG[st];
            const count = items.filter((i) => i.status === st).length;
            const isSelected = selectedStatus === st;

            return (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-zinc-950 shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cfg.label}</span>
                <span className={`text-[11px] ${isSelected ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Watchlist Modal */}
      <WatchlistModal
        isOpen={Boolean(editingMedia)}
        onClose={() => setEditingMedia(null)}
        media={editingMedia}
      />
      </div>
    </div>
  );
}
