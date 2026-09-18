import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'outline' | 'glass';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        {
          'bg-zinc-800 text-zinc-200 border border-zinc-700/60': variant === 'default',
          'bg-red-500/15 text-red-400 border border-red-500/30': variant === 'accent',
          'border border-zinc-700 text-zinc-400': variant === 'outline',
          'bg-black/40 backdrop-blur-md text-zinc-200 border border-white/10': variant === 'glass',
        },
        className
      )}
      {...props}
    />
  );
}
