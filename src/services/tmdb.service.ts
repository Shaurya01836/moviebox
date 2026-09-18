import { env } from '@/lib/config/env';
import { RawTmdbSearchResponse, SearchResponse, SearchResultItem } from '@/features/search/types';
import { MovieDetails, TvDetails } from '@/types/movie';

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
        genres: [item.media_type === 'tv' ? 'TV Show' : 'Movie'],
        qualityBadge: item.vote_average && item.vote_average >= 8 ? '4K' : 'HD',
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
    const url = `${env.tmdb.baseUrl}/movie/${id}?api_key=${apiKey}&append_to_response=credits`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`TMDB API failed with status ${res.status}`);
    }

    const data = await res.json();
    const releaseYear = data.release_date ? new Date(data.release_date).getFullYear() : 2025;

    const director = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name;

    return {
      id: data.id.toString(),
      title: data.title || data.original_title,
      overview: data.overview,
      posterPath: this.getPosterUrl(data.poster_path),
      backdropPath: this.getBackdropUrl(data.backdrop_path),
      releaseYear: isNaN(releaseYear) ? 2025 : releaseYear,
      voteAverage: data.vote_average ? Number(data.vote_average.toFixed(1)) : 0,
      voteCount: data.vote_count || 0,
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
    const url = `${env.tmdb.baseUrl}/tv/${id}?api_key=${apiKey}&append_to_response=credits`;

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

    return {
      id: data.id.toString(),
      title: data.name || data.original_name,
      overview: data.overview,
      posterPath: this.getPosterUrl(data.poster_path),
      backdropPath: this.getBackdropUrl(data.backdrop_path),
      releaseYear: isNaN(releaseYear) ? 2025 : releaseYear,
      voteAverage: data.vote_average ? Number(data.vote_average.toFixed(1)) : 0,
      voteCount: data.vote_count || 0,
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
      cast: data.credits?.cast?.slice(0, 10).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? this.getPosterUrl(c.profile_path) : ''
      })) || []
    };
  }
}
