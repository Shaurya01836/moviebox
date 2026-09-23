import { VidLinkPlayer } from '@/features/details/components/video-player';
import { BackButton } from '@/components/shared/back-button';

export async function generateStaticParams() {
  return [{ id: '1', season: '1', episode: '1' }];
}

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
