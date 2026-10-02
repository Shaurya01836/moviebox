'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();


  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (pathname?.startsWith('/play')) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-white/10 text-white shadow-xl shadow-black/50 transition-all duration-300 hover:bg-zinc-800 hover:scale-110 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
