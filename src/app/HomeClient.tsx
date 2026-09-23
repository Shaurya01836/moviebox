'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { POPULAR_MOVIES } from '@/features/movies/data/mock-movies';
import { Movie } from '@/types/movie';
import { HeroBanner } from '@/features/movies/components/hero-banner';
import { MovieSection } from '@/features/movies/components/movie-section';
import { GenreBar } from '@/features/movies/components/genre-bar';
import { TmdbService } from '@/services/tmdb.service';

export default function HomeClient() {
  const searchParams = useSearchParams();
  const activeGenreId = searchParams.get('genre') || undefined;

  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [genreResults, setGenreResults] = useState<Movie[] | null>(null);
  const [selectedGenreName, setSelectedGenreName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [gList, tmdbTrending] = await Promise.all([
          TmdbService.getMovieGenres(),
          TmdbService.getTrendingMovies(),
        ]);

        setGenres(gList);
        const trending = tmdbTrending.length > 0 ? tmdbTrending : POPULAR_MOVIES;
        setTrendingMovies(trending);

        const featured = await TmdbService.populateLogosForMovies(trending.slice(0, 5));
        setFeaturedMovies(featured);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function loadGenreOrPopular() {
      if (activeGenreId) {
        try {
          const results = await TmdbService.getMoviesByGenre(activeGenreId);
          setGenreResults(results);
          const name = genres.find(g => g.id.toString() === activeGenreId)?.name || 'Genre';
          setSelectedGenreName(name);
        } catch (err) {
          console.error(err);
        }
      } else {
        setGenreResults(null);
        if (popularMovies.length === 0) {
          try {
            const tmdbPopular = await TmdbService.getPopularMovies();
            setPopularMovies(tmdbPopular.length > 0 ? tmdbPopular : POPULAR_MOVIES);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    loadGenreOrPopular();
  }, [activeGenreId, genres, popularMovies.length]);

  return (
    <div className="w-full pb-8">
      <HeroBanner movies={featuredMovies} />

      <div className="mx-auto max-w-7xl px-4 mt-8 space-y-12 sm:px-6 lg:px-8">
        <GenreBar genres={genres} activeGenreId={activeGenreId} />

        {activeGenreId && genreResults ? (
          <MovieSection
            title={`${selectedGenreName} Movies`}
            subtitle={`Explore the best ${selectedGenreName.toLowerCase()} movies and blockbusters`}
            movies={genreResults}
          />
        ) : (
          <>
            <MovieSection
              title="Trending Right Now"
              subtitle="The most watched blockbusters across the platform this week"
              movies={trendingMovies.slice(0, 12)}
            />

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
