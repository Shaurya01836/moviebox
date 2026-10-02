export interface AnilistMedia {
  id: number;
  title: {
    english: string;
    romaji: string;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    color: string;
  };
  bannerImage: string | null;
  description: string;
  episodes: number | null;
  averageScore: number | null;
  format: string;
  status: string;
  genres: string[];
  season?: string;
  seasonYear?: number;
  nextAiringEpisode?: {
    episode: number;
  } | null;
  characters?: {
    edges: {
      role: string;
      node: {
        id: number;
        name: { full: string };
        image: { large: string };
      };
    }[];
  };
}

export class AnilistService {
  private static readonly ENDPOINT = 'https://graphql.anilist.co';

  private static async fetchGraphQL(query: string, variables?: any) {
    const res = await fetch(this.ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 } // Cache for 1 hour using Next.js fetch caching
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from AniList: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  }

  static async getTrendingAnime(perPage = 20): Promise<AnilistMedia[]> {
    const query = `
      query ($perPage: Int) {
        Page (page: 1, perPage: $perPage) {
          media (type: ANIME, sort: TRENDING_DESC) {
            id
            title { english romaji native }
            coverImage { extraLarge large color }
            bannerImage
            description
            episodes
            averageScore
            format
            status
            genres
          }
        }
      }
    `;
    const data = await this.fetchGraphQL(query, { perPage });
    return data.Page.media;
  }

  static async getPopularAnime(perPage = 20): Promise<AnilistMedia[]> {
    const query = `
      query ($perPage: Int) {
        Page (page: 1, perPage: $perPage) {
          media (type: ANIME, sort: POPULARITY_DESC) {
            id
            title { english romaji native }
            coverImage { extraLarge large color }
            bannerImage
            description
            episodes
            averageScore
            format
            status
            genres
          }
        }
      }
    `;
    const data = await this.fetchGraphQL(query, { perPage });
    return data.Page.media;
  }

  static async getAnimeDetails(id: number): Promise<AnilistMedia | null> {
    const query = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          id
          title { english romaji native }
          coverImage { extraLarge large color }
          bannerImage
          description
          episodes
          averageScore
          format
          status
          genres
          season
          seasonYear
          nextAiringEpisode {
            episode
          }
          characters(sort: [ROLE, RELEVANCE], perPage: 12) {
            edges {
              role
              node {
                id
                name { full }
                image { large }
              }
            }
          }
        }
      }
    `;
    try {
      const data = await this.fetchGraphQL(query, { id });
      return data.Media;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
