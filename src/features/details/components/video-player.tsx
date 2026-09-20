'use client';

import * as React from 'react';
import { BackButton } from '@/components/shared/back-button';

interface VidLinkPlayerProps {
  tmdbId: string | number;
  type?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  startAt?: number;
}

export function VidLinkPlayer({
  tmdbId,
  type = 'movie',
  season = 1,
  episode = 1,
  startAt = 0,
}: VidLinkPlayerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [showControls, setShowControls] = React.useState(true);
  const hideControlsTimer = React.useRef<NodeJS.Timeout | null>(null);

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
      // Ensure the message is from VidLink
      if (event.origin !== 'https://vidlink.pro') return;

      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        // Save to localStorage so it can be resumed later
        localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const baseUrl = 'https://vidlink.pro';
  const urlPath = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}/${season}/${episode}`;

  const queryParams = new URLSearchParams({
    autoplay: 'false',
  });

  if (startAt > 0) {
    queryParams.append('startAt', startAt.toString());
  }

  const iframeSrc = queryParams.toString() ? `${baseUrl}${urlPath}?${queryParams.toString()}` : `${baseUrl}${urlPath}`;

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
