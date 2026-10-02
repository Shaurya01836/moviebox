import { notFound } from 'next/navigation';
import { TmdbService } from '@/services/tmdb.service';
import { HeroDetails } from '@/features/details/components/hero-details';
import { CastSlider } from '@/features/details/components/cast-slider';
import { TvEpisodes } from '@/features/details/components/tv-episodes';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anime Details | MovieBox',
};

interface AnimeDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnimeDetailsPage({ params }: AnimeDetailsPageProps) {
  const { id } = await params;
  const animeShow = await TmdbService.getTvDetails(id);

  if (!animeShow) {
    notFound();
  }

  // Fetch all episodes concurrently if seasons exist
  const validSeasons = animeShow.seasons?.filter(s => s.seasonNumber > 0 && s.episodeCount > 0) || [];
  const allEpisodes = validSeasons.length > 0 
    ? await TmdbService.getAllTvEpisodes(id, validSeasons) 
    : [];

  return (
    <main className="min-h-screen bg-[#10161a] pb-32">
      <HeroDetails media={animeShow} mediaKind="anime" />
      <CastSlider cast={animeShow.cast} />
      
      {validSeasons.length > 0 && (
        <TvEpisodes tmdbId={id} seasons={validSeasons} allEpisodes={allEpisodes} fallbackImage={animeShow.backdropPath} mediaKind="anime" />
      )}
    </main>
  );
}
