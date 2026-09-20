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
    <div className="h-[100dvh] w-screen bg-black overflow-hidden relative">
      <VidLinkPlayer 
        tmdbId={id} 
        type="tv" 
        season={parseInt(season, 10)} 
        episode={parseInt(episode, 10)} 
      />
    </div>
  );
}
