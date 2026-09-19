import { env } from '@/lib/config/env';
import { Movie, MovieDetails, TvDetails, TvEpisode, TvSeason } from '@/types/movie';
import { RawTmdbMediaItem, RawTmdbSearchResponse, SearchResponse, SearchResultItem } from '@/features/search/types';

export class TmdbService {
  private static getPosterUrl(path?: string | null): string {
    if (!path) {
      return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop';
    }
    return `${env.tmdb.imageBaseUrl}/w500${path}`;
  }

  private static getBackdropUrl(path?: string | null): string {
    if (!path) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop';
    }
    return `${env.tmdb.imageBaseUrl}/w1280${path}`;
  }

  private static mapTmdbItemToMovie(item: RawTmdbMediaItem): Movie {
    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || '';
    const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 2025;

    return {
      id: item.id.toString(),
      title,
      overview: item.overview || 'No overview available.',
      posterPath: this.getPosterUrl(item.poster_path),
      backdropPath: this.getBackdropUrl(item.backdrop_path),
      releaseYear: isNaN(releaseYear) ? 2025 : releaseYear,
      voteAverage: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
      voteCount: item.vote_count || 0,
      genres: [
        item.media_type === 'tv' ? 'TV Show' : 'Movie',
        ...(item.genre_ids?.includes(16) ? ['Animation'] : [])
      ],
      qualityBadge: item.vote_average && item.vote_average >= 8 ? '4K' : 'HD',
      isTrending: true,
    };
  }

  static async populateLogosForMovies(movies: Movie[]): Promise<Movie[]> {
    const promises = movies.map(async (movie) => {
      try {
        const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
        const type = movie.mediaKind === 'tv' ? 'tv' : 'movie';
        const url = `${env.tmdb.baseUrl}/${type}/${movie.id}/images?api_key=${apiKey}&include_image_language=en,null`;
        
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return movie;
        
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enLogo = data.logos?.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === null);
        if (enLogo) {
          movie.logoPath = this.getPosterUrl(enLogo.file_path);
        }
      } catch (e) {
        // ignore error and return movie without logo
      }
      return movie;
    });
    return Promise.all(promises);
  }

  /**
   * Fetch Trending Movies of the week from TMDB
   */
  static async getTrendingMovies(page = 1): Promise<Movie[]> {
    const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
    const url = `${env.tmdb.baseUrl}/trending/movie/week?api_key=${apiKey}&page=${page}`;

    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];

      const data: RawTmdbSearchResponse = await res.json();
      return (data.results || []).map((item) => this.mapTmdbItemToMovie({ ...item, media_type: 'movie' }));
    } catch (err) {
      console.error('Error fetching TMDB trending movies:', err);
      return [];
    }
  }

  /**
   * Fetch Popular Movies from TMDB
   */
  static async getPopularMovies(page = 1): Promise<Movie[]> {
    const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
    const url = `${env.tmdb.baseUrl}/movie/popular?api_key=${apiKey}&page=${page}`;

    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];

      const data: RawTmdbSearchResponse = await res.json();
      return (data.results || []).map((item) => this.mapTmdbItemToMovie({ ...item, media_type: 'movie' }));
    } catch (err) {
      console.error('Error fetching TMDB popular movies:', err);
      return [];
    }
  }

  /**
   * Search multi-media (Movies & TV Shows) from TMDB
   */
  static async searchMulti(query: string, page = 1): Promise<SearchResponse> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return {
        query: '',
        results: [],
        totalResults: 0,
        page: 1,
        totalPages: 0,
      };
    }

    const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
    const url = `${env.tmdb.baseUrl}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(trimmedQuery)}&page=${page}`;

    const res = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.error(`TMDB API Error [${res.status}]:`, errorText);
      throw new Error(`TMDB API failed with status ${res.status}: ${errorText}`);
    }

    const data: RawTmdbSearchResponse = await res.json();

    const filteredResults = (data.results || []).filter(
      (item) => item.media_type === 'movie' || item.media_type === 'tv'
    );

    const transformedResults: SearchResultItem[] = filteredResults.map((item) => {
      const movie = this.mapTmdbItemToMovie(item);
      return {
        ...movie,
        mediaKind: item.media_type === 'tv' ? 'tv' : 'movie',
      };
    });

    return {
      query: trimmedQuery,
      results: transformedResults,
      totalResults: data.total_results || 0,
      page: data.page || 1,
      totalPages: data.total_pages || 0,
    };
  }

  static async getMovieDetails(id: string): Promise<MovieDetails | null> {
    const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
    const url = `${env.tmdb.baseUrl}/movie/${id}?api_key=${apiKey}&append_to_response=credits,images&include_image_language=en,null`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`TMDB API failed with status ${res.status}`);
    }

    const data = await res.json();
    const releaseYear = data.release_date ? new Date(data.release_date).getFullYear() : 2025;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const director = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enLogo = data.images?.logos?.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === null);
    const logoPath = enLogo?.file_path ? this.getPosterUrl(enLogo.file_path) : undefined;

    return {
      id: data.id.toString(),
      title: data.title || data.original_title,
      overview: data.overview,
      posterPath: this.getPosterUrl(data.poster_path),
      backdropPath: this.getBackdropUrl(data.backdrop_path),
      logoPath,
      releaseYear: isNaN(releaseYear) ? 2025 : releaseYear,
      voteAverage: data.vote_average ? Number(data.vote_average.toFixed(1)) : 0,
      voteCount: data.vote_count || 0,
      originalLanguage: data.original_language?.toUpperCase() || 'EN',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genres: data.genres?.map((g: any) => g.name) || [],
      durationMinutes: data.runtime,
      qualityBadge: data.vote_average && data.vote_average >= 8 ? '4K' : 'HD',
      mediaKind: 'movie',
      tagline: data.tagline,
      status: data.status,
      budget: data.budget,
      revenue: data.revenue,
      homepage: data.homepage,
      director,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cast: data.credits?.cast?.slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? this.getPosterUrl(c.profile_path) : ''
      })) || []
    };
  }

  static async getTvDetails(id: string): Promise<TvDetails | null> {
    const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
    const url = `${env.tmdb.baseUrl}/tv/${id}?api_key=${apiKey}&append_to_response=credits,images&include_image_language=en,null`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`TMDB API failed with status ${res.status}`);
    }

    const data = await res.json();
    const releaseYear = data.first_air_date ? new Date(data.first_air_date).getFullYear() : 2025;
    const creator = data.created_by?.[0]?.name;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enLogo = data.images?.logos?.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === null);
    const logoPath = enLogo?.file_path ? this.getPosterUrl(enLogo.file_path) : undefined;

    return {
      id: data.id.toString(),
      title: data.name || data.original_name,
      overview: data.overview,
      posterPath: this.getPosterUrl(data.poster_path),
      backdropPath: this.getBackdropUrl(data.backdrop_path),
      logoPath,
      releaseYear: isNaN(releaseYear) ? 2025 : releaseYear,
      voteAverage: data.vote_average ? Number(data.vote_average.toFixed(1)) : 0,
      voteCount: data.vote_count || 0,
      originalLanguage: data.original_language?.toUpperCase() || 'EN',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      networks: data.networks?.map((n: any) => n.name) || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seasons: data.seasons?.filter((s: any) => s.season_number > 0).map((s: any) => ({
        id: s.id,
        name: s.name,
        seasonNumber: s.season_number,
        episodeCount: s.episode_count,
        posterPath: s.poster_path ? this.getPosterUrl(s.poster_path) : ''
      })) || [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genres: data.genres?.map((g: any) => g.name) || [],
      durationMinutes: data.episode_run_time?.[0],
      qualityBadge: data.vote_average && data.vote_average >= 8 ? '4K' : 'HD',
      mediaKind: 'tv',
      tagline: data.tagline,
      status: data.status,
      numberOfEpisodes: data.number_of_episodes,
      numberOfSeasons: data.number_of_seasons,
      homepage: data.homepage,
      creator,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cast: data.credits?.cast?.slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? this.getPosterUrl(c.profile_path) : ''
      })) || []
    };
  }

  /**
   * Fetch details for a specific TV season
   */
  static async getTvSeasonDetails(tvId: string, seasonNumber: number): Promise<TvEpisode[]> {
    const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
    const url = `${env.tmdb.baseUrl}/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}`;

    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];

      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.episodes || []).map((ep: any) => ({
        id: ep.id,
        name: ep.name,
        overview: ep.overview,
        episodeNumber: ep.episode_number,
        seasonNumber: ep.season_number,
        stillPath: ep.still_path ? this.getPosterUrl(ep.still_path) : undefined,
        voteAverage: ep.vote_average ? Number(ep.vote_average.toFixed(1)) : 0,
        runtime: ep.runtime,
        airDate: ep.air_date
      }));
    } catch (err) {
      console.error(`Error fetching TV season ${seasonNumber}:`, err);
      return [];
    }
  }

  /**
   * Concurrently fetch all episodes across given seasons for the heatmap
   */
  static async getAllTvEpisodes(tvId: string, seasons: TvSeason[]): Promise<TvEpisode[]> {
    const validSeasons = seasons.filter(s => s.seasonNumber > 0 && s.episodeCount > 0);
    const results: TvEpisode[][] = [];
    
    try {
      // Fetch in batches of 3 to avoid TMDB rate limits and ECONNRESET for long-running anime/shows
      const batchSize = 3;
      for (let i = 0; i < validSeasons.length; i += batchSize) {
        const batch = validSeasons.slice(i, i + batchSize);
        const promises = batch.map(s => this.getTvSeasonDetails(tvId, s.seasonNumber));
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      }
      return results.flat();
    } catch (err) {
      console.error('Error fetching all TV episodes:', err);
      return [];
    }
  }
}
