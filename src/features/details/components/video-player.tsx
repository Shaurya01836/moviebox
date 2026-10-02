'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BackButton } from '@/components/shared/back-button';
import { useAuth } from '@/features/auth/context/auth-context';
import { HistoryService } from '@/features/history/services/history.service';
import { checkAniembedExists } from '@/app/actions';

type PlayerProvider = {
  id: string;
  name: string;
  getUrl: (params: { tmdbId: string | number; type: 'movie' | 'tv' | 'anime'; season?: number; episode?: number; startAt?: number; mediaTitle?: string }) => string | Promise<string>;
};

const PROVIDERS: PlayerProvider[] = [
  {
    id: 'vidy',
    name: 'Server 1 (Vidy)',
    getUrl: ({ tmdbId, type, season, episode, startAt }) => {
      let urlPath = '';
      if (type === 'movie') urlPath = `/movie/${tmdbId}?color=DC2626&autoplay=true`;
      else if (type === 'tv') urlPath = `/tv/${tmdbId}/${season}/${episode}?color=DC2626&autoplay=true&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true`;
      else if (type === 'anime') urlPath = `/anime/${tmdbId}/${episode}?color=DC2626&autoplay=true&episodeSelector=true&autoplayNextEpisode=true`;
      
      if (startAt && startAt > 0) urlPath += `&progress=${startAt}`;
      return `https://vidy.st${urlPath}`;
    }
  },
  {
    id: 'vidsrc',
    name: 'Server 2 (VidSrc)',
    getUrl: ({ tmdbId, type, season, episode }) => {
      if (type === 'movie') return `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
      return `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
    }
  },
  {
    id: 'vidcore',
    name: 'Server 3 (VidCore)',
    getUrl: ({ tmdbId, type, season, episode }) => {
      if (type === 'movie') return `https://vidcore.org/embed/movie/${tmdbId}`;
      return `https://vidcore.org/embed/series/${tmdbId}/${season}/${episode}`;
    }
  },
  {
    id: 'vidlink',
    name: 'Server 4 (VidLink)',
    getUrl: ({ tmdbId, type, season, episode }) => {
      if (type === 'movie') return `https://vidlink.pro/movie/${tmdbId}`;
      return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
    }
  },
  {
    id: 'aniembed',
    name: 'AniEmbed (Anime)',
    getUrl: async ({ tmdbId, type, season, episode, startAt, mediaTitle }) => {
      if (type !== 'anime') return '';
      
      try {
        let searchTitle = mediaTitle || '';
        if (season && season > 1) searchTitle += ` Season ${season}`;
        
        const query = `
          query ($search: String) {
            Media (search: $search, type: ANIME, sort: SEARCH_MATCH) {
              id
            }
          }
        `;
        
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { search: searchTitle } })
        });
        
        const data = await res.json();
        const anilistId = data?.data?.Media?.id;
        
        if (anilistId) {
          const exists = await checkAniembedExists(anilistId, episode || 1);
          if (exists) {
            let url = `https://aniembed.se/e/${anilistId}/${episode}?lang=sub&autoplay=1`;
            if (startAt && startAt > 0) url += `&t=${startAt}`;
            return url;
          } else {
            return 'ERROR:NOT_FOUND';
          }
        } else {
          return 'ERROR:NOT_FOUND';
        }
      } catch (err) {
        console.error('Failed to get Anilist ID:', err);
      }
      
      return 'ERROR:NOT_FOUND';
    }
  }
];

interface VidLinkPlayerProps {
  tmdbId: string | number;
  type?: 'movie' | 'tv' | 'anime';
  season?: number;
  episode?: number;
  startAt?: number;
  mediaTitle?: string;
  posterPath?: string;
}

