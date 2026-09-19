import { GENRES } from '../data/mock-movies';
import { Badge } from '@/components/ui/badge';

export function GenreBar() {
  return (
    <div className="space-y-3">
      <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-400">Explore Genres</h2>
      <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap gap-2 sm:gap-2.5 scrollbar-none sm:scrollbar-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        {GENRES.map((genre) => (
          <Badge
            key={genre.id}
            variant="glass"
            className="cursor-pointer whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-zinc-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-white transition-all select-none shrink-0"
          >
            {genre.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
