import Image from 'next/image';
import { AnilistMedia } from '../services/anilist.service';

interface AnimeHeroProps {
  trendingAnime: AnilistMedia[];
}

export function AnimeHero({ trendingAnime }: AnimeHeroProps) {
  // Take top 6 for the collage background
  const collageAnime = trendingAnime.slice(0, 6);

  return (
    <section className="relative w-full h-[50vh] min-h-[400px] overflow-hidden bg-[#0A0A0A] select-none flex items-center border-b border-white/5">
      {/* Dynamic Background Collage */}
      <div className="absolute right-[-10%] top-[-20%] w-[70%] h-[140%] flex gap-4 opacity-40 rotate-[15deg] pointer-events-none z-0">
        <div className="flex flex-col gap-4">
          {collageAnime.slice(0, 3).map((anime, i) => (
            <div key={`col1-${i}`} className="relative w-48 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image src={anime.coverImage.extraLarge} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 mt-20">
          {collageAnime.slice(3, 6).map((anime, i) => (
            <div key={`col2-${i}`} className="relative w-48 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image src={anime.coverImage.extraLarge} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Gradients to fade out the collage */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />

      {/* Hero Content */}
      <div className="relative z-20 px-4 sm:px-10 lg:px-16 w-full max-w-7xl mx-auto flex flex-col justify-center">
        <div className="border-l-4 border-red-600 pl-4 sm:pl-6 max-w-2xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-2 sm:mb-4 drop-shadow-lg">
            Anime
          </h1>
          <p className="text-base sm:text-xl text-zinc-400 font-medium tracking-wide">
            Discover the latest and trending anime
          </p>
        </div>
      </div>
    </section>
  );
}
