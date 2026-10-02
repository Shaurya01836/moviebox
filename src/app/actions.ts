'use server';

export async function checkAniembedExists(anilistId: number | string, episode: number | string): Promise<boolean> {
  try {
    const res = await fetch(`https://aniembed.se/e/${anilistId}/${episode}?lang=sub`);
    if (!res.ok) return false;
    const text = await res.text();
    // If it contains this specific error string, it means Aniembed doesn't have it
    if (text.includes("Couldn't load the player")) {
      return false;
    }
    return true;
  } catch (error) {
    return false; // If fetch fails, assume it doesn't exist
  }
}
