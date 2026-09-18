'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error cleanly for debugging
    console.error('Unhandled runtime error intercepted by Error Boundary:', error);
  }, [error]);

  const isNetworkError =
    error?.message?.includes('fetch failed') ||
    error?.message?.includes('ECONNRESET') ||
    error?.message?.includes('network') ||
    error?.name === 'TypeError';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-2xl p-6 text-center backdrop-blur-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
          <AlertTriangle className="h-7 w-7" />
        </div>

        {/* Header */}
        <h2 className="text-xl font-bold text-white mb-2">
          {isNetworkError ? 'Connection Error' : 'Something went wrong'}
        </h2>

        {/* Description */}
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          {isNetworkError
            ? 'Failed to connect to the movie database service. The server connection may have reset or timed out.'
            : error.message || 'An unexpected error occurred while loading this page.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-red-600/25 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-all duration-200 border border-zinc-700/50 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
