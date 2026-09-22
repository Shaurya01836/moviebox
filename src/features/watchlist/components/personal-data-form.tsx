'use client';

import * as React from 'react';
import { useWatchlist } from '../context/watchlist-context';
import { fetchMediaCast } from '@/app/actions/tmdb';
import { MediaKind } from '@/types/movie';
import { Person } from '../types';
import { Star, Smile, Heart, UserCircle, Loader2 } from 'lucide-react';

const MOODS = [
  'Happy', 'Sad', 'Excited', 'Heartbroken', 'Mind-blown',
  'Anxious', 'Comforted', 'Nostalgic', 'Thought-provoking', 'Terrified'
];

interface PersonalDataFormProps {
  mediaId: string;
  mediaKind: MediaKind;
}

export function PersonalDataForm({ mediaId, mediaKind }: PersonalDataFormProps) {
  const { getByMediaId, upsert } = useWatchlist();
  const existingItem = getByMediaId(mediaId);
  const isSaved = Boolean(existingItem);
  
  const [cast, setCast] = React.useState<any[]>([]);
  const [isLoadingCast, setIsLoadingCast] = React.useState(false);

  // Local state for debouncing
  const [localRating, setLocalRating] = React.useState<number | undefined>(existingItem?.userRating);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setLocalRating(existingItem?.userRating);
  }, [existingItem?.userRating]);

  React.useEffect(() => {
    if (isSaved) {
      setIsLoadingCast(true);
      fetchMediaCast(mediaId, mediaKind).then((res) => {
        setCast(res);
        setIsLoadingCast(false);
      });
    }
  }, [isSaved, mediaId, mediaKind]); 

  if (!isSaved || !existingItem) return null;

  const handleRatingChange = (val: number) => {
    setLocalRating(val);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      upsert({ ...existingItem, userRating: val });
    }, 500);
  };

  const handleToggleMood = (mood: string) => {
    const currentMoods = existingItem.moods || [];
    const newMoods = currentMoods.includes(mood)
      ? currentMoods.filter(m => m !== mood)
      : [...currentMoods, mood];
    upsert({ ...existingItem, moods: newMoods });
  };

  const handleTogglePerson = (personId: string, name: string, roleType: 'actor' | 'character', profilePath?: string) => {
    const current = existingItem.favoriteCharacters || [];
    const isFav = current.some(p => p.id === personId);
    const newFavs = isFav ? current.filter(p => p.id !== personId) : [...current, { id: personId, name, roleType, profilePath }];
    upsert({ ...existingItem, favoriteCharacters: newFavs });
  };

  return (
    <div className="space-y-5 pt-3 mt-3 border-t border-white/10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
      
      {/* RATING */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
            <Star className="w-3 h-3" /> Your Rating
          </span>
          <span className="text-xs font-bold text-amber-400">{localRating ? `${localRating.toFixed(1)} / 10` : '-'}</span>
        </div>
        <div className="px-1 relative">
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={localRating || 0}
            onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none transition-all"
            style={{
              background: `linear-gradient(to right, #f59e0b ${(localRating || 0) * 10}%, #27272a ${(localRating || 0) * 10}%)`
            }}
          />
          <style dangerouslySetInnerHTML={{
            __html: `
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #fcd34d;
              cursor: pointer;
              border: 2px solid #b45309;
              box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
              transition: transform 0.1s;
            }
            input[type=range]::-webkit-slider-thumb:hover {
              transform: scale(1.2);
            }
          `}} />
        </div>
      </div>

      {/* MOODS */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
          <Smile className="w-3 h-3" /> Mood
        </span>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map(mood => {
            const isSelected = (existingItem.moods || []).includes(mood);
            return (
              <button
                key={mood}
                onClick={() => handleToggleMood(mood)}
                className={`text-[10px] px-2.5 py-1.5 rounded-full transition-colors font-medium border cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      {/* CHARACTERS */}
      {isLoadingCast ? (
        <div className="flex items-center justify-center py-4 text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : cast.length > 0 ? (
        <div className="space-y-4 pt-3 border-t border-white/5">
          {/* FAVORITE CHARACTERS */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <UserCircle className="w-3 h-3" /> Favorite Characters
            </span>
            <div className="flex overflow-x-auto gap-2 pb-2 snap-x custom-scrollbar">
              {cast.slice(0, 20).map(c => {
                const isFav = (existingItem.favoriteCharacters || []).some(f => f.id === String(c.id));
                return (
                  <button
                    key={`char-${c.id}`}
                    onClick={() => handleTogglePerson(String(c.id), c.character || c.name, 'character', c.profile_path)}
                    className={`shrink-0 flex items-center gap-2 pr-3 py-1 rounded-full border transition-all snap-start cursor-pointer ${
                      isFav 
                        ? 'bg-red-500/15 border-red-500/40 text-red-100' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {c.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w45${c.profile_path}`} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                        <UserCircle className="w-3 h-3" />
                      </div>
                    )}
                    <span className="text-[10px] font-medium max-w-[100px] truncate">
                      {isFav && <Heart className="w-2.5 h-2.5 inline mr-1 fill-red-500 text-red-500" />}
                      {c.character || c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
