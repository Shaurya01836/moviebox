import React, { useMemo } from 'react';
import { WatchlistItem, Person } from '@/features/watchlist/types';

interface PeopleAnalyticsProps {
  items: WatchlistItem[];
}

export function PeopleAnalytics({ items }: PeopleAnalyticsProps) {
  const actorsData = useMemo(() => {
    const map = new Map<string, { person: Person; count: number; totalRating: number; ratedCount: number }>();
    
    items.forEach(item => {
      (item.favoriteActors || []).forEach(actor => {
        const existing = map.get(actor.id) || { person: actor, count: 0, totalRating: 0, ratedCount: 0 };
        existing.count++;
        if (typeof item.userRating === 'number') {
          existing.totalRating += item.userRating;
          existing.ratedCount++;
        }
        map.set(actor.id, existing);
      });
    });

    return Array.from(map.values())
      .map(d => ({
        ...d,
        avgRating: d.ratedCount > 0 ? (d.totalRating / d.ratedCount).toFixed(1) : '-',
      }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  const charsData = useMemo(() => {
    const map = new Map<string, { person: Person; count: number }>();
    
    items.forEach(item => {
      (item.favoriteCharacters || []).forEach(char => {
        const existing = map.get(char.id) || { person: char, count: 0 };
        existing.count++;
        map.set(char.id, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [items]);

  if (actorsData.length === 0 && charsData.length === 0) return null;

  return (
    <div className="space-y-6">
      {actorsData.length > 0 && (
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">FAVORITE ACTORS</h2>
            <p className="text-sm text-zinc-400">People whose performances you loved.</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
            {actorsData.map(data => (
              <div key={data.person.id} className="min-w-[140px] snap-start flex flex-col gap-3 group">
                <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-colors bg-zinc-800 shrink-0">
                  {data.person.profilePath ? (
                    <img 
                      src={data.person.profilePath} 
                      alt={data.person.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-4xl">
                      {data.person.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-white line-clamp-1">{data.person.name}</h3>
                  <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">
                    {data.count} favorites
                  </div>
                  {data.avgRating !== '-' && (
                    <div className="text-[10px] font-bold text-amber-500 mt-1 uppercase">
                      Avg Rating: {data.avgRating}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {charsData.length > 0 && (
        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">FAVORITE CHARACTERS</h2>
            <p className="text-sm text-zinc-400">The fictional icons you connected with most.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {charsData.slice(0, 12).map(data => (
              <div key={data.person.id} className="flex flex-col bg-zinc-950/50 rounded-2xl p-4 border border-white/5 text-center">
                <span className="text-sm font-bold text-white line-clamp-2">{data.person.name}</span>
                <span className="text-xs text-zinc-500 font-semibold mt-1">{data.count} selections</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
