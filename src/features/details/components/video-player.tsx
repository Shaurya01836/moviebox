'use client';

import * as React from 'react';

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
    <div className="w-full h-full overflow-hidden bg-black">
      <iframe
        src={iframeSrc}
        className="w-full h-full border-0"
        allowFullScreen
        allow="encrypted-media; autoplay *; fullscreen *"
        title="Video Player"
      />
    </div>
  );
}
