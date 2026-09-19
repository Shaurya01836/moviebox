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
  logoPath?: string;
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

export interface TvSeason {
  id: number;
  name: string;
  seasonNumber: number;
  episodeCount: number;
  posterPath?: string;
}

export interface TvEpisode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  stillPath?: string;
  voteAverage: number;
  runtime?: number;
  airDate?: string;
}

export interface MovieDetails extends Movie {
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  cast?: { id: number; name: string; character: string; profilePath: string }[];
  director?: string;
  originalLanguage?: string;
}

export interface TvDetails extends Movie {
  tagline?: string;
  status?: string;
  numberOfEpisodes?: number;
  numberOfSeasons?: number;
  homepage?: string;
  cast?: { id: number; name: string; character: string; profilePath: string }[];
  creator?: string;
  originalLanguage?: string;
  networks?: string[];
  seasons?: TvSeason[];
}

export interface FilterOptions {
  genre?: string;
  sortBy?: 'popularity' | 'rating' | 'releaseDate';
  searchQuery?: string;
}
