import React, { useMemo } from 'react';
import { Collection } from '@/features/collections/types';
import { WatchlistItem } from '@/features/watchlist/types';
import { Folder } from 'lucide-react';

interface CollectionAnalyticsProps {
  collections: Collection[];
  items: WatchlistItem[];
}

export function CollectionAnalytics({ collections, items }: CollectionAnalyticsProps) {
  const data = useMemo(() => {
    if (collections.length === 0) return null;

    const sortedCollections = [...collections].sort((a, b) => b.mediaIds.length - a.mediaIds.length);
    const largest = sortedCollections[0];

    const itemCollectionCounts = new Map<string, number>();
    collections.forEach(c => {
      c.mediaIds.forEach(id => {
        itemCollectionCounts.set(id, (itemCollectionCounts.get(id) || 0) + 1);
      });
    });

    let mostCollectedId: string | null = null;
    let maxCollections = 0;
    Array.from(itemCollectionCounts.entries()).forEach(([id, count]) => {
      if (count > maxCollections) {
        maxCollections = count;
        mostCollectedId = id;
      }
    });

    const mostCollectedItem = mostCollectedId ? items.find(i => String(i.mediaId) === String(mostCollectedId)) : null;

    return {
      total: collections.length,
      largest,
      mostCollectedItem,
      maxCollections
    };
  }, [collections, items]);

  if (!data) return null;

  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row gap-6 items-center sm:items-stretch">
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 text-blue-500">
          <Folder className="h-5 w-5" />
          <h2 className="text-xl font-bold tracking-tight">COLLECTIONS</h2>
        </div>
        <p className="text-sm text-zinc-400">You have curated <strong className="text-white">{data.total}</strong> custom collections.</p>
        {data.largest && (
          <p className="text-sm text-zinc-400">
            Your largest is <strong className="text-white">{data.largest.name}</strong> with {data.largest.mediaIds.length} titles.
          </p>
        )}
      </div>

      {data.mostCollectedItem && data.maxCollections > 1 && (
        <div className="shrink-0 flex items-center gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-white/5">
          <div className="w-12 aspect-[2/3] rounded overflow-hidden shadow-lg border border-white/10 shrink-0">
            <img src={data.mostCollectedItem.posterPath} alt={data.mostCollectedItem.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Most Collected</div>
            <div className="text-sm font-bold text-white leading-tight mb-1">{data.mostCollectedItem.title}</div>
            <div className="text-xs text-blue-400 font-semibold">Appears in {data.maxCollections} collections</div>
          </div>
        </div>
      )}
    </div>
  );
}
