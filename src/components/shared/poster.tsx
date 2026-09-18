import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

interface PosterProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Poster({ src, alt, className, priority = false }: PosterProps) {
  return (
    <div className={cn('relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
