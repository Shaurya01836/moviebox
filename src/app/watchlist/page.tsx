'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Search, Film, Star, CheckCircle2, Flame, Bookmark, Folder, Loader2, Sparkles } from 'lucide-react';
import { WatchlistItem, WatchStatus, WATCH_STATUS_CONFIG } from '@/features/watchlist/types';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';
import { useAuth } from '@/features/auth/context/auth-context';
import { useCollections } from '@/features/collections/context/collections-context';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { WatchlistCard } from '@/features/watchlist/components/watchlist-card';
import { WatchlistModal } from '@/features/watchlist/components/watchlist-modal';
import { CollectionCard } from '@/features/collections/components/collection-card';
import { CreateCollectionModal } from '@/features/collections/components/create-collection-modal';
import { MovieCardSkeleton } from '@/components/shared/movie-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LibrarySection } from './components/library-section';

export default function WatchlistPage() {
  const { user } = useAuth();
  const { items, isLoading, remove } = useWatchlist();
  const { collections, isLoading: isCollectionsLoading, createCollection } = useCollections();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [creatingRecName, setCreatingRecName] = React.useState<string | null>(null);

  const [isEntertainmentOpen, setIsEntertainmentOpen] = React.useState(true);
  const [isWatchingOpen, setIsWatchingOpen] = React.useState(false);
  const [isBucketListOpen, setIsBucketListOpen] = React.useState(false);

  const [selectedMedia, setSelectedMedia] = React.useState<'all' | 'movie' | 'tv' | 'anime'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'recent' | 'rating_desc' | 'rating_asc' | 'az' | 'za'>('recent');
  
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

  // Filter items by media kind, and search query
  const getFilteredItems = React.useCallback((status: WatchStatus) => {
    const result = items.filter(Boolean).filter((item) => {
      const matchesStatus = item?.status === status;
      
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

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'rating_desc':
          return (b.userRating || 0) - (a.userRating || 0);
        case 'rating_asc':
          return (a.userRating || 0) - (b.userRating || 0);
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [items, selectedMedia, searchQuery, sortBy]);

  // Compute Dashboard Stats
  const stats = React.useMemo(() => {
    const total = items.length;
    const watching = items.filter((i) => i?.status === 'watching').length;
    const watched = items.filter((i) => i?.status === 'watched').length;
    const ratedItems = items.filter((i) => i?.userRating);
    const avgRating =
      ratedItems.length > 0
        ? (ratedItems.reduce((acc, i) => acc + (i.userRating || 0), 0) / ratedItems.length).toFixed(1)
        : 'N/A';
    return { total, watching, watched, avgRating };
  }, [items]);

  // Recommendations Logic
  const recommendations = React.useMemo(() => {
    if (isLoading) return [];
    
    const recs: { name: string; description: string; mediaIds: string[] }[] = [];
    const existingNames = collections.map(c => c.name.toLowerCase());

    const tens = items.filter(i => i.userRating === 10);
    if (tens.length >= 2 && !existingNames.includes('your 10/10s')) {
      recs.push({
        name: 'Your 10/10s',
        description: `You rated ${tens.length} titles a perfect 10/10.`,
        mediaIds: tens.map(t => t.mediaId)
      });
    }

    const thrillers = items.filter(i => i.genres?.includes('Thriller') && (i.userRating || 0) >= 8);
    if (thrillers.length >= 3 && !existingNames.includes('favorite thrillers')) {
      recs.push({
        name: 'Favorite Thrillers',
        description: `You've highly rated ${thrillers.length} thrillers.`,
        mediaIds: thrillers.map(t => t.mediaId)
      });
    }

    const scifi = items.filter(i => i.genres?.includes('Science Fiction') && (i.userRating || 0) >= 8);
    if (scifi.length >= 3 && !existingNames.includes('favorite sci-fi')) {
      recs.push({
        name: 'Favorite Sci-Fi',
        description: `You've highly rated ${scifi.length} sci-fi titles.`,
        mediaIds: scifi.map(t => t.mediaId)
      });
    }

    const moodCounts: Record<string, { count: number; mediaIds: string[] }> = {};
    items.forEach(item => {
      (item.moods || []).forEach(mood => {
        if (!moodCounts[mood]) moodCounts[mood] = { count: 0, mediaIds: [] };
        moodCounts[mood].count++;
        moodCounts[mood].mediaIds.push(item.mediaId);
      });
    });

    const moodRules: Record<string, string> = {
      'Mind-blown': 'Mind-Blowing',
      'Emotional': 'Movies That Hit Me',
      'Comforted': 'Comfort Watches',
      'Terrified': 'Movies That Scared Me',
      'Nostalgic': 'Nostalgic Watches'
    };

    Object.entries(moodCounts).forEach(([mood, data]) => {
      if (data.count >= 4) {
        const title = moodRules[mood] || `${mood} Watches`;
        if (!existingNames.includes(title.toLowerCase())) {
          recs.push({
            name: title,
            description: `You've marked ${data.count} titles as ${mood}.`,
            mediaIds: data.mediaIds
          });
        }
      }
    });

    // Combined: Highly Rated + Mood
    Object.entries(moodCounts).forEach(([mood, data]) => {
      const highRatedMediaIds = data.mediaIds.filter(id => {
        const it = items.find(i => i.mediaId === id);
        return it && it.userRating && it.userRating >= 9.0;
      });
      if (highRatedMediaIds.length >= 3) {
        const title = `${mood} Favorites`;
        if (!existingNames.includes(title.toLowerCase())) {
          recs.push({
            name: title,
            description: `You've highly rated ${highRatedMediaIds.length} titles that are ${mood}.`,
            mediaIds: highRatedMediaIds
          });
        }
      }
    });

    return recs;
  }, [items, isLoading, collections]);

  const handleCreateRecommendation = async (rec: { name: string; description: string; mediaIds: string[] }) => {
    setCreatingRecName(rec.name);
    try {
      await createCollection(rec.name, rec.description);
    } finally {
      setCreatingRecName(null);
    }
  };

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

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 px-4 items-center justify-center relative">
        <div className="relative max-w-md w-full text-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-200 border border-white/10 bg-zinc-950/70 p-8 sm:p-10 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/80">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-red-500 shadow-md">
            <Bookmark className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              My Library
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Sign in to save movies, track TV shows, and build your personal collections.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full rounded-xl bg-red-600 py-3 text-xs font-bold text-white hover:bg-red-500 transition-transform active:scale-95 shadow-lg shadow-red-950/40 border border-red-500/30 cursor-pointer"
            >
              Sign In / Register
            </Button>
            <Link href="/search" className="block">
              <button
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultMode="login"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] pb-24 pt-20 sm:pt-28">
      
      <div className="mx-auto max-w-7xl px-4 space-y-8 sm:px-6 lg:px-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl uppercase">
              My Library
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Everything you've watched and your personal cinematic archive.
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4 space-y-2 backdrop-blur-sm">
                <Skeleton className="h-4 w-20 bg-zinc-800/60" />
                <Skeleton className="h-7 w-12 bg-zinc-800/80" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4 space-y-0.5 sm:space-y-1 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-zinc-400">
                  <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
                  Total Logged
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">{stats.total}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4 space-y-0.5 sm:space-y-1 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-zinc-400">
                  <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                  Watching Now
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-400">{stats.watching}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4 space-y-0.5 sm:space-y-1 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                  Completed
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400">{stats.watched}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-3 sm:p-4 space-y-0.5 sm:space-y-1 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-zinc-400">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                  Avg Rating
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-400">{stats.avgRating}</p>
              </div>
            </>
          )}
        </div>

        {/* SECTION 1: MY ENTERTAINMENT */}
        <LibrarySection
          title="My Entertainment"
          items={items.filter(i => i.status === 'watched')}
          filteredItems={getFilteredItems('watched')}
          icon={Bookmark}
          size="large"
          colorClass="red"
          isOpen={isEntertainmentOpen}
          onToggle={() => setIsEntertainmentOpen(!isEntertainmentOpen)}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedMedia={selectedMedia}
          setSelectedMedia={setSelectedMedia}
          sortBy={sortBy}
          setSortBy={setSortBy}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />

        {/* SECTION 1B: CURRENTLY WATCHING */}
        <LibrarySection
          title="Currently Watching"
          items={items.filter(i => i.status === 'watching')}
          filteredItems={getFilteredItems('watching')}
          icon={Flame}
          size="small"
          colorClass="amber"
          isOpen={isWatchingOpen}
          onToggle={() => setIsWatchingOpen(!isWatchingOpen)}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedMedia={selectedMedia}
          setSelectedMedia={setSelectedMedia}
          sortBy={sortBy}
          setSortBy={setSortBy}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />

        {/* SECTION 1C: BUCKET LIST */}
        <LibrarySection
          title="Bucket List"
          items={items.filter(i => i.status === 'watchlist')}
          filteredItems={getFilteredItems('watchlist')}
          icon={CheckCircle2}
          size="small"
          colorClass="blue"
          isOpen={isBucketListOpen}
          onToggle={() => setIsBucketListOpen(!isBucketListOpen)}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedMedia={selectedMedia}
          setSelectedMedia={setSelectedMedia}
          sortBy={sortBy}
          setSortBy={setSortBy}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />

        {/* SECTION 2: MY COLLECTIONS */}
        <section className="bg-zinc-900/30 rounded-3xl p-4 sm:p-6 border border-white/5 space-y-6 mt-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-red-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">MY COLLECTIONS</h2>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all cursor-pointer border border-white/10"
            >
              <Plus className="h-3.5 w-3.5" /> Create Collection
            </button>
          </div>

          {isCollectionsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl bg-zinc-950/80 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8">
              <h3 className="text-xl font-bold text-white">BUILD YOUR OWN COLLECTIONS</h3>
              <p className="text-sm text-zinc-400 max-w-sm">
                Turn the things you've watched into collections that feel like you.
              </p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-transform active:scale-95 shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create your first collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {collections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 3: RECOMMENDED COLLECTIONS */}
        {recommendations.length > 0 && (
          <section className="bg-zinc-900/30 rounded-3xl p-4 sm:p-6 border border-white/5 space-y-6 mt-8">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Sparkles className="h-5 w-5 text-red-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">RECOMMENDED COLLECTIONS</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map(rec => (
                <div key={rec.name} className="flex flex-col justify-between rounded-3xl border border-white/10 bg-zinc-950/80 p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{rec.name}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{rec.description}</p>
                  </div>
                  <button
                    onClick={() => handleCreateRecommendation(rec)}
                    disabled={creatingRecName === rec.name}
                    className="self-start text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingRecName === rec.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Create Collection
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {(!isLoading && !isCollectionsLoading && items.length < 5 && recommendations.length === 0) && (
          <section className="text-center pt-8 pb-12">
            <p className="text-sm text-zinc-500 font-medium">Keep building your library. We'll find interesting patterns as your entertainment history grows.</p>
          </section>
        )}



      <WatchlistModal
        isOpen={Boolean(editingMedia)}
        onClose={() => setEditingMedia(null)}
        media={editingMedia}
      />
      <CreateCollectionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      </div>
    </div>
  );
}
