import { notFound } from 'next/navigation';
import { TmdbService } from '@/services/tmdb.service';
import { HeroDetails } from '@/features/details/components/hero-details';
import { CastSlider } from '@/features/details/components/cast-slider';
import { TvEpisodes } from '@/features/details/components/tv-episodes';
import { EpisodeHeatmap } from '@/features/details/components/episode-heatmap';

export async function generateStaticParams() {
  return [{ id: '1' }];
}

interface TvPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TvPage({ params }: TvPageProps) {
  const { id } = await params;
  const tvShow = await TmdbService.getTvDetails(id);

  if (!tvShow) {
    notFound();
  }

  // Fetch all episodes concurrently if seasons exist
  const validSeasons = tvShow.seasons?.filter(s => s.seasonNumber > 0 && s.episodeCount > 0) || [];
  const allEpisodes = validSeasons.length > 0 
    ? await TmdbService.getAllTvEpisodes(id, validSeasons) 
    : [];

  return (
    <div className="min-h-screen bg-[#10161a] pb-32">
      <HeroDetails media={tvShow} mediaKind="tv" />
      <CastSlider cast={tvShow.cast} />
      
      {validSeasons.length > 0 && (
        <>
          <TvEpisodes tmdbId={id} seasons={validSeasons} allEpisodes={allEpisodes} fallbackImage={tvShow.backdropPath} />
          <EpisodeHeatmap seasons={validSeasons} allEpisodes={allEpisodes} />
        </>
      )}
    </div>
  );
}
