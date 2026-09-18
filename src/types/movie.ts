export type MediaKind = 'movie' | 'tv';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  voteAverage: number;
  voteCount: number;
  genres: string[];
  durationMinutes?: number;
  ageRating?: string;
  qualityBadge?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  mediaKind?: MediaKind;
}

export interface MovieDetails extends Movie {
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  cast?: { id: number; name: string; character: string; profilePath: string }[];
  director?: string;
}

export interface TvDetails extends Movie {
  tagline?: string;
  status?: string;
  numberOfEpisodes?: number;
  numberOfSeasons?: number;
  homepage?: string;
  cast?: { id: number; name: string; character: string; profilePath: string }[];
  creator?: string;
}

export interface FilterOptions {
  genre?: string;
  sortBy?: 'popularity' | 'rating' | 'releaseDate';
  searchQuery?: string;
}
