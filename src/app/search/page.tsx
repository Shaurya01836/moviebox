'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, Loader2, Film, Clock, History, Trash2, ArrowUpLeft } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { MovieCard } from '@/components/shared/movie-card';
import { MovieCardSkeleton } from '@/components/shared/movie-card-skeleton';
import { SearchResultItem } from '@/features/search/types';
import { useAuth } from '@/features/auth/context/auth-context';
import { SearchHistoryService, SearchHistoryItem } from '@/features/search/services/search-history.service';
import { useDebounce } from '@/lib/hooks/use-debounce';

const QUICK_SUGGESTIONS = [
  'Naruto',
  'Inception',
  'Interstellar',
  'Breaking Bad',
  'Spider-Man',
  'Stranger Things',
  'Attack on Titan',
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = React.useState(initialQuery);
  
  // Debounce query by 300ms for fast responsive typing
  const debouncedQuery = useDebounce(query, 300);

  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Search History State
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // In-memory query cache for instant responses on repeated searches
  const searchCacheRef = React.useRef<Map<string, SearchResultItem[]>>(new Map());
  // Active AbortController to cancel stale in-flight fetches
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Load Search History
  const loadSearchHistory = React.useCallback(async () => {
    const history = await SearchHistoryService.getHistory(user?.id);
    setSearchHistory(history);
  }, [user?.id]);

  React.useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  // Handle click outside autocomplete panel
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHistory = React.useMemo(() => {
    if (!query.trim()) return searchHistory;
    const q = query.toLowerCase();
    return searchHistory.filter((item) => item.query.toLowerCase().includes(q));
  }, [searchHistory, query]);

  // Reset selected keyboard index when filtered list changes
  React.useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Execute Search with AbortController & Client In-Memory Cache
  const executeSearch = React.useCallback(async (searchString: string) => {
    const trimmed = searchString.trim();

    // Abort previous pending fetch request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!trimmed) {
      setResults([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    // Check client-side memory cache for instant (0ms) response
    const cacheKey = trimmed.toLowerCase();
    if (searchCacheRef.current.has(cacheKey)) {
      setResults(searchCacheRef.current.get(cacheKey) || []);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Search request failed.');
        setResults([]);
      } else {
        const fetchedResults = data.results || [];
        // Save to cache map
        searchCacheRef.current.set(cacheKey, fetchedResults);
        setResults(fetchedResults);

        // Record query in history
        SearchHistoryService.addQuery(trimmed, user?.id).then((updated) => {
          setSearchHistory(updated);
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const msg = err instanceof Error ? err.message : 'Network error during search';
      setErrorMessage(msg);
      setResults([]);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [user?.id]);

  // Sync debounced query with URL & trigger search execution
  React.useEffect(() => {
    const trimmed = debouncedQuery.trim();
    
    if (trimmed !== initialQuery) {
      if (trimmed) {
        router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
      } else {
        router.replace('/search', { scroll: false });
      }
    }

    executeSearch(debouncedQuery);
  }, [debouncedQuery, initialQuery, router, executeSearch]);

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQuery('');
    setResults([]);
    setIsLoading(false);
    router.replace('/search', { scroll: false });
  };

  // Immediate selection handler (bypasses debounce delay)
  const handleSelectQuery = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setIsFocused(false);
    executeSearch(selectedQuery);
  };

  // Optimistic history deletion
  const handleRemoveHistoryItem = async (e: React.MouseEvent, idOrQuery: string) => {
    e.stopPropagation();
    setSearchHistory((prev) => prev.filter((item) => item.id !== idOrQuery && item.query.toLowerCase() !== idOrQuery.toLowerCase()));
    await SearchHistoryService.removeQuery(idOrQuery, user?.id);
  };

  // Keyboard navigation for history dropdown (ArrowDown, ArrowUp, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      return;
    }

    if (!isFocused || filteredHistory.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredHistory.slice(0, 8).length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredHistory.slice(0, 8).length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedItem = filteredHistory[selectedIndex];
      if (selectedItem) {
        handleSelectQuery(selectedItem.query);
      }
    }
  };

  // Utility to highlight matching query text in dropdown
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={index} className="text-white font-bold underline decoration-red-500/80">
              {part}
            </strong>
          ) : (
            <span key={index} className="text-zinc-400">
              {part}
            </span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col pt-16 sm:pt-24 selection:bg-red-500/30">

      {/* Header Search Input Section */}
      <div className="w-full border-b border-white/10 bg-zinc-950/90 py-2.5 sm:py-3.5 px-3.5 sm:px-8 backdrop-blur-xl relative z-30 shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 sm:gap-4">
          <div ref={containerRef} className="relative flex-1">
            {isLoading ? (
              <Loader2 className="absolute left-3.5 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-red-500 animate-spin z-10" />
            ) : (
              <Search className="absolute left-3.5 sm:left-4 top-3 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-zinc-400 z-10" />
            )}
            <Input
              ref={inputRef}
              value={query}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
              }}
              placeholder="Search movies, TV shows, anime..."
              className="h-10 sm:h-12 pl-9 sm:pl-12 pr-9 sm:pr-12 text-sm sm:text-base bg-zinc-900/90 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl sm:rounded-2xl focus-visible:ring-2 focus-visible:ring-red-500 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 sm:right-4 top-2.5 sm:top-3 text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer z-10"
                title="Clear Search"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}

            {/* Production YouTube-Style Search History & Autocomplete Dropdown */}
            {isFocused && filteredHistory.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/10 bg-zinc-950/95 py-2 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden max-h-80 overflow-y-auto scrollbar-none animate-in fade-in-50 zoom-in-95 border-t-white/20">
                <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold text-zinc-400 border-b border-white/5 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-red-500" /> Recent Searches</span>
                  <Link href="/history?tab=search" className="text-red-400 hover:underline cursor-pointer flex items-center gap-1">
                    <History className="w-3 h-3" /> Manage History
                  </Link>
                </div>
                {filteredHistory.slice(0, 8).map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectQuery(item.query)}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer group transition-colors ${
                      selectedIndex === index ? 'bg-red-500/15 border-l-2 border-red-500' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <Clock className="w-4 h-4 text-purple-400/80 shrink-0 group-hover:text-purple-300" />
                      <span className="truncate font-medium text-sm">
                        {renderHighlightedText(item.query, query)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden group-hover:inline-block text-[10px] text-zinc-500 font-mono">
                        <ArrowUpLeft className="w-3 h-3" />
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveHistoryItem(e, item.id)}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                        title="Remove query"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-white/10 bg-white/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-zinc-200 hover:bg-white/20 hover:text-white transition-all cursor-pointer select-none shrink-0"
          >
            <span>Close</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-zinc-400">ESC</kbd>
          </button>
        </div>
      </div>

      {/* Results / Suggestions Container */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-3.5 py-6 sm:px-8 space-y-6 sm:space-y-8">
        

        {/* Quick Suggestion Chips when empty */}
        {!query.trim() && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Trending Search Suggestions
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSelectQuery(suggestion)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-zinc-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-white transition-all cursor-pointer select-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Production Loading State: Animated Skeletons */}
        {isLoading && results.length === 0 && (
          <div className="space-y-4">
            <div className="text-xs text-zinc-500 animate-pulse">Searching titles across TMDB...</div>
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Empty Result State */}
        {query.trim() && !isLoading && results.length === 0 && !errorMessage && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
              <Film className="h-7 w-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">No results found for &quot;{query}&quot;</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Try checking spelling or search for another movie, TV series, or anime.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Found <strong className="text-white">{results.length}</strong> results for &quot;<strong className="text-white">{query}</strong>&quot;</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((item, index) => (
                <div key={`${item.mediaKind}-${item.id}`}>
                  <MovieCard movie={item} index={index} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
