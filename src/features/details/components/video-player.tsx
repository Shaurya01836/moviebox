'use client';

import * as React from 'react';
import { BackButton } from '@/components/shared/back-button';
import { useAuth } from '@/features/auth/context/auth-context';
import { HistoryService } from '@/features/history/services/history.service';

interface VidLinkPlayerProps {
  tmdbId: string | number;
  type?: 'movie' | 'tv';
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
  const hideControlsTimer = React.useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  
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
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        // Save to localStorage so it can be resumed later
        localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
        
        // Update ref
        if (mediaData.currentTime) latestProgress.current.time = mediaData.currentTime;
        if (mediaData.duration) latestProgress.current.duration = mediaData.duration;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Sync loop (every 15 seconds)
  React.useEffect(() => {
    if (!user) return;
    
    const syncInterval = setInterval(async () => {
      const { time, duration } = latestProgress.current;
      
      // Only sync if progress has advanced by at least 5 seconds since last sync
      if (time > lastSyncTime.current + 5) {
        lastSyncTime.current = time;
        
        await HistoryService.syncProgress(user.id, {
          mediaId: String(tmdbId),
          mediaKind: type,
          title: mediaTitle,
          posterPath,
          seasonNumber: type === 'tv' ? season : undefined,
          episodeNumber: type === 'tv' ? episode : undefined,
          progressSeconds: Math.floor(time),
          durationSeconds: Math.floor(duration),
        }).catch(console.error);
      }
    }, 15000); // 15s throttle

    return () => clearInterval(syncInterval);
  }, [user, mediaTitle, posterPath, tmdbId, type, season, episode]);

  const baseUrl = 'https://vidsrc.me/embed';
  let urlPath = type === 'movie' ? `/movie?tmdb=${tmdbId}` : `/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;

  if (startAt > 0) {
    urlPath += `&startAt=${startAt}`;
  }

  const iframeSrc = `${baseUrl}${urlPath}`;

  return (
    <div 
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      className="w-full h-full min-h-[100dvh] overflow-hidden bg-black flex items-center justify-center relative select-none"
    >
      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 gap-3 text-zinc-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          <span className="text-xs font-medium tracking-wide">Loading Player...</span>
        </div>
      )}

      {/* Auto-fading Back Button Container */}
      <div 
        className={`absolute top-4 left-4 sm:top-6 sm:left-6 z-40 pt-[env(safe-area-inset-top,0px)] transition-opacity duration-300 pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <BackButton />
      </div>

      <iframe
        src={iframeSrc}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full min-h-[100dvh] border-0"
        allowFullScreen
        allow="encrypted-media; autoplay *; fullscreen *; accelerometer; gyroscope; picture-in-picture"
        title="Video Player"
      />
    </div>
  );
}
