import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RatingProps {
  value: number;
  count?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function Rating({ value, count, className, size = 'sm' }: RatingProps) {
  const formattedRating = value.toFixed(1);

  return (
    <div className={cn('inline-flex items-center gap-1 font-semibold text-amber-400 select-none', className)}>
      <Star className={cn('fill-amber-400 text-amber-400', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
      <span className={cn('text-zinc-100', size === 'sm' ? 'text-xs' : 'text-sm')}>{formattedRating}</span>
      {count !== undefined && (
        <span className="text-[11px] font-normal text-zinc-500">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
