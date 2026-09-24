import React, { useMemo, useState } from 'react';
import { WatchlistItem } from '@/features/watchlist/types';
import { ChevronRight } from 'lucide-react';
import { WatchlistModal } from '@/features/watchlist/components/watchlist-modal';

interface MoodAnalyticsProps {
  items: WatchlistItem[];
}

export function MoodAnalytics({ items }: MoodAnalyticsProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodsData = useMemo(() => {
    const moodMap = new Map<string, { count: number; totalRating: number; ratedCount: number; mediaIds: string[] }>();
    
    items.forEach(item => {
      (item.moods || []).forEach(mood => {
        const existing = moodMap.get(mood) || { count: 0, totalRating: 0, ratedCount: 0, mediaIds: [] };
        existing.count++;
        existing.mediaIds.push(item.mediaId);
        if (typeof item.userRating === 'number') {
          existing.totalRating += item.userRating;
          existing.ratedCount++;
        }
        moodMap.set(mood, existing);
      });
    });

    return Array.from(moodMap.entries())
      .map(([mood, data]) => ({
        mood,
        count: data.count,
        avgRating: data.ratedCount > 0 ? (data.totalRating / data.ratedCount).toFixed(1) : '-',
        mediaIds: data.mediaIds,
      }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  if (moodsData.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight mb-1">HOW YOUR WATCHES MADE YOU FEEL</h2>
        <p className="text-sm text-zinc-400">Your emotional entertainment profile.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {moodsData.slice(0, 8).map((data, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/50 border border-white/5 group transition-all"
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{data.mood}</span>
              <span className="text-xs text-zinc-500 font-semibold">{data.count} titles</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-zinc-600">Avg Rating</span>
              <span className="text-lg font-black text-amber-500">{data.avgRating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
