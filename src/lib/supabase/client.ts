import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/config/env';

export function createClient() {
  return createBrowserClient(
    env.supabase.url,
    env.supabase.anonKey
  );
}
