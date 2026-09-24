import React, { useMemo } from 'react';
import { WatchlistItem } from '@/features/watchlist/types';

interface TimelineChartProps {
  items: WatchlistItem[];
}

export function TimelineChart({ items }: TimelineChartProps) {
  // Group items by year and month
  const data = useMemo(() => {
    const yearMonthMap = new Map<string, number>();
    const yearMap = new Map<string, number>();

    items.forEach(item => {
      if (item.createdAt) {
        const d = new Date(item.createdAt);
        if (isNaN(d.getTime())) return;
        const year = d.getFullYear().toString();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;
        
        yearMonthMap.set(key, (yearMonthMap.get(key) || 0) + 1);
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      }
    });

    // Determine if we should show years or months (if only 1 year of data, show months)
    const years = Array.from(yearMap.keys()).sort();
    if (years.length === 0) return { type: 'none', labels: [], values: [] };

    if (years.length === 1) {
      // Show months for that year
      const year = years[0];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const values = Array(12).fill(0);
      
      Array.from(yearMonthMap.entries()).forEach(([k, v]) => {
        if (k.startsWith(year)) {
          const mIdx = parseInt(k.split('-')[1], 10) - 1;
          values[mIdx] = v;
        }
      });
      return { type: 'months', labels: months, values };
    } else {
      // Show years
      const labels = years;
      const values = years.map(y => yearMap.get(y) || 0);
      return { type: 'years', labels, values };
    }
  }, [items]);

  if (data.type === 'none') {
    return null;
  }

  const maxVal = Math.max(...data.values, 1); // Avoid division by zero

  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight mb-1">TITLES OVER TIME</h2>
        <p className="text-sm text-zinc-400">Based on titles with recorded watch dates.</p>
      </div>

      <div className="h-48 sm:h-64 flex items-end gap-2 sm:gap-4 overflow-x-auto scrollbar-none pb-2">
        {data.values.map((val, idx) => {
          const heightPct = (val / maxVal) * 100;
          return (
            <div key={idx} className="flex flex-col items-center flex-1 min-w-[32px] group">
              <div className="w-full flex justify-center h-full items-end relative">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-xs font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                  {val} titles
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[40px] bg-red-500/80 hover:bg-red-400 rounded-t-md transition-all duration-500 ease-out"
                  style={{ height: `${heightPct}%`, minHeight: val > 0 ? '4px' : '0' }}
                />
              </div>
              <div className="mt-3 text-[10px] sm:text-xs font-semibold text-zinc-500 text-center uppercase tracking-wider">
                {data.labels[idx]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
