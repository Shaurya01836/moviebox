import { notFound } from 'next/navigation';
import { TmdbService } from '@/services/tmdb.service';
import { HeroDetails } from '@/features/details/components/hero-details';
import { CastSlider } from '@/features/details/components/cast-slider';

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await TmdbService.getMovieDetails(id);

  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#10161a] pb-32">
      <HeroDetails media={movie} mediaKind="movie" />
      <CastSlider cast={movie.cast} />
    </div>
  );
}
