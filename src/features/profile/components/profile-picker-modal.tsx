'use client';

import * as React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useAuth } from '@/features/auth/context/auth-context';
import { useProfile } from '../context/profile-context';
import { AVATAR_OPTIONS, getAvatarOption } from '../types';

export function ProfilePickerModal() {
  const { user } = useAuth();
  const { activeProfile, isPickerOpen, isSetupCompleted, setIsPickerOpen, saveProfileAvatar } = useProfile();
  
  const [profileName, setProfileName] = React.useState('');
  const [selectedAvatarId, setSelectedAvatarId] = React.useState('avatar-lorelei-1');
  const [isSaving, setIsSaving] = React.useState(false);

  // Sync current profile data into form when modal opens
  React.useEffect(() => {
    if (isPickerOpen) {
      if (activeProfile) {
        setProfileName(activeProfile.name);
        setSelectedAvatarId(activeProfile.avatarUrl || 'avatar-lorelei-1');
      } else {
        const defaultName = user?.email ? user.email.split('@')[0] : 'My Profile';
        setProfileName(defaultName);
        setSelectedAvatarId('avatar-lorelei-1');
      }
    }
  }, [isPickerOpen, activeProfile, user]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isPickerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPickerOpen]);

  if (!isPickerOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setIsSaving(true);
    try {
      await saveProfileAvatar(profileName.trim(), selectedAvatarId, activeProfile?.id || undefined, false);
      setIsPickerOpen(false);
    } catch (err) {
      console.error('Failed saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatarOption = getAvatarOption(selectedAvatarId);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl backdrop-saturate-150 animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative w-full max-w-2xl px-6 py-8 text-center text-white space-y-6 my-auto bg-zinc-950/85 border border-white/15 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/90">
        
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isSetupCompleted ? 'Edit Profile & Avatar' : 'Customize Your Profile'}
          </h2>
        </div>

        {/* Selected Avatar Preview */}
        <div className="flex justify-center py-1">
          <div className={`relative flex h-24 w-24 items-center justify-center rounded-full ${currentAvatarOption.bg} shadow-2xl border-4 border-white/20 p-1.5`}>
            <img src={currentAvatarOption.url} alt={currentAvatarOption.name} className="h-full w-full object-cover rounded-full" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="max-w-md mx-auto space-y-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pl-1">
              Profile Name
            </label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter Profile Name..."
              className="w-full rounded-2xl border border-white/15 bg-zinc-900/90 px-4 py-3 text-sm font-semibold text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
            />
          </div>

          {/* DiceBear Avatar Grid */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                CHOOSE AN AVATAR ICON
              </span>
              <span className="text-[10px] font-medium text-zinc-500">
                16 DiceBear Avatars
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-3 bg-zinc-900/60 rounded-3xl border border-white/10">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = selectedAvatarId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(opt.id)}
                    className={`group relative flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
                      isSelected ? 'scale-105 bg-white/10' : 'hover:scale-105 hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full ${opt.bg} shadow-md border-2 overflow-hidden p-1 ${
                        isSelected ? 'border-red-500 ring-2 ring-red-500/50' : 'border-white/10'
                      }`}
                    >
                      <img src={opt.url} alt={opt.name} className="h-full w-full object-cover rounded-full" />
                    </div>
                    <span className="text-[9px] font-semibold text-zinc-400 mt-1 truncate max-w-[56px]">
                      {opt.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 rounded-full bg-red-600 text-white p-0.5 shadow-md">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="rounded-full border border-white/15 bg-zinc-900 px-7 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!profileName.trim() || isSaving}
              className="rounded-full bg-red-600 px-8 py-2.5 text-xs font-extrabold text-white hover:bg-red-500 transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-red-950/40 cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
