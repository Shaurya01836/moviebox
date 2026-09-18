import { GENRES } from '../data/mock-movies';
import { Badge } from '@/components/ui/badge';

export function GenreBar() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Explore Genres</h2>
      <div className="flex flex-wrap gap-2.5">
        {GENRES.map((genre) => (
          <Badge
            key={genre.id}
            variant="glass"
            className="cursor-pointer px-4 py-2 text-xs font-medium text-zinc-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-white transition-all select-none"
          >
            {genre.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
