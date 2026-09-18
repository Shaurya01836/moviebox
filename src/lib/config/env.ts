/**
 * Application Environment Configuration Schema
 * 
 * Future environment variables can be declared here.
 * Client-accessible variables MUST start with NEXT_PUBLIC_.
 * Server-only variables (database URLs, API keys, secrets) MUST NOT be exposed to the client.
 */

export const env = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Server-only TMDB API configuration
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '62513680a70453f584b71ef5945ccc61',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '',
  },
};