export function VidLinkPlayer({
  tmdbId,
  type = 'movie',
  season = 1,
  episode = 1,
  startAt = 0,
  mediaTitle = 'Unknown Title',
  posterPath,
}: VidLinkPlayerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [showControls, setShowControls] = React.useState(true);
  const [activeProviderId, setActiveProviderId] = React.useState<string>(type === 'anime' ? 'aniembed' : PROVIDERS[0].id);
  const [iframeSrc, setIframeSrc] = React.useState<string>('');
  const [errorState, setErrorState] = React.useState<string | null>(null);
  const hideControlsTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Track progress locally to throttle DB writes
  const latestProgress = React.useRef({ time: startAt, duration: 0 });
  const lastSyncTime = React.useRef(0);

  const resetHideTimer = React.useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  }, []);

  React.useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [resetHideTimer]);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;

      try {
        const payload = JSON.parse(event.data);
        
        // Track current playback time
        if (payload.event === 'timeupdate') {
          if (payload.currentTime) latestProgress.current.time = payload.currentTime;
          if (payload.duration) latestProgress.current.duration = payload.duration;
        }
        
        // Save local history if provided by frame
        if (payload.type === 'MEDIA_DATA') {
          localStorage.setItem('vidLinkProgress', JSON.stringify(payload.data));
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sync watch history on initial mount and then periodic throttle loop (every 10s)
  React.useEffect(() => {
    HistoryService.syncProgress(user?.id, {
      mediaId: String(tmdbId),
      mediaKind: type === 'anime' ? 'tv' : type,
      title: mediaTitle,
      posterPath,
      seasonNumber: type === 'tv' ? season : undefined,
      episodeNumber: type === 'tv' ? episode : undefined,
      progressSeconds: Math.floor(latestProgress.current.time || startAt),
      durationSeconds: Math.floor(latestProgress.current.duration || 0),
    }).catch(console.error);

    const syncInterval = setInterval(async () => {
      const { time, duration } = latestProgress.current;
      
      if (time > lastSyncTime.current + 3) {
        lastSyncTime.current = time;
        
        await HistoryService.syncProgress(user?.id, {
          mediaId: String(tmdbId),
          mediaKind: type === 'anime' ? 'tv' : type,
          title: mediaTitle,
          posterPath,
          seasonNumber: type === 'tv' ? season : undefined,
          episodeNumber: type === 'tv' ? episode : undefined,
          progressSeconds: Math.floor(time),
          durationSeconds: Math.floor(duration),
        }).catch(console.error);
      }
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [user?.id, mediaTitle, posterPath, tmdbId, type, season, episode, startAt]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchUrl = async () => {
      setErrorState(null);
      const activeProvider = PROVIDERS.find((p) => p.id === activeProviderId) || PROVIDERS[0];
      const url = await activeProvider.getUrl({ tmdbId, type, season, episode, startAt, mediaTitle });
      
      if (isMounted) {
        if (url === 'ERROR:NOT_FOUND') {
          setErrorState('This media is currently not available');
          setIframeSrc('');
          setIsLoading(false);
        } else if (url.startsWith('/')) {
           setIframeSrc(`https://vidy.st${url}`);
        } else {
           setIframeSrc(url);
        }
      }
    };
    
    fetchUrl();
    return () => { isMounted = false; };
  }, [activeProviderId, tmdbId, type, season, episode, startAt, mediaTitle]);

  const activeProvider = PROVIDERS.find((p) => p.id === activeProviderId) || PROVIDERS[0];

  return (
    <div 
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      className="w-full h-full min-h-[100dvh] overflow-hidden bg-black flex items-center justify-center relative select-none"
    >
      {/* Loading Spinner */}
      {isLoading && !errorState && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 gap-3 text-zinc-400 overflow-hidden">
          {posterPath && (
            <div 
              className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl scale-110"
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${posterPath})` }}
            />
          )}
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent relative z-20" />
          <span className="text-xs font-medium tracking-wide relative z-20">Loading Player...</span>
        </div>
      )}

      {/* Error State */}
      {errorState && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 gap-4 text-zinc-400 overflow-hidden">
          {posterPath && (
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center blur-2xl scale-110"
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w1280${posterPath})` }}
            />
          )}
          <div className="relative z-20 flex flex-col items-center text-center max-w-md px-6">
            <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Media Unavailable</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {errorState}
            </p>
          </div>
        </div>
      )}

      {/* Auto-fading Back Button Container */}
      <div 
        className={`absolute top-4 left-4 sm:top-6 sm:left-6 z-40 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-20 hover:opacity-100'
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        <BackButton onClick={() => {
          const from = searchParams.get('from');
          if (from) {
            router.push(from);
          } else {
            const kind = type === 'anime' ? 'anime' : (type === 'tv' ? 'tv' : 'movies');
            router.push(`/${kind}/${tmdbId}`);
          }
        }} />
      </div>

      {/* Auto-fading Server Switcher */}
      <div 
        className={`absolute top-4 left-1/2 -translate-x-1/2 sm:top-6 z-40 pt-[env(safe-area-inset-top,0px)] transition-all duration-300 pointer-events-auto flex flex-wrap gap-2 justify-center w-full max-w-[90vw] ${
          showControls ? 'opacity-100' : 'opacity-40 hover:opacity-100'
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        {PROVIDERS.filter(p => type === 'anime' ? true : p.id !== 'aniembed').map((provider) => (
          <button
            key={provider.id}
            onClick={() => {
              if (activeProviderId !== provider.id) {
                setIsLoading(true);
                setActiveProviderId(provider.id);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium backdrop-blur-md transition-colors ${
              activeProviderId === provider.id 
                ? 'bg-red-600/90 text-white shadow-lg shadow-red-900/20 border border-red-500' 
                : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800/80 hover:text-white border border-white/10'
            }`}
          >
            {provider.name}
          </button>
        ))}
      </div>

      {iframeSrc && (
        <iframe
          key={activeProviderId}
          src={iframeSrc}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full min-h-[100dvh] border-0"
          allowFullScreen
          allow="encrypted-media; autoplay *; fullscreen *; accelerometer; gyroscope; picture-in-picture"
          title="Video Player"
        />
      )}
    </div>
  );
}
