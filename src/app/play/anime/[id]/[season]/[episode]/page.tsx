import { VidLinkPlayer } from '@/features/details/components/video-player';
import { TmdbService } from '@/services/tmdb.service';

interface PlayAnimePageProps {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
}

export default async function PlayAnimePage({ params }: PlayAnimePageProps) {
  const { id, season, episode } = await params;
  const show = await TmdbService.getTvDetails(id);
  const mediaTitle = show ? show.title : `Season ${season} Episode ${episode}`;
  
  return (
    <div className="h-[100dvh] w-screen bg-black overflow-hidden relative">
      <VidLinkPlayer 
        tmdbId={id} 
        type="anime" 
        season={parseInt(season, 10)} 
        episode={parseInt(episode, 10)} 
        mediaTitle={mediaTitle}
        posterPath={show?.posterPath}
      />
    </div>
  );
}
