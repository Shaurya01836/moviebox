'use client';

import * as React from 'react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useWatchlist } from '@/features/watchlist/context/watchlist-context';
import { useCollections } from '@/features/collections/context/collections-context';
import { ArrowLeft, Star, Heart, Smile, Folder, Edit3 } from 'lucide-react';
import { Poster } from '@/components/shared/poster';

export default function PersonalMediaDetail() {
  const params = useParams();
  const router = useRouter();
  const mediaId = params.mediaId as string;

  const { getByMediaId, isLoading: watchlistLoading } = useWatchlist();
  const { collections, isLoading: collectionsLoading } = useCollections();

  const item = getByMediaId(mediaId);

  // We should wait for watchlist to load
  if (watchlistLoading || collectionsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a0a0c] pt-20 justify-center items-center">
        <div className="animate-pulse w-12 h-12 rounded-full bg-white/10" />
      </div>
    );
  }

  if (!item) {
    return notFound();
  }

  // Find collections that contain this title
  const memberCollections = collections.filter(c => 
    c.items.some(i => String(i.mediaId) === String(mediaId))
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0c] pb-24">
      {/* Dynamic Backdrop */}
      {item.backdropPath && (
        <div className="absolute inset-0 top-0 h-[60vh] w-full z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent z-10" />
          <img
            src={`https://image.tmdb.org/t/p/w1280${item.backdropPath}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 relative z-10 space-y-12">
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        {/* Hero Section */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 items-start">
          <div className="w-48 sm:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 relative">
            <Poster src={item.posterPath} alt={item.title} />
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">{item.title}</h1>
              <p className="text-lg text-zinc-400 font-medium">{item.releaseYear}</p>
            </div>

            {/* Personal Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Rating */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Star className="w-4 h-4" /> Your Rating
                </h3>
                {item.userRating ? (
                  <div className="text-4xl font-black text-amber-400">
                    {item.userRating.toFixed(1)} <span className="text-xl text-zinc-500">/ 10</span>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">Not rated</p>
                )}
              </div>

              {/* Moods */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Smile className="w-4 h-4" /> Mood
                </h3>
                {item.moods && item.moods.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.moods.map(mood => (
                      <span key={mood} className="px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm font-medium shadow-sm">
                        {mood}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">No moods selected</p>
                )}
              </div>

              {/* Favorite Characters */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Favorite Characters
                </h3>
                {item.favoriteCharacters && item.favoriteCharacters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {item.favoriteCharacters.map(char => (
                      <div key={char.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-200">
                        {char.profilePath && <img src={`https://image.tmdb.org/t/p/w45${char.profilePath}`} className="w-5 h-5 rounded-full object-cover" />}
                        <span className="text-sm font-medium">{char.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">None selected</p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Collections Shelf */}
        <div className="pt-8 border-t border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-red-500" /> In Your Collections
          </h2>

          {memberCollections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {memberCollections.map(col => (
                <Link 
                  key={col.id} 
                  href={`/collections/${col.id}`}
                  className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  {/* Collage Preview */}
                  <div className="flex gap-1 mb-4 h-16 opacity-80 group-hover:opacity-100 transition-opacity">
                    {col.items.slice(0, 3).map((ci, idx) => (
                      <img key={ci.mediaId} src={ci.posterPath} className={`w-11 h-16 object-cover rounded-md shadow-md ${idx > 0 ? '-ml-4' : ''}`} style={{ zIndex: 3 - idx }} />
                    ))}
                  </div>
                  <h4 className="text-base font-bold text-white text-center line-clamp-1">{col.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1">{col.items.length} titles</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 text-center">
              <p className="text-zinc-400">Not in any custom collections yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
