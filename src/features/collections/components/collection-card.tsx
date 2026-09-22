'use client';

import * as React from 'react';
import Link from 'next/link';
import { CollectionWithItems } from '../types';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';
import { Film } from 'lucide-react';

interface CollectionCardProps {
  collection: CollectionWithItems;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const { items: watchlistItems } = useWatchlist();

  // Get up to 4 posters from the collection's items
  const posters = React.useMemo(() => {
    return collection.items
      .map(ci => watchlistItems.find(wi => wi.mediaId === ci.mediaId)?.posterPath)
      .filter((p): p is string => Boolean(p))
      .slice(0, 4);
  }, [collection.items, watchlistItems]);

  return (
    <Link href={`/collections/${collection.id}`} className="block group">
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50 shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-red-900/20 group-hover:border-white/20">
        
        {/* Cover Generation */}
        {collection.coverPath ? (
          <img src={collection.coverPath} alt={collection.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : posters.length >= 4 ? (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity bg-zinc-950">
            {posters.map((p, i) => (
              <img key={i} src={p} alt="Cover piece" className="w-full h-full object-cover" />
            ))}
          </div>
        ) : posters.length > 0 ? (
          <img src={posters[0]} alt={collection.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700 group-hover:text-zinc-500 transition-colors">
            <Film className="w-12 h-12 opacity-50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

        {/* Text Content */}
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 flex flex-col justify-end">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight line-clamp-2 leading-tight mb-1">
            {collection.name}
          </h3>
          <p className="text-xs font-semibold text-zinc-400">
            {collection.items.length} {collection.items.length === 1 ? 'title' : 'titles'}
          </p>
        </div>
      </div>
    </Link>
  );
}
