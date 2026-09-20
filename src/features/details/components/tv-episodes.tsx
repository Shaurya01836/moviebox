'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ChevronDown, Play } from 'lucide-react';
import { TvSeason, TvEpisode } from '@/types/movie';

interface TvEpisodesProps {
  tmdbId: string | number;
  seasons: TvSeason[];
  allEpisodes: TvEpisode[];
  fallbackImage?: string;
}

export function TvEpisodes({ tmdbId, seasons, allEpisodes, fallbackImage }: TvEpisodesProps) {
  const validSeasons = seasons.filter((s) => s.seasonNumber > 0 && s.episodeCount > 0);
  const [activeSeason, setActiveSeason] = React.useState<number>(validSeasons[0]?.seasonNumber || 1);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  if (validSeasons.length === 0) return null;

  const currentEpisodes = allEpisodes.filter((ep) => ep.seasonNumber === activeSeason);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-16 mx-auto max-w-[1600px] border-t border-white/5">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Episodes</h2>
        
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-semibold text-zinc-300 hover:text-white transition-colors">
            Ratings
          </button>
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-semibold text-zinc-300 hover:text-white transition-colors">
            ↑↓ Oldest
          </button>
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs font-semibold text-zinc-300 hover:text-white transition-colors">
            <Eye className="w-3 h-3" />
            Mark watched
          </button>

          {/* Season Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-zinc-800 border border-zinc-700 text-xs sm:text-sm font-bold text-white hover:bg-zinc-700 transition-colors"
            >
              Season {activeSeason}
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto scrollbar-none py-2">
                  {validSeasons.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSeason(s.seasonNumber);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        activeSeason === s.seasonNumber
                          ? 'bg-red-600/10 text-red-500'
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      Season {s.seasonNumber}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Episodes Carousel */}
      <div className="w-full overflow-x-auto scrollbar-none pb-6 -mx-4 sm:-mx-6 lg:-mx-16 px-4 sm:px-6 lg:px-16">
        <div className="flex gap-3.5 sm:gap-4 w-max">
          {currentEpisodes.map((ep) => (
            <div key={ep.id} className="w-[230px] sm:w-[320px] shrink-0 group flex flex-col gap-2.5 sm:gap-3">
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-white/10 transition-transform group-hover:border-white/20">
                {(ep.stillPath || fallbackImage) ? (
                  <Image
                    src={ep.stillPath || fallbackImage || ''}
                    alt={ep.name}
                    fill
                    sizes="(max-width: 640px) 230px, 320px"
                    className="object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    No Image
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100" />
                
                {/* Overlay Meta */}
                <div className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-white tracking-wider border border-white/10">
                  E{ep.episodeNumber}
                </div>
                
                {ep.runtime && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-zinc-300">
                    {ep.runtime}m
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <Link 
                  href={`/play/tv/${tmdbId}/${activeSeason}/${ep.episodeNumber}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 text-white backdrop-blur-[2px] transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                >
                  <div className="p-3 sm:p-4 rounded-full bg-red-600 shadow-xl border border-red-500/50 transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                  </div>
                </Link>
                
                {/* Secondary Actions */}
                <button className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/80 border border-white/10 text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100 z-20">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Episode Info */}
              <div className="space-y-1 pr-2 sm:pr-4">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-tight group-hover:text-red-400 transition-colors line-clamp-1">
                  {ep.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {ep.overview || 'No overview available for this episode.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
