export const TMDB_API_KEY = '62513680a70453f584b71ef5945ccc61';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  logoPath?: string;
  releaseYear: number;
  voteAverage: number;
  genres: string[];
  qualityBadge?: string;
  mediaKind?: 'movie' | 'tv';
  durationMinutes?: number;
  cast?: { id: number; name: string; character: string; profilePath: string }[];
  seasons?: { id: number; seasonNumber: number; episodeCount: number; name: string }[];
}

export interface TvEpisode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  stillPath: string;
  runtime: number;
}

let genreCache: Record<number, string> = {};

export async function getGenreMap(): Promise<Record<number, string>> {
  if (Object.keys(genreCache).length > 0) return genreCache;
  const res = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  if (data.genres) {
    data.genres.forEach((g: { id: number; name: string }) => {
      genreCache[g.id] = g.name;
    });
  }
  return genreCache;
}

export function mapTmdbItem(item: any, genresDictionary: Record<number, string>): Movie {
  const genreNames = item.genre_ids
    ? item.genre_ids.map((id: number) => genresDictionary[id]).filter(Boolean)
    : ['Movie'];

  return {
    id: item.id.toString(),
    title: item.title || item.name || 'Untitled',
    overview: item.overview || 'No overview available.',
    posterPath: item.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800',
    backdropPath: item.backdrop_path
      ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}`
      : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920',
    releaseYear: item.release_date
      ? new Date(item.release_date).getFullYear()
      : item.first_air_date
      ? new Date(item.first_air_date).getFullYear()
      : 2025,
    voteAverage: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
    genres: genreNames.length > 0 ? genreNames : ['Movie'],
    qualityBadge: item.vote_average >= 8 ? '4K' : 'HD',
    mediaKind: item.media_type === 'tv' ? 'tv' : 'movie',
  };
}

export async function fetchTrendingMovies(): Promise<Movie[]> {
  const [genreMap, res] = await Promise.all([
    getGenreMap(),
    fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`),
  ]);
  const data = await res.json();
  return (data.results || []).map((item: any) => mapTmdbItem(item, genreMap));
}

export async function fetchPopularMovies(): Promise<Movie[]> {
  const [genreMap, res] = await Promise.all([
    getGenreMap(),
    fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`),
  ]);
  const data = await res.json();
  return (data.results || []).map((item: any) => mapTmdbItem(item, genreMap));
}

export async function fetchMoviesByGenre(genreId: string): Promise<Movie[]> {
  const [genreMap, res] = await Promise.all([
    getGenreMap(),
    fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}`),
  ]);
  const data = await res.json();
  return (data.results || []).map((item: any) => mapTmdbItem(item, genreMap));
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const [genreMap, res] = await Promise.all([
    getGenreMap(),
    fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`),
  ]);
  const data = await res.json();
  return (data.results || [])
    .filter((item: any) => item.media_type !== 'person')
    .map((item: any) => mapTmdbItem(item, genreMap));
}

export async function fetchMovieDetails(id: string, type: 'movie' | 'tv' = 'movie'): Promise<Movie & { runtime?: number; tagline?: string }> {
  const [genreMap, res] = await Promise.all([
    getGenreMap(),
    fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`),
  ]);
  const item = await res.json();
  const base = mapTmdbItem(item, genreMap);
  const runtime = item.runtime || (item.episode_run_time ? item.episode_run_time[0] : undefined);
  
  return {
    ...base,
    genres: item.genres?.map((g: any) => g.name) || base.genres,
    runtime: runtime,
    tagline: item.tagline,
    durationMinutes: runtime,
    mediaKind: type,
    cast: item.credits?.cast?.slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : '',
    })),
    seasons: item.seasons?.map((s: any) => ({
      id: s.id,
      seasonNumber: s.season_number,
      episodeCount: s.episode_count,
      name: s.name,
    })),
  };
}

export async function fetchTvSeason(id: string, seasonNumber: number): Promise<TvEpisode[]> {
  const res = await fetch(`${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return (data.episodes || []).map((ep: any) => ({
    id: ep.id,
    name: ep.name,
    overview: ep.overview,
    episodeNumber: ep.episode_number,
    seasonNumber: ep.season_number,
    stillPath: ep.still_path ? `${TMDB_IMAGE_BASE}/w500${ep.still_path}` : '',
    runtime: ep.runtime,
  }));
}
