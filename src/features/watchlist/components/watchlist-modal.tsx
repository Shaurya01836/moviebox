'use client';

import * as React from 'react';
import Image from 'next/image';
import { X, Star, Trash2, ChevronDown, ChevronUp, Sparkles, Quote, Heart, MessageSquare } from 'lucide-react';
import { WatchStatus, AspectRatings, JournalEntry, WATCH_STATUS_CONFIG, WatchlistItem } from '../types';
import { WatchlistService } from '../services/watchlist.service';
import { MediaKind } from '@/types/movie';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    mediaId: string;
    mediaKind: MediaKind;
    title: string;
    posterPath: string;
    backdropPath?: string;
    releaseYear?: number;
    voteAverage?: number;
    genres?: string[];
  } | null;
}

const EMOTION_TAGS = [
  'Mind-Blown 🤯',
  'Emotional 😭',
  'Thrilled ⚡',
  'Fun 😄',
  'Deep 🧠',
  'Cozy 🍿',
  'Masterpiece 🏆',
];

export function WatchlistModal({ isOpen, onClose, media }: WatchlistModalProps) {
  const [existingItem, setExistingItem] = React.useState<WatchlistItem | undefined>(undefined);
  const [prevMediaId, setPrevMediaId] = React.useState<string | null>(null);

  const [status, setStatus] = React.useState<WatchStatus>('watchlist');
  const [userRating, setUserRating] = React.useState<number>(8.0);
  const [showAspects, setShowAspects] = React.useState(false);

  const [aspects, setAspects] = React.useState<AspectRatings>({
    story: 8,
    characters: 8,
    acting: 8,
    visuals: 8,
    music: 8,
    rewatchability: 8,
  });

  const [journal, setJournal] = React.useState<JournalEntry>({
    review: '',
    notes: '',
    favoriteCharacter: '',
    favoriteQuote: '',
    favoriteEpisode: '',
    emotionTag: 'Mind-Blown 🤯',
    isSpoiler: false,
  });

  const currentMediaId = media?.mediaId || null;

  // Synchronize state when media changes or opens
  if (currentMediaId !== prevMediaId && isOpen && media) {
    setPrevMediaId(currentMediaId);
    const item = WatchlistService.getByMediaId(media.mediaId);
    setExistingItem(item);
    if (item) {
      setStatus(item.status);
      setUserRating(item.userRating || 8.0);
      setAspects(item.aspects || { story: 8, characters: 8, acting: 8, visuals: 8, music: 8, rewatchability: 8 });
      setJournal(item.journal || { review: '', notes: '', favoriteCharacter: '', favoriteQuote: '', favoriteEpisode: '', emotionTag: 'Mind-Blown 🤯', isSpoiler: false });
    } else {
      setStatus('watchlist');
      setUserRating(8.0);
      setAspects({ story: 8, characters: 8, acting: 8, visuals: 8, music: 8, rewatchability: 8 });
      setJournal({ review: '', notes: '', favoriteCharacter: '', favoriteQuote: '', favoriteEpisode: '', emotionTag: 'Mind-Blown 🤯', isSpoiler: false });
    }
  }

  if (!isOpen || !media) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    WatchlistService.upsert({
      mediaId: media.mediaId,
      mediaKind: media.mediaKind,
      title: media.title,
      posterPath: media.posterPath,
      backdropPath: media.backdropPath,
      releaseYear: media.releaseYear,
      voteAverage: media.voteAverage,
      genres: media.genres,
      status,
      userRating,
      aspects,
      journal,
    });
    onClose();
  };

  const handleDelete = () => {
    WatchlistService.delete(media.mediaId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Media Preview Header */}
        <div className="flex gap-4 items-center border-b border-zinc-800 pb-5">
          <div className="relative h-24 w-16 overflow-hidden rounded-xl bg-zinc-900 border border-white/10 shrink-0">
            <Image src={media.posterPath} alt={media.title} fill className="object-cover" />
          </div>
          <div>
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
              {media.mediaKind === 'tv' ? 'TV Show' : 'Movie'} Log
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{media.title}</h2>
            {media.releaseYear && <p className="text-xs text-zinc-400">{media.releaseYear}</p>}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Watch Status Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Watch Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(WATCH_STATUS_CONFIG) as WatchStatus[]).map((st) => {
                const cfg = WATCH_STATUS_CONFIG[st];
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-white text-zinc-950 border-white shadow-lg scale-105'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="text-lg mb-1">{cfg.emoji}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Personal Overall Rating */}
          <div className="space-y-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Personal Rating
              </label>
              <span className="text-xl font-extrabold text-amber-400">{userRating.toFixed(1)} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={userRating}
              onChange={(e) => setUserRating(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />

            {/* Toggle Detailed Aspect Ratings */}
            <button
              type="button"
              onClick={() => setShowAspects(!showAspects)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-300 pt-1 font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{showAspects ? 'Hide Aspect Breakdown' : 'Rate Story, Visuals, Acting, Music...'}</span>
              {showAspects ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {/* Collapsible Aspect Breakdown */}
            {showAspects && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
                {(['story', 'characters', 'acting', 'visuals', 'music', 'rewatchability'] as (keyof AspectRatings)[]).map((key) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 capitalize">
                      <span>{key}</span>
                      <span className="text-amber-400 font-bold">{aspects[key] || 8}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={aspects[key] || 8}
                      onChange={(e) => setAspects({ ...aspects, [key]: parseInt(e.target.value, 10) })}
                      className="w-full accent-amber-400 h-1.5"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Personal Journal & Review */}
          <div className="space-y-4 bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-red-500" />
              Watch Journal & Review
            </h3>

            {/* Emotion Tag Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400">How I Felt / Mood</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOTION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setJournal({ ...journal, emotionTag: tag })}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer select-none ${
                      journal.emotionTag === tag
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Short Review */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400">Short Review / Final Verdict</label>
              <textarea
                rows={3}
                value={journal.review || ''}
                onChange={(e) => setJournal({ ...journal, review: e.target.value })}
                placeholder="What did you think of the ending, plot, or pacing?"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Optional Quotes & Favorite Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-400" /> Favorite Character
                </label>
                <Input
                  value={journal.favoriteCharacter || ''}
                  onChange={(e) => setJournal({ ...journal, favoriteCharacter: e.target.value })}
                  placeholder="e.g. Kakashi Hatake"
                  className="h-9 text-xs bg-zinc-950 border-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                  <Quote className="h-3 w-3 text-amber-400" /> Favorite Quote
                </label>
                <Input
                  value={journal.favoriteQuote || ''}
                  onChange={(e) => setJournal({ ...journal, favoriteQuote: e.target.value })}
                  placeholder="e.g. 'I never go back on my word!'"
                  className="h-9 text-xs bg-zinc-950 border-zinc-800"
                />
              </div>
            </div>

            {/* Personal Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400">Personal Notes (Private)</label>
              <Input
                value={journal.notes || ''}
                onChange={(e) => setJournal({ ...journal, notes: e.target.value })}
                placeholder="e.g. Watched with Alex on Friday night"
                className="h-9 text-xs bg-zinc-950 border-zinc-800"
              />
            </div>

            {/* Spoiler Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-400">Contains Spoilers?</span>
              <button
                type="button"
                onClick={() => setJournal({ ...journal, isSpoiler: !journal.isSpoiler })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  journal.isSpoiler
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                }`}
              >
                {journal.isSpoiler ? '⚠️ Spoiler Warning Active' : 'No Spoilers'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {existingItem ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Remove from My List
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="px-6 font-bold">
                Save to My List
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
