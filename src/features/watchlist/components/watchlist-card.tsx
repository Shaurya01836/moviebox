import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Edit3, Trash2, Quote, Sparkles, Heart, Play } from 'lucide-react';
import { WatchlistItem, WATCH_STATUS_CONFIG } from '../types';
import { Badge } from '@/components/ui/badge';

interface WatchlistCardProps {
  item: WatchlistItem;
  onEdit: (item: WatchlistItem) => void;
  onDelete: (mediaId: string) => void;
  index?: number;
}

export function WatchlistCard({ item, onEdit, onDelete, index = 0 }: WatchlistCardProps) {
  const statusCfg = WATCH_STATUS_CONFIG[item.status] || WATCH_STATUS_CONFIG.watchlist;
  const [showSpoilers, setShowSpoilers] = React.useState(false);

  return (
    <div className="group relative flex flex-col space-y-2.5 transition-all">
      {/* Poster Image Container */}
      <div className="relative block aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900">
        <Image
          src={item.posterPath}
          alt={item.title}
          fill
          priority={index < 8}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Top-Left Status Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className={`backdrop-blur-md border text-[10px] font-bold shadow-md ${statusCfg.badgeClass}`}>
            <span className="mr-1">{statusCfg.emoji}</span> {statusCfg.label}
          </Badge>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 p-4 text-center">
          
          {/* Main Play Link */}
          <Link 
            href={`/${item.mediaKind === 'tv' ? 'tv' : 'movies'}/${item.mediaId}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 transition-transform hover:scale-110 mb-4"
          >
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </Link>

          <Link href={`/${item.mediaKind === 'tv' ? 'tv' : 'movies'}/${item.mediaId}`}>
            <h3 className="text-sm font-bold text-white line-clamp-2 hover:text-red-400 transition-colors">
              {item.title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-300 mt-1">
            <span>{item.releaseYear || ''}</span>
            {(item.userRating || item.voteAverage) ? (
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                <span>{item.userRating ? item.userRating.toFixed(1) : item.voteAverage?.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer backdrop-blur-md"
              title="Edit Entry"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.mediaId)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer backdrop-blur-md"
              title="Delete Entry"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
