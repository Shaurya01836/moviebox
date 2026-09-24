import * as React from 'react';
import Link from 'next/link';
import { Search, Film, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { WatchlistItem } from '@/features/watchlist/types';
import { WatchlistCard } from '@/features/watchlist/components/watchlist-card';
import { MovieCardSkeleton } from '@/components/shared/movie-card-skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LibrarySectionProps {
  title: string;
  items: WatchlistItem[];
  filteredItems: WatchlistItem[];
  icon: React.ElementType;
  size?: 'large' | 'small';
  isOpen: boolean;
  onToggle: () => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedMedia: 'all' | 'movie' | 'tv' | 'anime';
  setSelectedMedia: (val: any) => void;
  sortBy: string;
  setSortBy: (val: any) => void;
  handleEdit: (item: WatchlistItem) => void;
  handleDelete: (id: string) => void;
  colorClass?: string;
}

export function LibrarySection({
  title,
  items,
  filteredItems,
  icon: Icon,
  size = 'large',
  isOpen,
  onToggle,
  isLoading,
  searchQuery,
  setSearchQuery,
  selectedMedia,
  setSelectedMedia,
  sortBy,
  setSortBy,
  handleEdit,
  handleDelete,
  colorClass = 'red'
}: LibrarySectionProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset page to 1 on filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedMedia, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const isLarge = size === 'large';
  const heightClass = isLarge ? 'h-40 sm:h-48' : 'h-24 sm:h-32';
  const roundedClass = isLarge ? 'rounded-3xl' : 'rounded-2xl';
  const openRoundedClass = isLarge ? 'rounded-t-[2rem]' : 'rounded-t-[1.5rem]';

  const colorStyles = {
    red: { bg: 'bg-red-600', shadow: 'shadow-red-900/50', activeBtn: 'bg-red-600' },
    amber: { bg: 'bg-amber-600', shadow: 'shadow-amber-900/50', activeBtn: 'bg-amber-600' },
    blue: { bg: 'bg-blue-600', shadow: 'shadow-blue-900/50', activeBtn: 'bg-blue-600' },
  }[colorClass as 'red' | 'amber' | 'blue'] || { bg: 'bg-zinc-600', shadow: 'shadow-zinc-900/50', activeBtn: 'bg-zinc-600' };

  return (
    <section className={`transition-all duration-500 ease-in-out border border-white/5 bg-zinc-900/20 ${isOpen ? (isLarge ? 'rounded-[2rem] shadow-2xl' : 'rounded-[1.5rem] shadow-xl') : `${roundedClass} border-transparent`}`}>
      <button 
        onClick={onToggle}
        className="w-full block group text-left cursor-pointer relative z-10"
      >
        <div className={`relative w-full ${heightClass} overflow-hidden bg-zinc-900 shadow-xl transition-all duration-300 group-hover:border-white/20 border border-white/10 ${isOpen ? `${openRoundedClass} border-b-transparent` : roundedClass}`}>
          {/* Dynamic Poster Background */}
          {items.length > 0 && (
            <div className="absolute inset-0 flex">
              {items.slice(0, 8).map((item) => (
                <div key={item.mediaId} className="h-full flex-1 opacity-40 group-hover:opacity-60 transition-opacity duration-500" style={{ backgroundImage: `url(${item.posterPath})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          
          <div className={`absolute inset-0 flex flex-col justify-center ${isLarge ? 'p-6 sm:p-10' : 'p-4 sm:p-6'}`}>
    
            <h3 className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold text-white mb-1`}>{title}</h3>
            <p className="text-sm font-medium text-zinc-400">
              {items.length} titles <span className="text-zinc-600 mx-1">•</span> 
              {items.filter(i => i.mediaKind === 'movie' && !i.genres?.includes('Animation')).length} Movies <span className="text-zinc-600 mx-1">•</span> 
              {items.filter(i => i.mediaKind === 'tv' && !i.genres?.includes('Animation')).length} Series
            </p>
          </div>
        </div>
      </button>
      
      <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6 space-y-6 pt-6">
            {/* Controls Bar: Media Filter & Local Search */}
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
              <div className="flex items-center overflow-x-auto gap-1 sm:gap-1.5 p-1 rounded-2xl bg-zinc-950/80 border border-zinc-800 scrollbar-none">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'movie', label: 'Movies' },
                  { id: 'tv', label: 'TV Shows' },
                  { id: 'anime', label: 'Anime' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedMedia(type.id as any)}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                      selectedMedia === type.id
                        ? (colorClass === 'amber' ? 'bg-amber-600 text-white shadow-md' : colorClass === 'blue' ? 'bg-blue-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md')
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Filter ${title}...`}
                  className="pl-9 h-10 bg-zinc-950 border-zinc-800 text-xs text-white"
                />
              </div>

              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 w-full sm:w-auto appearance-none rounded-xl bg-zinc-950 border border-zinc-800 px-4 pr-10 text-xs font-semibold text-white focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-colors"
                >
                  <option value="recent">Recently Added</option>
                  <option value="rating_desc">Highest Rated</option>
                  <option value="rating_asc">Lowest Rated</option>
                  <option value="az">A–Z</option>
                  <option value="za">Z–A</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            {/* Watchlist Grid / Cards */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MovieCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-500">
                  <Film className="h-8 w-8 text-zinc-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No titles found</h3>
                  <p className="text-xs text-zinc-400 max-w-sm">
                    {searchQuery ? "Try adjusting your search or filters." : "Start building your personal cinema journal!"}
                  </p>
                </div>
                {!searchQuery && (
                  <Link href="/search">
                    <Button variant="primary" size="sm" className="font-bold gap-1.5 mt-2">
                      <Search className="h-3.5 w-3.5" />
                      Explore Movies & TV Shows
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3.5 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {paginatedItems.map((item, index) => (
                    <WatchlistCard
                      key={item.id}
                      item={item}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isPersonalCollection={true}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs text-zinc-400">
                    <div>
                      Showing <span className="font-bold text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                      <span className="font-bold text-white">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}
                      </span>{' '}
                      of <span className="font-bold text-white">{filteredItems.length}</span> titles
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-950 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentPage === page
                              ? (colorClass === 'amber' ? 'bg-amber-600 text-white shadow-md border border-amber-500/30' : colorClass === 'blue' ? 'bg-blue-600 text-white shadow-md border border-blue-500/30' : 'bg-red-600 text-white shadow-md border border-red-500/30')
                              : 'bg-zinc-950 text-zinc-400 border border-white/10 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-950 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Next Page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
