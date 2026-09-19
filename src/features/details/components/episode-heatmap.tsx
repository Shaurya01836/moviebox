'use client';

import * as React from 'react';
import { TvSeason, TvEpisode } from '@/types/movie';

interface EpisodeHeatmapProps {
  seasons: TvSeason[];
  allEpisodes: TvEpisode[];
}

export function EpisodeHeatmap({ seasons, allEpisodes }: EpisodeHeatmapProps) {
  const validSeasons = seasons.filter((s) => s.seasonNumber > 0 && s.episodeCount > 0);
  if (validSeasons.length === 0 || allEpisodes.length === 0) return null;

  // Find the max episode count to determine number of rows
  const maxEpisodes = Math.max(...validSeasons.map(s => s.episodeCount));
  
  // Matrix: [episodeIndex][seasonIndex] = TvEpisode | undefined
  const matrix: (TvEpisode | undefined)[][] = Array.from({ length: maxEpisodes }, () => 
    Array.from({ length: validSeasons.length }, () => undefined)
  );

  allEpisodes.forEach(ep => {
    const sIndex = validSeasons.findIndex(s => s.seasonNumber === ep.seasonNumber);
    const eIndex = ep.episodeNumber - 1;
    if (sIndex !== -1 && eIndex >= 0 && eIndex < maxEpisodes) {
      matrix[eIndex][sIndex] = ep;
    }
  });

  const getColorClass = (rating: number) => {
    if (rating >= 9.0) return 'bg-[#119911] text-white border-[#119911]'; // Dark Green
    if (rating >= 8.0) return 'bg-[#21b721] text-white border-[#21b721]'; // Green
    if (rating >= 7.0) return 'bg-[#f7aa11] text-zinc-950 border-[#f7aa11]'; // Yellow
    if (rating >= 6.0) return 'bg-[#e26922] text-white border-[#e26922]'; // Orange
    if (rating > 0) return 'bg-[#db3535] text-white border-[#db3535]'; // Red
    return 'bg-zinc-800 text-zinc-500 border-zinc-700'; // Unrated
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-16 mx-auto max-w-[1600px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Episode Ratings</h2>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-bold text-zinc-400">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#119911]" /> 9.0+</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#21b721]" /> 8.0–8.9</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#f7aa11]" /> 7.0–7.9</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#e26922]" /> 6.0–6.9</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#db3535]" /> &lt; 6.0</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-zinc-800" /> Not rated</div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto scrollbar-none pb-4 sm:pb-6 rounded-2xl bg-zinc-950 border border-white/5 p-4 sm:p-6 shadow-2xl">
        <div className="min-w-max">
          {/* Header Row (Seasons) */}
          <div className="flex">
            <div className="w-8 shrink-0" /> {/* Empty corner */}
            {validSeasons.map(s => (
              <div key={s.id} className="w-12 shrink-0 text-center text-xs font-bold text-zinc-400 pb-2">
                S{s.seasonNumber}
              </div>
            ))}
          </div>

          {/* Grid Rows (Episodes) */}
          <div className="flex flex-col gap-1.5">
            {matrix.map((row, rowIdx) => {
              // Hide completely empty rows at the bottom
              if (row.every(cell => cell === undefined)) return null;

              return (
                <div key={rowIdx} className="flex gap-1.5 items-center">
                  {/* Episode Number Column */}
                  <div className="w-8 shrink-0 text-right pr-2 text-xs font-bold text-zinc-500">
                    E{rowIdx + 1}
                  </div>
                  
                  {/* Rating Cells */}
                  {row.map((ep, colIdx) => (
                    <div 
                      key={colIdx} 
                      className="w-[42px] shrink-0 h-[42px] relative group"
                    >
                      {ep ? (
                        <div 
                          className={`w-full h-full rounded flex items-center justify-center text-xs font-black border transition-transform cursor-crosshair hover:scale-110 hover:z-10 shadow-sm ${getColorClass(ep.voteAverage)}`}
                          title={`S${ep.seasonNumber}E${ep.episodeNumber}: ${ep.name}\nRating: ${ep.voteAverage}/10`}
                        >
                          {ep.voteAverage > 0 ? ep.voteAverage.toFixed(1) : '-'}
                        </div>
                      ) : (
                        <div className="w-full h-full rounded border border-transparent bg-transparent" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
