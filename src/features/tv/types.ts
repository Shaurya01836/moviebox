export interface TVShow {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  firstAirDate: string;
  voteAverage: number;
  voteCount: number;
  genres: string[];
  seasonsCount?: number;
  episodesCount?: number;
}
