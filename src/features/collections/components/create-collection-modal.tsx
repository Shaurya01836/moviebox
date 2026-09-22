'use client';

import * as React from 'react';
import { X, Plus, Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCollections } from '../context/collections-context';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
}

export function CreateCollectionModal({ isOpen, onClose, defaultName = '' }: CreateCollectionModalProps) {
  const { createCollection } = useCollections();
  const [name, setName] = React.useState(defaultName);
  const [description, setDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setDescription('');
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createCollection(name.trim(), description.trim() || undefined);
      onClose();
    } catch (err) {
      console.error('Error creating collection', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Collection</h2>
            <p className="text-xs text-zinc-400">Organize your entertainment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 ml-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Favorites, Comfort Movies"
              required
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-red-500 text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 ml-1">Description <span className="text-zinc-600 font-normal">(Optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of this collection..."
              rows={3}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-xl py-5 shadow-lg active:scale-95 transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Collection
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
