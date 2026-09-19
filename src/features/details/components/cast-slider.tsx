import * as React from 'react';
import Image from 'next/image';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string;
}

interface CastSliderProps {
  cast?: CastMember[];
}

export function CastSlider({ cast }: CastSliderProps) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="py-8 sm:py-12">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-8 px-4 sm:px-8 lg:px-16 mx-auto max-w-[1600px]">Cast</h2>
      
      {/* Horizontal scroll container */}
      <div className="w-full overflow-x-auto scrollbar-none pl-4 sm:pl-8 lg:pl-16 pb-4">
        <div className="flex gap-4 sm:gap-8 w-max pr-4 sm:pr-8 lg:pr-16">
          {cast.map((actor) => (
            <div key={actor.id} className="flex flex-col items-center group w-20 sm:w-32">
              <div className="relative w-16 h-16 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-2 sm:mb-3 border-2 border-transparent group-hover:border-white/20 transition-all shadow-xl group-hover:shadow-2xl group-hover:-translate-y-1">
                {actor.profilePath ? (
                  <Image
                    src={actor.profilePath}
                    alt={actor.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-lg sm:text-xl text-zinc-500 font-bold">{actor.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-white text-center leading-tight mb-0.5 sm:mb-1 group-hover:text-red-400 transition-colors line-clamp-2">
                {actor.name}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-400 text-center leading-tight line-clamp-2">
                {actor.character}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
