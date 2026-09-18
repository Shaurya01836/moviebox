import { Movie } from '@/types/movie';

export type MovieCategory = 'trending' | 'popular' | 'top_rated' | 'upcoming';

export interface MovieListProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
}
