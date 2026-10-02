import * as React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { AnilistMedia } from '../services/anilist.service';

interface AnimeEpisodesProps {
  anime: AnilistMedia;
}

export function AnimeEpisodes({ anime }: AnimeEpisodesProps) {
  let totalEpisodes = anime.episodes || 1;
  
  // If it's ongoing and we know the next episode, we can show up to next - 1
  if (!anime.episodes && anime.nextAiringEpisode) {
    totalEpisodes = Math.max(1, anime.nextAiringEpisode.episode - 1);
  } else if (!anime.episodes) {
    // Fallback if totally unknown
    totalEpisodes = 12;
  }

  const episodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-8 lg:px-16 mx-auto max-w-[1600px]">
      <div className="flex items-end justify-between mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Episodes</h2>
        <span className="text-sm text-zinc-400 font-medium">{totalEpisodes} Episodes Available</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {episodes.map((ep) => (
          <Link
            key={ep}
            href={`/play/anime/${anime.id}/${ep}`}
            className="group relative flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 hover:border-red-500/50 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 font-bold mb-0.5">EPISODE</span>
              <span className="text-base sm:text-lg font-black text-white group-hover:text-red-400 transition-colors">{ep}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-zinc-400 text-zinc-400 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
