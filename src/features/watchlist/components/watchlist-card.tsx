import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Edit3, Trash2, Quote, Sparkles, Heart } from 'lucide-react';
import { WatchlistItem, WATCH_STATUS_CONFIG } from '../types';
import { Badge } from '@/components/ui/badge';

interface WatchlistCardProps {
  item: WatchlistItem;
  onEdit: (item: WatchlistItem) => void;
  onDelete: (mediaId: string) => void;
}

export function WatchlistCard({ item, onEdit, onDelete }: WatchlistCardProps) {
  const statusCfg = WATCH_STATUS_CONFIG[item.status] || WATCH_STATUS_CONFIG.watchlist;
  const [showSpoilers, setShowSpoilers] = React.useState(false);

  return (
    <div className="group relative flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-3xl border border-white/10 bg-zinc-950 p-4 sm:p-5 shadow-xl transition-all duration-300 hover:border-zinc-700/80">
      {/* Poster Column */}
      <div className="relative aspect-[2/3] w-full sm:w-36 overflow-hidden rounded-2xl bg-zinc-900 shrink-0">
        <Image
          src={item.posterPath}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, 150px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status Badge */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className={`backdrop-blur-md border text-[11px] font-bold ${statusCfg.badgeClass}`}>
            <span className="mr-1">{statusCfg.emoji}</span> {statusCfg.label}
          </Badge>
        </div>
      </div>

      {/* Info Column */}
      <div className="flex flex-1 flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Header & Title */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/${item.mediaKind === 'tv' ? 'tv' : 'movies'}/${item.mediaId}`}>
                <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </Link>
              <p className="text-xs text-zinc-500">{item.releaseYear || ''}</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-300 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                title="Edit Entry"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.mediaId)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                title="Delete Entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Rating & Mood Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {item.userRating && (
              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>{item.userRating.toFixed(1)} / 10</span>
              </div>
            )}

            {item.journal?.emotionTag && (
              <Badge variant="glass" className="text-xs text-red-300 border-red-500/30">
                {item.journal.emotionTag}
              </Badge>
            )}
          </div>

          {/* Aspect Ratings Pills */}
          {item.aspects && (
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-zinc-400">
              {item.aspects.story && (
                <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                  Story: <strong className="text-zinc-200">{item.aspects.story}</strong>
                </span>
              )}
              {item.aspects.visuals && (
                <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                  Visuals: <strong className="text-zinc-200">{item.aspects.visuals}</strong>
                </span>
              )}
              {item.aspects.acting && (
                <span className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5">
                  Acting: <strong className="text-zinc-200">{item.aspects.acting}</strong>
                </span>
              )}
            </div>
          )}

          {/* Review / Journal Content */}
          {item.journal?.review && (
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-xs text-zinc-300 space-y-1">
              {item.journal.isSpoiler && !showSpoilers ? (
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-semibold">⚠️ Contains Spoilers</span>
                  <button
                    type="button"
                    onClick={() => setShowSpoilers(true)}
                    className="text-[11px] text-zinc-400 hover:text-white underline"
                  >
                    Reveal Review
                  </button>
                </div>
              ) : (
                <p className="line-clamp-2 italic text-zinc-300">&quot;{item.journal.review}&quot;</p>
              )}
            </div>
          )}

          {/* Favorites Snippets */}
          <div className="flex flex-wrap gap-4 text-xs text-zinc-400 pt-1">
            {item.journal?.favoriteCharacter && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-400" />
                <span>Fav Character: <strong className="text-zinc-200">{item.journal.favoriteCharacter}</strong></span>
              </span>
            )}
            {item.journal?.favoriteQuote && (
              <span className="flex items-center gap-1 line-clamp-1">
                <Quote className="h-3 w-3 text-amber-400" />
                <span>Quote: <strong className="text-zinc-200">&quot;{item.journal.favoriteQuote}&quot;</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-zinc-600" />
            Updated {new Date(item.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
