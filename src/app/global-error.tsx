'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global layout error caught:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Application Error</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            {error?.message?.includes('fetch failed') || error?.message?.includes('ECONNRESET')
              ? 'Network request failed. Please check your internet connection and try again.'
              : 'A critical server error occurred while rendering the page.'}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/20"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
