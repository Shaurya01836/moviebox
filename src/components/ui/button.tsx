import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-95 select-none',
          {
            'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500/20':
              variant === 'primary',
            'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50': variant === 'secondary',
            'border border-zinc-700 hover:border-zinc-500 bg-transparent text-zinc-200 hover:text-white':
              variant === 'outline',
            'hover:bg-zinc-800/70 text-zinc-300 hover:text-white': variant === 'ghost',
            'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 shadow-black/20 shadow-md':
              variant === 'glass',
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-5 text-sm': size === 'md',
            'h-12 px-7 text-base': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
