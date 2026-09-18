import { env } from '@/lib/config/env';
import { RawTmdbSearchResponse, SearchResponse, SearchResultItem } from '@/features/search/types';

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
}
