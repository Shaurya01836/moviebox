import { VidLinkPlayer } from '@/features/details/components/video-player';
import { BackButton } from '@/components/shared/back-button';

interface PlayMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlayMoviePage({ params }: PlayMoviePageProps) {
  const { id } = await params;
  
  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <BackButton />
      </div>
      <VidLinkPlayer tmdbId={id} type="movie" />
    </div>
  );
}
