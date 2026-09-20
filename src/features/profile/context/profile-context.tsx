'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, AVATAR_OPTIONS } from '../types';
import { ProfileService } from '../services/profile.service';
import { useAuth } from '@/features/auth/context/auth-context';

interface ProfileContextType {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  isPickerOpen: boolean;
  isSetupCompleted: boolean;
  isLoadingProfiles: boolean;
  setIsPickerOpen: (open: boolean) => void;
  selectProfile: (profile: UserProfile) => void;
  clearActiveProfile: () => void;
  saveProfileAvatar: (name: string, avatarId: string, profileId?: string, autoSelect?: boolean) => Promise<void>;
  addProfile: (name: string, avatarId?: string) => Promise<void>;
}

const DEFAULT_PROFILES: UserProfile[] = [];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>(DEFAULT_PROFILES);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  useEffect(() => {
    async function loadDbProfiles() {
      setIsLoadingProfiles(true);
      const userId = user?.id;

      if (!userId) {
        // Unauthenticated anonymous / logged out state -> reset active profile state
        setActiveProfile(null);
        setProfiles([]);
        setIsSetupCompleted(false);
        setIsLoadingProfiles(false);
        return;
      }

      // Authenticated state -> Fetch from Supabase DB
      try {
        const dbProfiles = await ProfileService.getProfilesByUser(userId);
        if (dbProfiles.length > 0) {
          setProfiles([dbProfiles[0]]);
          setActiveProfile(dbProfiles[0]);
          setIsSetupCompleted(true);
          setIsPickerOpen(false);
        } else {
          // New authenticated user with no DB profiles -> Trigger single profile setup
          setIsSetupCompleted(false);
          setActiveProfile(null);
          setIsPickerOpen(true);
        }
      } catch (err) {
        console.error('Failed loading DB profiles:', err);
      } finally {
        setIsLoadingProfiles(false);
      }
    }

    loadDbProfiles();
  }, [user]);

  const clearActiveProfile = () => {
    setActiveProfile(null);
    setProfiles([]);
    setIsSetupCompleted(false);
    const userId = user?.id;
    if (userId) {
      localStorage.removeItem(`moviebox_active_${userId}`);
    }
    localStorage.removeItem('moviebox_active_profile');
  };

  const selectProfile = (profile: UserProfile) => {
    setActiveProfile(profile);
    const userId = user?.id;
    if (userId) {
      localStorage.setItem(`moviebox_active_${userId}`, JSON.stringify(profile));
    } else {
      localStorage.setItem('moviebox_active_profile', JSON.stringify(profile));
    }
    setIsPickerOpen(false);
  };

  const saveProfileAvatar = async (name: string, avatarId: string, profileId?: string, autoSelect = true) => {
    const userId = user?.id || 'anon_user';
    const saved = await ProfileService.saveProfile(userId, name, avatarId, profileId);

    if (saved) {
      setIsSetupCompleted(true);
      const existingIdx = profiles.findIndex((p) => p.id === saved.id);
      let updated: UserProfile[];
      if (existingIdx >= 0) {
        updated = [...profiles];
        updated[existingIdx] = saved;
      } else {
        updated = [...profiles, saved];
      }
      setProfiles(updated);

      if (activeProfile?.id === saved.id) {
        setActiveProfile(saved);
        if (userId) {
          localStorage.setItem(`moviebox_active_${userId}`, JSON.stringify(saved));
        } else {
          localStorage.setItem('moviebox_active_profile', JSON.stringify(saved));
        }
      }

      if (autoSelect) {
        selectProfile(saved);
      }
    }
  };

  const addProfile = async (name: string, avatarId: string = 'avatar-5') => {
    await saveProfileAvatar(name, avatarId);
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        isPickerOpen,
        isSetupCompleted,
        isLoadingProfiles,
        setIsPickerOpen,
        selectProfile,
        clearActiveProfile,
        saveProfileAvatar,
        addProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
