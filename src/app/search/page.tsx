'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from '@/features/search/components/search-bar';
import { SearchResults } from '@/features/search/components/search-results';
import { SearchResultItem } from '@/features/search/types';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        if (query) {
          router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
        } else {
          router.replace('/search', { scroll: false });
        }
      }
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, initialQuery, router, performSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Search MovieBox
        </h1>
        <p className="text-sm text-zinc-400">
          Search millions of movies and TV shows from the TMDB database in real time.
        </p>

        <SearchBar
          initialValue={query}
          onSearch={(val) => setQuery(val)}
          isLoading={isLoading}
        />
      </div>

      <SearchResults
        results={results}
        query={query}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
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
