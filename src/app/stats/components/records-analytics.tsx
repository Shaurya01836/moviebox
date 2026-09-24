import React, { useMemo } from 'react';
import { WatchlistItem } from '@/features/watchlist/types';
import Link from 'next/link';
import { Star, History, Trophy } from 'lucide-react';

interface RecordsAnalyticsProps {
  items: WatchlistItem[];
}

export function RecordsAnalytics({ items }: RecordsAnalyticsProps) {
  const records = useMemo(() => {
    if (items.length === 0) return null;

    const ratedItems = items.filter(i => typeof i.userRating === 'number').sort((a, b) => b.userRating! - a.userRating!);
    const highestRated = ratedItems.length > 0 ? ratedItems[0] : null;
    const lowestRated = ratedItems.length > 0 ? ratedItems[ratedItems.length - 1] : null;

    const timeItems = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const firstWatched = timeItems.length > 0 ? timeItems[0] : null;
    const recentlyWatched = timeItems.length > 0 ? timeItems[timeItems.length - 1] : null;

    return { highestRated, lowestRated, firstWatched, recentlyWatched };
  }, [items]);

  if (!records) return null;

  const renderCard = (title: string, item: WatchlistItem | null, icon: any, colorClass: string) => {
    if (!item) return null;
    
    return (
      <Link href={item.mediaKind === 'movie' ? `/movies/${item.mediaId}` : `/tv/${item.mediaId}`} className="group block">
        <div className="rounded-3xl border border-white/5 bg-zinc-950 p-4 transition-all duration-300 hover:border-white/20 hover:bg-zinc-900 shadow-xl overflow-hidden relative">
          <div className="flex gap-4 relative z-10">
            <div className="w-20 shrink-0 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <img src={item.posterPath} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="flex flex-col justify-center">
              <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 ${colorClass}`}>
                {React.createElement(icon, { className: 'h-3 w-3' })}
                {title}
              </div>
              <h3 className="text-base font-bold text-white line-clamp-2 leading-tight mb-2 group-hover:text-red-400 transition-colors">{item.title}</h3>
              {item.userRating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  {item.userRating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
          
          {/* Faint Background Poster */}
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none mix-blend-screen mask-image-gradient-l">
            <img src={item.backdropPath || item.posterPath} className="w-full h-full object-cover object-right" alt="" />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight mb-1">YOUR RECORDS</h2>
        <p className="text-sm text-zinc-400">Significant titles in your entertainment history.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderCard("Highest Rated", records.highestRated, Trophy, "text-amber-500")}
        {renderCard("Lowest Rated", records.lowestRated, Star, "text-zinc-500")}
        {renderCard("First Logged", records.firstWatched, History, "text-blue-500")}
        {renderCard("Most Recent", records.recentlyWatched, History, "text-emerald-500")}
      </div>
    </div>
  );
}
