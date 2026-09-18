import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Movie } from '@/types/movie';
import { MovieCard } from '@/components/shared/movie-card';

interface MovieSectionProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  viewAllHref?: string;
}

export function MovieSection({ title, subtitle, movies, viewAllHref }: MovieSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
