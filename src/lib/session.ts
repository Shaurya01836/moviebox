export const SESSION_KEY = 'moviebox_anon_id';

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';
  
  let anonId = localStorage.getItem(SESSION_KEY);
  if (!anonId) {
    // Generate a secure-enough random UUID for an anonymous session
    anonId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, anonId);
  }
  return anonId;
}
