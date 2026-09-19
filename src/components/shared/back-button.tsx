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
      className="group inline-flex items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 p-2.5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-zinc-800 cursor-pointer shadow-lg active:scale-95"
    >
      <ArrowLeft className="h-5 w-5 text-zinc-300 group-hover:text-white transition-transform" />
    </button>
  );
}
