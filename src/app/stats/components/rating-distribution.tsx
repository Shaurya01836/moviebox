import React, { useMemo } from 'react';
import { WatchlistItem } from '@/features/watchlist/types';

interface RatingDistributionProps {
  items: WatchlistItem[];
}

export function RatingDistribution({ items }: RatingDistributionProps) {
  const data = useMemo(() => {
    // Buckets: 10.0, 9.0-9.9, 8.0-8.9, 7.0-7.9, etc.
    const buckets = [
      { label: '10', min: 10.0, max: 10.0, count: 0 },
      { label: '9', min: 9.0, max: 9.9, count: 0 },
      { label: '8', min: 8.0, max: 8.9, count: 0 },
      { label: '7', min: 7.0, max: 7.9, count: 0 },
      { label: '6', min: 6.0, max: 6.9, count: 0 },
      { label: '5', min: 5.0, max: 5.9, count: 0 },
      { label: '<5', min: 0.0, max: 4.9, count: 0 },
    ];

    items.forEach(item => {
      if (typeof item.userRating === 'number') {
        const rating = item.userRating;
        for (const b of buckets) {
          if (rating >= b.min && rating <= b.max) {
            b.count++;
            break;
          }
        }
      }
    });

    return buckets;
  }, [items]);

  const maxVal = Math.max(...data.map(d => d.count), 1);
  const totalRated = data.reduce((sum, d) => sum + d.count, 0);

  if (totalRated === 0) return null;

  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight mb-1">RATING DISTRIBUTION</h2>
        <p className="text-sm text-zinc-400">How you rate the titles you watch.</p>
      </div>

      <div className="flex flex-col gap-3">
        {data.map((bucket, i) => {
          const widthPct = (bucket.count / maxVal) * 100;
          return (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-8 shrink-0 text-right text-xs font-bold text-zinc-500">
                {bucket.label}
              </div>
              <div className="flex-1 h-6 bg-zinc-950/50 rounded-full overflow-hidden relative border border-white/5">
                <div 
                  className="h-full bg-emerald-500/80 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${widthPct}%`, minWidth: bucket.count > 0 ? '8px' : '0' }}
                />
              </div>
              <div className="w-10 shrink-0 text-left text-sm font-bold text-white">
                {bucket.count > 0 ? bucket.count : '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
