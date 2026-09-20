import { VidLinkPlayer } from '@/features/details/components/video-player';
import { BackButton } from '@/components/shared/back-button';

interface PlayTvPageProps {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
}

export default async function PlayTvPage({ params }: PlayTvPageProps) {
  const { id, season, episode } = await params;
  
  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <BackButton />
      </div>
      <VidLinkPlayer 
        tmdbId={id} 
        type="tv" 
        season={parseInt(season, 10)} 
        episode={parseInt(episode, 10)} 
      />
    </div>
  );
}
