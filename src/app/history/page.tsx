'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  History,
  Search,
  Trash2,
  Pause,
  Play,
  Clock,
  Film,
  Tv,
  X,
  AlertTriangle,
  Lock,
  UserCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';
import { AuthModal } from '@/features/auth/components/auth-modal';
import { Button } from '@/components/ui/button';
import { WatchHistoryItem } from '@/features/history/types';
import { HistoryService } from '@/features/history/services/history.service';
import { HistoryCard } from './components/history-card';
import { SearchHistoryService, SearchHistoryItem } from '@/features/search/services/search-history.service';
import Link from 'next/link';

function HistoryContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active tab state: 'watch' | 'search'
  const initialTab = searchParams.get('tab') === 'search' ? 'search' : 'watch';
  const [activeTab, setActiveTab] = useState<'watch' | 'search'>(initialTab);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Watch History State
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoadingWatch, setIsLoadingWatch] = useState(true);
  const [watchFilter, setWatchFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [watchSearchQuery, setWatchSearchQuery] = useState('');
  const [isWatchPaused, setIsWatchPaused] = useState(false);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(true);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [isSearchPaused, setIsSearchPaused] = useState(false);

  // Modal confirmation states
  const [showClearWatchModal, setShowClearWatchModal] = useState(false);
  const [showClearSearchModal, setShowClearSearchModal] = useState(false);

  // Fetch initial pause states & data
  useEffect(() => {
    setIsWatchPaused(HistoryService.isPaused());
    setIsSearchPaused(SearchHistoryService.isPaused());
  }, []);

  // Fetch Watch History
  const loadWatchHistory = React.useCallback(async () => {
    setIsLoadingWatch(true);
    try {
      const data = await HistoryService.getRecent(user?.id);
      setWatchHistory(data);
    } catch (e) {
      console.warn('Failed loading watch history:', e);
    } finally {
      setIsLoadingWatch(false);
    }
  }, [user?.id]);

  // Fetch Search History
  const loadSearchHistory = React.useCallback(async () => {
    setIsLoadingSearch(true);
    try {
      const data = await SearchHistoryService.getHistory(user?.id);
      setSearchHistory(data);
    } catch (e) {
      console.warn('Failed loading search history:', e);
    } finally {
      setIsLoadingSearch(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadWatchHistory();
    loadSearchHistory();
  }, [loadWatchHistory, loadSearchHistory]);

  // Sync Tab to URL search param
  const handleTabChange = (tab: 'watch' | 'search') => {
    setActiveTab(tab);
    const newUrl = tab === 'search' ? '/history?tab=search' : '/history';
    router.replace(newUrl, { scroll: false });
  };

  // Handlers for Watch History
  const handleRemoveWatchItem = (id: string) => {
    setWatchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTogglePauseWatch = () => {
    const nextState = !isWatchPaused;
    HistoryService.setPaused(nextState);
    setIsWatchPaused(nextState);
  };

  const handleClearAllWatch = async () => {
    await HistoryService.clearAll(user?.id);
    setWatchHistory([]);
    setShowClearWatchModal(false);
  };

  // Handlers for Search History
  const handleRemoveSearchItem = async (idOrQuery: string) => {
    const updated = await SearchHistoryService.removeQuery(idOrQuery, user?.id);
    setSearchHistory(updated);
  };

  const handleTogglePauseSearch = () => {
    const nextState = !isSearchPaused;
    SearchHistoryService.setPaused(nextState);
    setIsSearchPaused(nextState);
  };

  const handleClearAllSearch = async () => {
    await SearchHistoryService.clearHistory(user?.id);
    setSearchHistory([]);
    setShowClearSearchModal(false);
  };

  // Grouped Watch History Memo
  const groupedWatchHistory = useMemo(() => {
    let filtered = watchHistory;
    if (watchFilter !== 'all') {
      filtered = filtered.filter((i) => i.mediaKind === watchFilter);
    }
    if (watchSearchQuery.trim()) {
      const q = watchSearchQuery.toLowerCase();
      filtered = filtered.filter((i) => i.title.toLowerCase().includes(q));
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

    filtered.forEach((item) => {
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

    return groups.filter((g) => g.items.length > 0);
  }, [watchHistory, watchFilter, watchSearchQuery]);

  // Filtered Search History Memo
  const filteredSearchHistory = useMemo(() => {
    if (!searchHistoryQuery.trim()) return searchHistory;
    const q = searchHistoryQuery.toLowerCase();
    return searchHistory.filter((item) => item.query.toLowerCase().includes(q));
  }, [searchHistory, searchHistoryQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] pb-24 pt-20 sm:pt-28 selection:bg-red-500/30 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full space-y-8">
        
        {/* Guest Banner Notice */}
        {!user && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Viewing Local Device History</h3>
                <p className="text-xs text-zinc-400">
                  Sign in to automatically sync your watch progress and search history across all devices.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold hover:bg-red-500 shrink-0"
            >
              Sign In / Register
            </Button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-900/30">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">HISTORY HUB</h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                Manage your watch activity and past searches like YouTube
              </p>
            </div>
          </div>

          {/* YouTube-style Nav Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-white/10 shrink-0">
            <button
              onClick={() => handleTabChange('watch')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'watch'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4" /> Watch History
              {watchHistory.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{watchHistory.length}</span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('search')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4" /> Search History
              {searchHistory.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{searchHistory.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Main Grid: Left Content (History Lists), Right YouTube Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. WATCH HISTORY TAB CONTENT */}
            {activeTab === 'watch' && (
              <div className="space-y-6">
                
                {/* Controls Bar: Type Filters + Local Search */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-900/40 border border-white/5 p-3 rounded-2xl">
                  <div className="flex gap-1.5">
                    {(['all', 'movie', 'tv'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setWatchFilter(f)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                          watchFilter === f
                            ? 'bg-white text-black border-white shadow'
                            : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
                        }`}
                      >
                        {f === 'all' ? 'All Types' : f === 'movie' ? 'Movies' : 'Series'}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search watch history..."
                      value={watchSearchQuery}
                      onChange={(e) => setWatchSearchQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    {watchSearchQuery && (
                      <button
                        onClick={() => setWatchSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Paused Warning Alert if active */}
                {isWatchPaused && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
                    <Pause className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Watch history is currently <strong>paused</strong>. Videos watched now won't be saved.</span>
                  </div>
                )}

                {/* Watch Items List */}
                {isLoadingWatch ? (
                  <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : groupedWatchHistory.length > 0 ? (
                  <div className="space-y-10">
                    {groupedWatchHistory.map((group) => (
                      <div key={group.label} className="space-y-4">
                        <h2 className="text-xs font-black text-zinc-500 tracking-widest uppercase pl-1">
                          {group.label}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.items.map((item) => (
                            <HistoryCard key={item.id} item={item} onRemove={handleRemoveWatchItem} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-white/5 rounded-3xl bg-zinc-900/20 space-y-4">
                    <History className="h-12 w-12 text-zinc-700 mx-auto" />
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">No Watch History Found</h3>
                      <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                        {watchSearchQuery
                          ? 'No watch records match your search criteria.'
                          : 'Start watching movies and series to automatically build your watch history.'}
                      </p>
                    </div>
                    {!watchSearchQuery && (
                      <Link href="/search">
                        <Button variant="primary" className="rounded-xl px-6 text-xs font-bold">
                          Discover Content
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. SEARCH HISTORY TAB CONTENT */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                
                {/* Search History Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-900/40 border border-white/5 p-3 rounded-2xl">
                  <div className="text-xs font-semibold text-zinc-400 pl-2">
                    Showing <strong className="text-white">{filteredSearchHistory.length}</strong> recent searches
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search past queries..."
                      value={searchHistoryQuery}
                      onChange={(e) => setSearchHistoryQuery(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    {searchHistoryQuery && (
                      <button
                        onClick={() => setSearchHistoryQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Paused Warning Alert if active */}
                {isSearchPaused && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
                    <Pause className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Search history is currently <strong>paused</strong>. New searches won't be saved.</span>
                  </div>
                )}

                {/* Search Items List */}
                {isLoadingSearch ? (
                  <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  </div>
                ) : filteredSearchHistory.length > 0 ? (
                  <div className="space-y-2 rounded-2xl border border-white/5 bg-zinc-900/30 p-2">
                    {filteredSearchHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 group transition-colors"
                      >
                        <Link
                          href={`/search?q=${encodeURIComponent(item.query)}`}
                          className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400 group-hover:text-red-400 group-hover:bg-red-500/10 transition-colors">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors truncate">
                              {item.query}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {new Date(item.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </Link>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/search?q=${encodeURIComponent(item.query)}`}
                            className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <span>Search again</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleRemoveSearchItem(item.id)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove search query"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-white/5 rounded-3xl bg-zinc-900/20 space-y-4">
                    <Clock className="h-12 w-12 text-zinc-700 mx-auto" />
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">No Search History</h3>
                      <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                        {searchHistoryQuery
                          ? 'No past search queries match your filter.'
                          : 'Your recent search queries will appear here automatically.'}
                      </p>
                    </div>
                    <Link href="/search">
                      <Button variant="primary" className="rounded-xl px-6 text-xs font-bold">
                        Go to Search
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: YouTube Control Center Sidebar (1/3 width on desktop) */}
          <div className="space-y-6">
            <div className="sticky top-28 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 space-y-6 backdrop-blur-xl shadow-2xl">
              
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-black text-white tracking-tight uppercase flex items-center gap-2">
                  <History className="w-4 h-4 text-red-500" /> History Controls
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage privacy options, clear history, or pause logging.
                </p>
              </div>

              {/* Watch History Controls */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                  <span>Watch History</span>
                  {isWatchPaused && (
                    <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Paused</span>
                  )}
                </div>

                <button
                  onClick={() => setShowClearWatchModal(true)}
                  disabled={watchHistory.length === 0}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-white/5 text-xs font-bold text-zinc-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Clear all watch history</span>
                </button>

                <button
                  onClick={handleTogglePauseWatch}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isWatchPaused
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-zinc-950 border-white/5 text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isWatchPaused ? (
                    <>
                      <Play className="w-4 h-4 text-amber-400" />
                      <span>Resume watch history</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 text-zinc-400" />
                      <span>Pause watch history</span>
                    </>
                  )}
                </button>
              </div>

              {/* Search History Controls */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                  <span>Search History</span>
                  {isSearchPaused && (
                    <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[10px] font-bold">Paused</span>
                  )}
                </div>

                <button
                  onClick={() => setShowClearSearchModal(true)}
                  disabled={searchHistory.length === 0}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-zinc-950 border border-white/5 text-xs font-bold text-zinc-300 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Clear all search history</span>
                </button>

                <button
                  onClick={handleTogglePauseSearch}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isSearchPaused
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                      : 'bg-zinc-950 border-white/5 text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isSearchPaused ? (
                    <>
                      <Play className="w-4 h-4 text-amber-400" />
                      <span>Resume search history</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 text-zinc-400" />
                      <span>Pause search history</span>
                    </>
                  )}
                </button>
              </div>

              {/* Information Footer */}
              <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-500 leading-relaxed">
                Your history is saved locally and synced securely with your profile when signed in.
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal: Clear Watch History */}
      {showClearWatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-zinc-950 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Clear Watch History?</h3>
              <p className="text-xs text-zinc-400">
                This will delete your entire watch history from this device and account. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowClearWatchModal(false)}
                className="flex-1 rounded-xl text-xs border-zinc-800 hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClearAllWatch}
                className="flex-1 rounded-xl text-xs bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear Search History */}
      {showClearSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-zinc-950 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">Clear Search History?</h3>
              <p className="text-xs text-zinc-400">
                This will remove all recent search queries saved in your history.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowClearSearchModal(false)}
                className="flex-1 rounded-xl text-xs border-zinc-800 hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleClearAllSearch}
                className="flex-1 rounded-xl text-xs bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} defaultMode="login" />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c] pt-28 text-center text-zinc-500">Loading history...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
