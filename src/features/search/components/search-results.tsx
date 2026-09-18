import { SearchResultItem } from '../types';
import { MovieCard } from '@/components/shared/movie-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Film, AlertCircle } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultItem[];
  query: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function SearchResults({ results, query, isLoading = false, errorMessage = null }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[2/3] w-full rounded-2xl bg-zinc-900" />
            <Skeleton className="h-4 w-3/4 bg-zinc-900" />
            <Skeleton className="h-3 w-1/2 bg-zinc-900" />
          </div>
        ))}
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
        <div>
          <p className="font-semibold text-red-200">Unable to load search results</p>
          <p className="text-red-400 mt-0.5">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
          <Film className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-300">Discover Movies & TV Shows</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Type a title like &quot;Naruto&quot;, &quot;Dune&quot;, or &quot;Inception&quot; to search the global database.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500">
          <Film className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-300">No results found</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          We couldn&apos;t find any movies or TV shows matching &quot;{query}&quot;. Try a different keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>Found {results.length} results for &quot;<span className="text-zinc-200 font-medium">{query}</span>&quot;</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.map((item) => (
          <MovieCard key={`${item.mediaKind}-${item.id}`} movie={item} />
        ))}
      </div>
    </div>
  );
}
