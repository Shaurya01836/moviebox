import Image from 'next/image';
import Link from 'next/link';
import { AnilistMedia } from '../services/anilist.service';

interface AnimeCardProps {
  anime: AnilistMedia;
}

export function AnimeCard({ anime }: AnimeCardProps) {
  // Try to use banner for landscape, fallback to cover
  const imageUrl = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;

  return (
    <Link 
      href={`/anime/${anime.id}`}
      className="group relative flex flex-col gap-2 transition-transform duration-300 hover:scale-[1.02]"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-white/5">
        <Image
          src={imageUrl}
          alt={anime.title.english || anime.title.romaji}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-all duration-300 group-hover:brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex gap-2 text-xs font-semibold">
            {anime.genres.slice(0, 2).map((genre) => (
              <span key={genre} className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-white">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="px-1">
        <h3 className="font-bold text-sm sm:text-base text-zinc-100 line-clamp-1 group-hover:text-red-500 transition-colors">
          {anime.title.english || anime.title.romaji}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {anime.format} • {anime.episodes ? `${anime.episodes} Episodes` : anime.status}
        </p>
      </div>
    </Link>
  );
}
