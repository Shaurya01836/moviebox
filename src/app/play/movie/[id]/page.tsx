import { VidLinkPlayer } from '@/features/details/components/video-player';
import { BackButton } from '@/components/shared/back-button';
import { TmdbService } from '@/services/tmdb.service';

interface PlayMoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlayMoviePage({ params }: PlayMoviePageProps) {
  const { id } = await params;
  const movie = await TmdbService.getMovieDetails(id);
  
  return (
    <div className="h-[100dvh] w-screen bg-black overflow-hidden relative">
      <VidLinkPlayer 
        tmdbId={id} 
        type="movie" 
        mediaTitle={movie?.title || 'Unknown Title'}
        posterPath={movie?.posterPath}
      />
    </div>
  );
}
