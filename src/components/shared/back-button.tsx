'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // If there is history, router.back() preserves session search query state & opens SearchOverlay automatically
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all hover:border-red-500/50 hover:bg-zinc-800 hover:text-white cursor-pointer shadow-lg active:scale-95"
    >
      <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:-translate-x-1 group-hover:text-red-400 transition-transform" />
      <span>Back</span>
    </button>
  );
}
