import { VidLinkPlayer } from '@/features/details/components/video-player';
import { BackButton } from '@/components/shared/back-button';

export async function generateStaticParams() {
  return [{ id: '1' }];
}

interface PlayMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlayMoviePage({ params }: PlayMoviePageProps) {
  const { id } = await params;
  
  return (
    <div className="h-[100dvh] w-screen bg-black overflow-hidden relative">
      <VidLinkPlayer tmdbId={id} type="movie" />
    </div>
  );
}
