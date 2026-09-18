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
}

export interface FilterOptions {
  genre?: string;
  sortBy?: 'popularity' | 'rating' | 'releaseDate';
  searchQuery?: string;
}
