'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Star, Bookmark } from 'lucide-react';
import { WatchlistItem, WATCH_STATUS_CONFIG } from '@/features/watchlist/types';
import { Badge } from '@/components/ui/badge';
import { getLogoPathAction } from '@/features/watchlist/actions';

interface WatchlistHeroProps {
  items: WatchlistItem[];
  onOpenItem: (item: WatchlistItem) => void;
}

export function WatchlistHero({ items, onOpenItem }: WatchlistHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dynamicLogos, setDynamicLogos] = useState<Record<string, string>>({});

  // Auto-cycle logic
  useEffect(() => {
    if (!items || items.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <section className="relative w-full h-[50vh] bg-zinc-950 flex flex-col items-center justify-center border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-50" />
        <Bookmark className="w-16 h-16 text-zinc-800 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-400 z-10">Your cinematic journey awaits</h2>
        <p className="text-zinc-600 mt-2 z-10 max-w-md text-center">Add movies and shows to your library to see them featured here.</p>
      </section>
    );
  }

  const currentItem = items[activeIndex];
  const statusConfig = WATCH_STATUS_CONFIG[currentItem.status];

  // Dynamically fetch missing logos for older items in the local watchlist
  useEffect(() => {
    if (!currentItem || currentItem.logoPath || dynamicLogos[currentItem.mediaId]) return;
    
    getLogoPathAction(currentItem.mediaId, currentItem.mediaKind).then(path => {
      if (path) {
        setDynamicLogos(prev => ({ ...prev, [currentItem.mediaId]: path }));
      }
    });
  }, [currentItem, dynamicLogos]);

  const activeLogo = currentItem.logoPath || dynamicLogos[currentItem.mediaId];

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 min-h-[70vh] lg:min-h-[80vh]">
      {/* Background Slides */}
      {items.map((item, index) => (
        <div
          key={item.mediaId}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {item.backdropPath ? (
            <Image
              src={item.backdropPath}
              alt={item.title}
              fill
              priority={index === 0}
              className="object-cover object-center opacity-70"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
        </div>
      ))}

      {/* Cinematic Vignette Overlay Gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/60 to-transparent lg:w-3/4 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 flex h-full min-h-[70vh] lg:min-h-[80vh] flex-col justify-end px-6 sm:px-10 lg:px-16 pb-20 pt-32 mx-auto max-w-7xl w-full">
        <div 
          key={activeIndex} 
          className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out"
        >
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-lg border backdrop-blur-md ${statusConfig.badgeClass} bg-black/40`}>
              <span>{statusConfig.emoji}</span>
              {statusConfig.label}
            </span>
            {currentItem.userRating && (
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-black/40 px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-md text-xs">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                Your Rating: {currentItem.userRating}/10
              </span>
            )}
          </div>

          {activeLogo ? (
            <div className="relative h-16 w-40 sm:h-20 sm:w-56 md:h-28 md:w-72 lg:h-32 lg:w-[350px] mb-2 drop-shadow-2xl">
              <Image 
                src={activeLogo} 
                alt={currentItem.title}
                fill
                className="object-contain object-left"
                sizes="(max-width: 768px) 250px, 350px"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl uppercase drop-shadow-xl" style={{ letterSpacing: '0.05em' }}>
              {currentItem.title}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-zinc-300 drop-shadow-md">
            {currentItem.releaseYear && <span>{currentItem.releaseYear}</span>}
            {currentItem.releaseYear && currentItem.genres && currentItem.genres.length > 0 && <span className="text-zinc-500">•</span>}
            {currentItem.genres && currentItem.genres.length > 0 && (
              <span className="text-zinc-100">{currentItem.genres.slice(0, 3).join(' • ')}</span>
            )}
          </div>

          {currentItem.journal?.review ? (
            <p className="text-sm md:text-base leading-relaxed text-zinc-300 max-w-xl line-clamp-3 italic border-l-2 border-white/20 pl-4 py-1">
              "{currentItem.journal.review}"
            </p>
          ) : (
            <p className="text-sm md:text-base leading-relaxed text-zinc-400 max-w-xl line-clamp-2">
              You haven't written a review for this {currentItem.mediaKind} yet.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onOpenItem(currentItem)}
              className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              <Play className="h-4 w-4 fill-zinc-950 text-zinc-950" />
              {currentItem.status === 'watching' ? 'Resume' : 'Watch Now'}
            </button>
            <Link
              href={`/${currentItem.mediaKind === 'movie' ? 'movies' : 'tv'}/${currentItem.mediaId}`}
              className="flex items-center gap-2 rounded-full bg-zinc-800/80 border border-zinc-700/60 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-700 hover:scale-105 active:scale-95 backdrop-blur-md shadow-xl"
            >
              <Info className="h-4 w-4" />
              Details
            </Link>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="absolute bottom-8 left-6 sm:left-10 lg:left-16 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIndex ? 'w-8 bg-red-600' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
