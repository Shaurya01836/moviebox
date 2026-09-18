import Image from 'next/image';
import { notFound } from 'next/navigation';
import { TmdbService } from '@/services/tmdb.service';
import { Rating } from '@/components/shared/rating';
import { GenreBadge } from '@/components/shared/genre-badge';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Calendar, Clock, Star, Tv } from 'lucide-react';

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

  return (
    <div className="relative min-h-screen pb-20">
      {/* Backdrop Section */}
      <div className="relative h-[60vh] w-full lg:h-[75vh]">
        <Image
          src={tvShow.backdropPath}
          alt={tvShow.title}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
        {/* Gradient overlays for cinematic fade into dark background */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent lg:w-3/4" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 -mt-[40vh] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Poster (Hidden on very small screens, shown as block on larger) */}
          <div className="hidden sm:block shrink-0 z-20">
            <div className="relative h-[450px] w-[300px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/80 ring-1 ring-white/5 transition-transform hover:scale-105 duration-500">
              <Image
                src={tvShow.posterPath}
                alt={tvShow.title}
                fill
                priority
                className="object-cover"
                sizes="300px"
              />
              {tvShow.qualityBadge && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="glass" className="bg-black/60 backdrop-blur-md border-white/20 text-sm font-semibold tracking-wide">
                    {tvShow.qualityBadge}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col justify-end pt-4 lg:pt-16 pb-12 w-full">
            {/* Title & Tagline */}
            <div className="space-y-3 mb-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-md">
                {tvShow.title}
              </h1>
              {tvShow.tagline && (
                <p className="text-lg md:text-xl italic text-zinc-300 font-light drop-shadow">
                  "{tvShow.tagline}"
                </p>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-zinc-300 mb-8 font-medium">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-red-500 text-red-500" />
                <span className="text-white font-bold">{tvShow.voteAverage}</span>
                <span className="text-zinc-500">({tvShow.voteCount})</span>
              </div>
              <span className="text-zinc-600">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>{tvShow.releaseYear}</span>
              </div>
              {tvShow.numberOfSeasons && (
                <>
                  <span className="text-zinc-600">•</span>
                  <div className="flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-zinc-400" />
                    <span>{tvShow.numberOfSeasons} Seasons</span>
                  </div>
                </>
              )}
              {tvShow.durationMinutes && (
                <>
                  <span className="text-zinc-600">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{tvShow.durationMinutes} min/ep</span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button className="flex items-center gap-2 rounded-full bg-red-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-red-700 hover:scale-105 active:scale-95 shadow-lg shadow-red-600/30">
                <Play className="h-5 w-5 fill-white" />
                Watch Trailer
              </button>
              <button className="flex items-center gap-2 rounded-full bg-zinc-800/80 border border-zinc-700/60 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-zinc-700 hover:scale-105 active:scale-95 backdrop-blur-md">
                <Plus className="h-5 w-5" />
                Add to Watchlist
              </button>
            </div>

            {/* Genres */}
            {tvShow.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tvShow.genres.map((genre) => (
                  <GenreBadge key={genre} name={genre} />
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="max-w-3xl mb-12">
              <h2 className="text-xl font-semibold text-white mb-3 tracking-wide">Overview</h2>
              <p className="text-zinc-300 leading-relaxed text-lg">
                {tvShow.overview}
              </p>
            </div>
            
            {/* Cast & Crew */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl border-t border-white/10 pt-8">
              {tvShow.creator && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 mb-1">Creator</h3>
                  <p className="text-white font-medium">{tvShow.creator}</p>
                </div>
              )}
              {tvShow.cast && tvShow.cast.length > 0 && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Cast</h3>
                  <div className="flex flex-wrap gap-4">
                    {tvShow.cast.map(actor => (
                      <div key={actor.id} className="flex items-center gap-3 bg-zinc-900/50 rounded-full pr-4 border border-white/5 hover:bg-zinc-800/50 transition-colors cursor-default">
                        {actor.profilePath ? (
                          <Image src={actor.profilePath} alt={actor.name} width={40} height={40} className="rounded-full w-10 h-10 object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                            <span className="text-xs text-zinc-500">{actor.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex flex-col py-1">
                          <span className="text-sm font-medium text-white leading-tight">{actor.name}</span>
                          <span className="text-xs text-zinc-400 leading-tight">{actor.character}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
