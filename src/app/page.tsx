import { POPULAR_MOVIES } from '@/features/movies/data/mock-movies';
import { HeroBanner } from '@/features/movies/components/hero-banner';
import { MovieSection } from '@/features/movies/components/movie-section';
import { GenreBar } from '@/features/movies/components/genre-bar';
import { TmdbService } from '@/services/tmdb.service';

export default async function HomePage() {
  // Fetch live TMDB Trending & Popular movies on the server
  const [tmdbTrending, tmdbPopular] = await Promise.all([
    TmdbService.getTrendingMovies(),
    TmdbService.getPopularMovies(),
  ]);

  const trendingMovies = tmdbTrending.length > 0 ? tmdbTrending : POPULAR_MOVIES;
  const popularMovies = tmdbPopular.length > 0 ? tmdbPopular : POPULAR_MOVIES;

  // Select top 5 trending movies for the Hero spotlight banner
  const featuredMovies = trendingMovies.slice(0, 5);

  return (
    <div className="w-full pb-8">
      {/* Hero Spotlight Section (Full Width) */}
      <HeroBanner movies={featuredMovies} />

      <div className="mx-auto max-w-7xl px-4 mt-8 space-y-12 sm:px-6 lg:px-8">
        {/* Genre Exploration Bar */}
        <GenreBar />

        {/* Trending Movies Carousel / Section */}
        <MovieSection
          title="Trending Right Now"
          subtitle="The most watched blockbusters across the platform this week"
          movies={trendingMovies.slice(0, 12)}
          viewAllHref="/movies?category=trending"
        />

        {/* Popular Movies Section */}
        <MovieSection
          title="Popular Movies"
          subtitle="Top community rated films and critical favorites from TMDB"
          movies={popularMovies.slice(0, 12)}
          viewAllHref="/movies"
        />
      </div>
    </div>
  );
}
