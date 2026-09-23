'use server';

import { TmdbService } from '@/services/tmdb.service';

export async function fetchMediaCast(mediaId: string, mediaKind: 'movie' | 'tv') {
  try {
    if (mediaKind === 'movie') {
      const details = await TmdbService.getMovieDetails(mediaId);
      return details?.cast || [];
    } else {
      const details = await TmdbService.getTvDetails(mediaId);
      return details?.cast || [];
    }
  } catch (err) {
    console.error('Error fetching cast in server action:', err);
    return [];
  }
}
