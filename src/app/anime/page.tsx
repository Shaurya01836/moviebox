import { Metadata } from 'next';
import { HeroBanner } from '@/features/movies/components/hero-banner';
import { MovieSection } from '@/features/movies/components/movie-section';
import { TmdbService } from '@/services/tmdb.service';

export const metadata: Metadata = {
  title: 'Anime | MovieBox',
  description: 'Discover the latest and trending anime',
};

// Force dynamic since trending changes often
export const revalidate = 3600; // revalidate at most every hour

export default async function AnimePage() {
  const [trending, popular] = await Promise.all([
    TmdbService.getTrendingAnime(1),
    TmdbService.getPopularAnime(1)
  ]);

  // Try to get logos for the hero banner movies
  const heroMovies = await TmdbService.populateLogosForMovies(trending.slice(0, 10));

  return (
    <main className="min-h-screen bg-[#0A0A0A] pb-24">
      {heroMovies.length > 0 && <HeroBanner movies={heroMovies} />}
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-10 lg:px-16 mt-8 space-y-12">
        <MovieSection title="Trending Now" movies={trending} />
        <MovieSection title="All-Time Popular" movies={popular} />
      </div>
    </main>
  );
}
