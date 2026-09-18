import { Movie, MediaKind } from '@/types/movie';

export interface RawTmdbMediaItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  popularity?: number;
}

export interface RawTmdbSearchResponse {
  page: number;
  results: RawTmdbMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface SearchResultItem extends Movie {
  mediaKind: MediaKind;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  totalResults: number;
  page: number;
  totalPages: number;
}
