import React, { useMemo } from 'react';
import { WatchlistItem } from '@/features/watchlist/types';

interface GenreAnalyticsProps {
  items: WatchlistItem[];
}

export function GenreAnalytics({ items }: GenreAnalyticsProps) {
  const genreData = useMemo(() => {
    const map = new Map<string, { count: number; totalRating: number; ratedCount: number }>();
    
    items.forEach(item => {
      (item.genres || []).forEach(genre => {
        const existing = map.get(genre) || { count: 0, totalRating: 0, ratedCount: 0 };
        existing.count++;
        if (typeof item.userRating === 'number') {
          existing.totalRating += item.userRating;
          existing.ratedCount++;
        }
        map.set(genre, existing);
      });
    });

    return Array.from(map.entries())
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        avgRating: data.ratedCount >= 3 ? (data.totalRating / data.ratedCount).toFixed(1) : '-',
        numRating: data.ratedCount >= 3 ? (data.totalRating / data.ratedCount) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  if (genreData.length === 0) return null;

  const topGenres = genreData.slice(0, 5);
  
  // Highest rated genres (min 3 ratings)
  const highestRated = [...genreData]
    .filter(g => g.avgRating !== '-')
    .sort((a, b) => b.numRating - a.numRating)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight mb-1">MOST WATCHED GENRES</h2>
          <p className="text-sm text-zinc-400">The genres that dominate your library.</p>
        </div>
        
        <div className="space-y-4">
          {topGenres.map((data, i) => {
            const widthPct = (data.count / topGenres[0].count) * 100;
            return (
              <div key={data.genre} className="relative">
                <div className="flex justify-between text-sm font-bold text-white mb-1 relative z-10 px-2">
                  <span>{data.genre}</span>
                  <span>{data.count}</span>
                </div>
                <div className="h-8 w-full bg-zinc-950/50 rounded-lg overflow-hidden border border-white/5 absolute top-0">
                  <div 
                    className="h-full bg-blue-500/20 rounded-lg transition-all duration-1000 ease-out"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {highestRated.length > 0 && (
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">HIGHEST RATED GENRES</h2>
            <p className="text-sm text-zinc-400">What you actually score the highest.</p>
          </div>
          
          <div className="flex flex-col justify-center h-[calc(100%-4rem)] gap-4">
            {highestRated.map((data, i) => (
              <div key={data.genre} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 font-bold text-xs border border-amber-500/20">
                    #{i + 1}
                  </div>
                  <span className="text-base font-bold text-white">{data.genre}</span>
                </div>
                <span className="text-xl font-black text-amber-500">{data.avgRating}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
