import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  subtext?: string;
  colorClass?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  colorClass = 'red',
  className = '',
}: StatCardProps) {
  const colorStyles = {
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    zinc: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  }[colorClass as 'red' | 'blue' | 'amber' | 'emerald' | 'purple' | 'zinc'] || 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';

  return (
    <div className={`rounded-3xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-zinc-900/60 hover:border-white/10 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colorStyles}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          {label}
        </h3>
      </div>
      <div className="space-y-1">
        <div className="text-4xl font-black text-white tracking-tight">{value}</div>
        {subtext && <p className="text-xs font-semibold text-zinc-500">{subtext}</p>}
      </div>
    </div>
  );
}
