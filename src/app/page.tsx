import { FEATURED_MOVIE, POPULAR_MOVIES } from '@/features/movies/data/mock-movies';
import { HeroBanner } from '@/features/movies/components/hero-banner';
import { MovieSection } from '@/features/movies/components/movie-section';
import { GenreBar } from '@/features/movies/components/genre-bar';
import { ShieldCheck, Cpu, Layers, Server } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const trendingMovies = POPULAR_MOVIES.filter((m) => m.isTrending);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-12 sm:px-6 lg:px-8">
      {/* Hero Spotlight Section */}
      <HeroBanner movie={FEATURED_MOVIE} />

      {/* Genre Exploration Bar */}
      <GenreBar />

      {/* Trending Movies Carousel / Section */}
      <MovieSection
        title="Trending Right Now"
        subtitle="The most watched blockbusters across the platform this week"
        movies={trendingMovies}
        viewAllHref="/movies?category=trending"
      />

      {/* Popular Movies Section */}
      <MovieSection
        title="Popular Movies"
        subtitle="Top community rated films and critical favorites"
        movies={POPULAR_MOVIES}
        viewAllHref="/movies"
      />

      {/* Scalable Architecture Information Banner */}
      <section className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950 p-8 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-400">
            <Cpu className="h-3.5 w-3.5" />
            Clean Architecture Foundation
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Built for Scalability & Future Backend Integration
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            MovieBox features a strict feature-oriented modular architecture. UI components are completely decoupled from backend persistence, enabling seamless future addition of database layers, authentication, and external movie APIs.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardContent className="p-5 space-y-2">
              <Layers className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-semibold text-white">Feature Modules</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Encapsulated components, hooks, types, and services inside <code className="text-zinc-300">src/features/*</code>.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardContent className="p-5 space-y-2">
              <Server className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-semibold text-white">Server Components</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Next.js App Router Server Components by default for optimal performance and SEO.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/80 border-zinc-800">
            <CardContent className="p-5 space-y-2">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-semibold text-white">Extensible Core</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Pre-configured directory boundaries for <code className="text-zinc-300">lib/db</code>, <code className="text-zinc-300">lib/auth</code>, and thin API route handlers.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
