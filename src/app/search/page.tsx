'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, Loader2, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MovieCard } from '@/components/shared/movie-card';
import { SearchResultItem } from '@/features/search/types';

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

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input and set up Escape key listener to return home
  React.useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const performSearch = React.useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || 'Search request failed.');
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during search';
      setErrorMessage(msg);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync URL query & debounced search execution
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed !== initialQuery) {
        if (trimmed) {
          router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
        } else {
          router.replace('/search', { scroll: false });
        }
      }
      performSearch(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, initialQuery, router, performSearch]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    router.replace('/search', { scroll: false });
  };

  const handleItemClick = () => {
    setIsNavigating(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col pt-2 sm:pt-4">
      {/* Minimal Spinner Loader Overlay when clicking item */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      )}

      {/* Main Search Input Section */}
      <div className="w-full border-b border-white/10 bg-zinc-950/90 py-3 px-4 sm:px-8 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="relative flex-1">
            {isLoading ? (
              <Loader2 className="absolute left-4 top-3.5 h-5 w-5 text-red-500 animate-spin" />
            ) : (
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
            )}
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search millions of movies, TV shows, anime..."
              className="h-12 pl-12 pr-12 text-base sm:text-lg bg-zinc-900/90 border-zinc-800 text-white placeholder:text-zinc-500 rounded-2xl focus-visible:ring-red-500"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-3 text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
                title="Clear Search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-white/20 hover:text-white transition-all cursor-pointer select-none shrink-0"
          >
            <span>Close</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-zinc-400">ESC</kbd>
          </button>
        </div>
      </div>

      {/* Results / Suggestions Container */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 space-y-8">
        {/* Quick Suggestion Chips when empty */}
        {!query.trim() && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Trending Search Suggestions
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-medium text-zinc-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-white transition-all cursor-pointer select-none"
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

        {/* Empty Result */}
        {query.trim() && !isLoading && results.length === 0 && !errorMessage && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
              <Film className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No results found for &quot;{query}&quot;</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Try checking spelling or search for another movie, TV series, or anime.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Found {results.length} results for &quot;<strong className="text-white">{query}</strong>&quot;</span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {results.map((item) => (
                <div key={`${item.mediaKind}-${item.id}`} onClick={handleItemClick}>
                  <MovieCard movie={item} />
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
