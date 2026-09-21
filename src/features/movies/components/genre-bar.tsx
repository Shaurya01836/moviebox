import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface GenreBarProps {
  genres: { id: number; name: string }[];
  activeGenreId?: string;
}

export function GenreBar({ genres, activeGenreId }: GenreBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400">Explore Genres</h2>
      </div>
      <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap gap-2 sm:gap-2.5 scrollbar-none sm:scrollbar-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {genres.map((genre) => {
          const isActive = activeGenreId === genre.id.toString();
          return (
            <Link key={genre.id} href={isActive ? '/' : `/?genre=${genre.id}`} scroll={false} className="shrink-0">
              <Badge
                variant="glass"
                className={`cursor-pointer whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium transition-all select-none ${
                  isActive
                    ? 'border-red-500 bg-red-500/20 text-white shadow-lg shadow-red-500/10'
                    : 'text-zinc-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-white'
                }`}
              >
                {genre.name}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
