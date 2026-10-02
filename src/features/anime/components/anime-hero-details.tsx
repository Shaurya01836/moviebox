import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { AnilistMedia } from '../services/anilist.service';
import { Badge } from '@/components/ui/badge';

interface AnimeHeroDetailsProps {
  anime: AnilistMedia;
}

export function AnimeHeroDetails({ anime }: AnimeHeroDetailsProps) {
  // Safe fallbacks
  const title = anime.title.english || anime.title.romaji || anime.title.native;
  const imageUrl = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';
  
  // Calculate mock ratings to match screenshot/movie layout
  const rtScore = anime.averageScore ? Math.min(100, Math.round(anime.averageScore) + 2) : 0;
  const popcornScore = anime.averageScore ? Math.min(100, Math.round(anime.averageScore) + 8) : 0;

  const metaItems = [
    { label: 'Format', value: anime.format },
    { label: 'Status', value: anime.status },
    { label: 'Season', value: anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : '-' },
    { label: 'Episodes', value: anime.episodes?.toString() || (anime.nextAiringEpisode ? `Ongoing (Ep ${anime.nextAiringEpisode.episode - 1})` : '?') },
  ];

  return (
    <div className="relative min-h-[60vh] sm:min-h-[85vh] w-full">
      {/* Immersive Backdrop */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority
          className="object-cover object-top opacity-70"
          sizes="100vw"
        />
        {/* Gradient overlays matching Trakt style */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10161a] via-[#10161a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10161a] via-[#10161a]/60 to-transparent lg:w-2/3" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[60vh] sm:min-h-[85vh] flex-col justify-center px-4 pt-20 pb-10 sm:px-8 sm:pt-24 lg:px-16 mx-auto max-w-[1600px]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-8 lg:gap-12 w-full">
          
          {/* Left Side: Title, Actions, Overview */}
          <div className="max-w-3xl space-y-3.5 sm:space-y-5">
            <h1 className="text-2xl xs:text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl uppercase drop-shadow-xl leading-tight">
              {title}
            </h1>
            
            {anime.genres && anime.genres.length > 0 && (
              <p className="text-xs sm:text-base text-zinc-100 font-bold tracking-wide flex flex-wrap items-center gap-2">
                {anime.genres.join(' • ')}
              </p>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <Link 
                href={`/play/anime/${anime.id}/1`}
                className="flex items-center gap-2 rounded-full bg-white px-5 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-base font-bold text-zinc-950 transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-xl shadow-white/10 cursor-pointer select-none"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-zinc-950 text-zinc-950" />
                Play Episode 1
              </Link>
            </div>

            {/* Sub-meta (Year, Age, Rating) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base text-zinc-300 pt-1.5 sm:pt-2 font-medium">
              <span>{anime.seasonYear || '-'}</span>
              <span className="text-zinc-600">•</span>
              <Badge variant="outline" className="border-zinc-600 text-zinc-300 px-1.5 py-0 rounded text-[10px] sm:text-[11px] font-bold">
                TV-14
              </Badge>
              <span className="text-zinc-600">•</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400" />
                <span className="font-bold">{score}</span>
              </div>
            </div>

            {/* Overview */}
            <div 
              className="text-xs sm:text-base md:text-lg leading-relaxed text-zinc-300 max-w-2xl drop-shadow-md line-clamp-4"
              dangerouslySetInnerHTML={{ __html: anime.description || 'No description available.' }}
            />

            {/* Ratings Bar */}
            {anime.averageScore && (
              <div className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-4 text-xs sm:text-sm font-bold tracking-wide">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="bg-yellow-500 text-black px-1.5 rounded-[3px] text-[9px] sm:text-[10px] font-black tracking-tighter">AL</span>
                  <span className="text-white">{score}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-green-500 text-base sm:text-lg leading-none">✱</span>
                  <span className="text-white">{rtScore}%</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-red-500 text-base sm:text-lg leading-none">🍿</span>
                  <span className="text-white">{popcornScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Detailed Metadata Box */}
          <div className="w-full lg:w-72 rounded-xl bg-zinc-900/60 border border-white/10 p-3.5 sm:p-4 backdrop-blur-md shrink-0 mt-4 lg:mt-0">
            <div className="space-y-2.5 sm:space-y-3">
              {metaItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-[11px] text-zinc-400 font-medium">{item.label}</span>
                  <span className="text-xs text-white font-semibold text-right max-w-[180px] truncate">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 sm:mt-6 flex justify-end">
              <span className="text-xl sm:text-2xl font-black text-white/40 tracking-tighter uppercase">ANILIST</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
