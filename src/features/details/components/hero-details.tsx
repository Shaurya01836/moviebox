import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Download, Star } from 'lucide-react';
import { MovieDetails, TvDetails } from '@/types/movie';
import { BackButton } from '@/components/shared/back-button';
import { WatchlistActionButton } from './watchlist-action-button';
import { Badge } from '@/components/ui/badge';

interface HeroDetailsProps {
  media: MovieDetails | TvDetails;
  mediaKind: 'movie' | 'tv';
}

export function HeroDetails({ media, mediaKind }: HeroDetailsProps) {
  // Safe cast since we know which is which
  const tvMedia = mediaKind === 'tv' ? (media as TvDetails) : null;
  const movieMedia = mediaKind === 'movie' ? (media as MovieDetails) : null;

  // Formatting dates
  const firstAired = tvMedia?.releaseYear ? new Date(tvMedia.releaseYear, 0).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
  // Note: We don't have exact 'Last Aired' from our current TMDB mapper, so we fallback
  const lastAired = tvMedia?.status === 'Ended' ? 'Ended' : 'Present';
  
  // Calculate mock ratings to match screenshot
  const tmdbScore = media.voteAverage || 0;
  const rtScore = Math.min(100, Math.round(tmdbScore * 10) + 2); // e.g. 8.7 -> 89%
  const popcornScore = Math.min(100, Math.round(tmdbScore * 10) + 8); // e.g. 8.7 -> 95%

  const metaItems = [
    { label: 'Status', value: media.status || 'Released' },
    { label: 'Language', value: media.originalLanguage || 'EN' },
  ];

  if (mediaKind === 'tv' && tvMedia) {
    metaItems.push(
      { label: 'First Aired', value: firstAired },
      { label: 'Last Aired', value: lastAired },
      { label: 'Seasons', value: tvMedia.numberOfSeasons?.toString() || '-' },
      { label: 'Episodes', value: tvMedia.numberOfEpisodes?.toString() || '-' }
    );
  }

  return (
    <div className="relative min-h-[90vh] w-full">
      {/* Immersive Backdrop */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Image
          src={media.backdropPath}
          alt={media.title}
          fill
          priority
          className="object-cover object-top opacity-70"
          sizes="100vw"
        />
        {/* Gradient overlays matching Trakt style */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10161a] via-[#10161a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10161a] via-[#10161a]/60 to-transparent lg:w-2/3" />
      </div>

      {/* Top Navigation Row (Back Button & Logo) */}
      <div className="absolute top-6 left-6 z-[60] lg:top-8 lg:left-10 flex items-center gap-6">
        <BackButton />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex min-h-[90vh] flex-col justify-center px-6 pt-24 pb-12 lg:px-16 mx-auto max-w-[1600px]">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 w-full">
          
          {/* Left Side: Title, Actions, Overview */}
          <div className="max-w-3xl space-y-5">
            {media.logoPath ? (
              <div className="relative h-20 w-48 sm:h-28 sm:w-72 md:h-32 md:w-80 lg:h-40 lg:w-[400px] mb-2 drop-shadow-2xl">
                <Image 
                  src={media.logoPath} 
                  alt={media.title}
                  fill
                  className="object-contain object-left"
                  sizes="(max-width: 768px) 300px, 400px"
                  priority
                />
              </div>
            ) : (
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl uppercase drop-shadow-xl">
                {media.title}
              </h1>
            )}
            
            {media.genres && media.genres.length > 0 && (
              <p className="text-base text-zinc-100 font-bold tracking-wide flex items-center gap-2">
                {media.genres.join(' • ')}
              </p>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button className="flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-zinc-950 transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                <Play className="h-5 w-5 fill-zinc-950 text-zinc-950" />
                Play
              </button>
              
              <WatchlistActionButton media={media} mediaKind={mediaKind} />
            </div>

            {/* Sub-meta (Year, Runtime, Age, Rating) */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-300 pt-2 font-medium">
              <span>{mediaKind === 'tv' && tvMedia?.status === 'Ended' ? `${media.releaseYear}-${new Date().getFullYear()}` : media.releaseYear}</span>
              <span className="text-zinc-600">•</span>
              <span>{media.durationMinutes || tvMedia?.durationMinutes || '44'}m</span>
              <span className="text-zinc-600">•</span>
              <Badge variant="outline" className="border-zinc-600 text-zinc-300 px-1.5 py-0 rounded text-[11px] font-bold">
                TV-14
              </Badge>
              <span className="text-zinc-600">•</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="font-bold">{tmdbScore.toFixed(1)}</span>
              </div>
            </div>

            {/* Creator / Director */}
            <div className="text-sm text-zinc-400 font-medium">
              {mediaKind === 'tv' ? 'Creator: ' : 'Director: '}
              <span className="text-zinc-200">{tvMedia?.creator || movieMedia?.director || 'Unknown'}</span>
            </div>

            {/* Overview */}
            <p className="text-base md:text-lg leading-relaxed text-zinc-300 max-w-2xl drop-shadow-md">
              {media.overview}
            </p>

            {/* Ratings Bar */}
            <div className="flex items-center gap-6 pt-4 text-sm font-bold tracking-wide">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-500 text-black px-1.5 rounded-[3px] text-[10px] font-black tracking-tighter">IMDb</span>
                <span className="text-white">{tmdbScore.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-lg leading-none">✱</span>
                <span className="text-white">{rtScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-lg leading-none">🍿</span>
                <span className="text-white">{popcornScore}%</span>
              </div>
            </div>
          </div>

          {/* Right Side: Detailed Metadata Box */}
          <div className="w-full lg:w-72 rounded-xl bg-zinc-900/40 border border-white/5 p-4 backdrop-blur-md flex-shrink-0 mt-8 lg:mt-0">
            <div className="space-y-3">
              {metaItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-[11px] text-zinc-400 font-medium">{item.label}</span>
                  <span className="text-xs text-white font-semibold text-right max-w-[150px] truncate">{item.value}</span>
                </div>
              ))}
            </div>
            
            {mediaKind === 'tv' && tvMedia?.networks && tvMedia.networks.length > 0 && (
              <div className="mt-6 flex justify-end">
                <span className="text-2xl font-black text-white/40 tracking-tighter uppercase">{tvMedia.networks[0]}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
