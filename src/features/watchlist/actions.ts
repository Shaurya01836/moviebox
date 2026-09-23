
import { env } from '@/lib/config/env';

export async function getLogoPathAction(mediaId: string, mediaKind: string): Promise<string | null> {
  try {
    const apiKey = env.tmdb.apiKey || '62513680a70453f584b71ef5945ccc61';
    const type = mediaKind === 'tv' ? 'tv' : 'movie';
    const url = `${env.tmdb.baseUrl}/${type}/${mediaId}/images?api_key=${apiKey}&include_image_language=en,null`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enLogo = data.logos?.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === null);
    if (enLogo) {
      return `${env.tmdb.imageBaseUrl}/w500${enLogo.file_path}`;
    }
    return null;
  } catch (err) {
    return null;
  }
}
