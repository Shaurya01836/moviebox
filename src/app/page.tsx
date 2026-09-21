import { POPULAR_MOVIES } from '@/features/movies/data/mock-movies';
import { Movie } from '@/types/movie';
import { HeroBanner } from '@/features/movies/components/hero-banner';
import { MovieSection } from '@/features/movies/components/movie-section';
import { GenreBar } from '@/features/movies/components/genre-bar';
import { TmdbService } from '@/services/tmdb.service';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const activeGenreId = typeof params?.genre === 'string' ? params.genre : undefined;

  // Always fetch genres and the hero spotlight (using trending for hero)
  const [genres, tmdbTrending] = await Promise.all([
    TmdbService.getMovieGenres(),
    TmdbService.getTrendingMovies(),
  ]);

  const trendingMovies = tmdbTrending.length > 0 ? tmdbTrending : POPULAR_MOVIES;
  const featuredMovies = await TmdbService.populateLogosForMovies(trendingMovies.slice(0, 5));

  let genreResults = null;
  let popularMovies: Movie[] = [];
  let selectedGenreName = '';

  if (activeGenreId) {
    genreResults = await TmdbService.getMoviesByGenre(activeGenreId);
    selectedGenreName = genres.find(g => g.id.toString() === activeGenreId)?.name || 'Genre';
  } else {
    const tmdbPopular = await TmdbService.getPopularMovies();
    popularMovies = tmdbPopular.length > 0 ? tmdbPopular : POPULAR_MOVIES;
  }

  return (
    <div className="w-full pb-8">
      {/* Hero Spotlight Section (Full Width) */}
      <HeroBanner movies={featuredMovies} />

      <div className="mx-auto max-w-7xl px-4 mt-8 space-y-12 sm:px-6 lg:px-8">
        {/* Genre Exploration Bar */}
        <GenreBar genres={genres} activeGenreId={activeGenreId} />

        {activeGenreId && genreResults ? (
          <MovieSection
            title={`${selectedGenreName} Movies`}
            subtitle={`Explore the best ${selectedGenreName.toLowerCase()} movies and blockbusters`}
            movies={genreResults}
          />
        ) : (
          <>
            {/* Trending Movies Carousel / Section */}
            <MovieSection
              title="Trending Right Now"
              subtitle="The most watched blockbusters across the platform this week"
              movies={trendingMovies.slice(0, 12)}
            />

            {/* Popular Movies Section */}
            <MovieSection
              title="Popular Movies"
              subtitle="Top community rated films and critical favorites from TMDB"
              movies={popularMovies.slice(0, 12)}
            />
          </>
        )}
      </div>
    </div>
  );
}
