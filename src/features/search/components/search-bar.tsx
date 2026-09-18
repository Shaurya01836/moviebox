'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = 'Search movies, TV shows, actors...', onSearch, className }: SearchBarProps) {
  const [query, setQuery] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`relative flex items-center w-full ${className || ''}`}>
      <Search className="absolute left-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10 bg-zinc-900/90 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-red-500/80"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
