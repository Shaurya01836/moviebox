import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface DefaultAvatar {
  id: string;
  name: string;
  url: string;
}

export const AVATAR_OPTIONS: DefaultAvatar[] = [
  { id: 'avatar-lorelei-1', name: 'Sophia', url: 'https://api.dicebear.com/7.x/lorelei/png?seed=Sophia&backgroundColor=b6e3f4' },
  { id: 'avatar-lorelei-2', name: 'Alexander', url: 'https://api.dicebear.com/7.x/lorelei/png?seed=Alexander&backgroundColor=c0aede' },
  { id: 'avatar-lorelei-3', name: 'Maya', url: 'https://api.dicebear.com/7.x/lorelei/png?seed=Maya&backgroundColor=ffd5dc' },
  { id: 'avatar-notion-1', name: 'Julian', url: 'https://api.dicebear.com/7.x/notionists/png?seed=Julian&backgroundColor=ffdfbf' },
  { id: 'avatar-notion-2', name: 'Elena', url: 'https://api.dicebear.com/7.x/notionists/png?seed=Elena&backgroundColor=d1d4f9' },
  { id: 'avatar-notion-3', name: 'Marcus', url: 'https://api.dicebear.com/7.x/notionists/png?seed=Marcus&backgroundColor=c0aede' },
  { id: 'avatar-adv-1', name: 'Leo', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Leo&backgroundColor=b6e3f4' },
  { id: 'avatar-adv-2', name: 'Aria', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Aria&backgroundColor=ffdfbf' },
  { id: 'avatar-adv-3', name: 'Zack', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Zack&backgroundColor=c0aede' },
  { id: 'avatar-peeps-1', name: 'Chloe', url: 'https://api.dicebear.com/7.x/open-peeps/png?seed=Chloe&backgroundColor=d1d4f9' },
  { id: 'avatar-peeps-2', name: 'Ethan', url: 'https://api.dicebear.com/7.x/open-peeps/png?seed=Ethan&backgroundColor=b6e3f4' },
  { id: 'avatar-pixel-1', name: 'Pixel Hero', url: 'https://api.dicebear.com/7.x/pixel-art/png?seed=PixelHero&backgroundColor=ffdfbf' },
  { id: 'avatar-pixel-2', name: 'Retro Gamer', url: 'https://api.dicebear.com/7.x/pixel-art/png?seed=RetroGamer&backgroundColor=b6e3f4' },
  { id: 'avatar-bot-1', name: 'Cyber Bot', url: 'https://api.dicebear.com/7.x/bottts/png?seed=CyberBot&backgroundColor=c0aede' },
  { id: 'avatar-bot-2', name: 'Mecha Unit', url: 'https://api.dicebear.com/7.x/bottts/png?seed=MechaUnit&backgroundColor=b6e3f4' },
  { id: 'avatar-emoji-1', name: 'Cool Face', url: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=CoolFace&backgroundColor=ffdfbf' }
];

export function getAvatarOption(id?: string): DefaultAvatar {
  return AVATAR_OPTIONS.find(a => a.id === id) || AVATAR_OPTIONS[0];
}

interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (name: string, avatarUrl: string) => Promise<void>;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  updateProfile: async () => {},
  loading: true,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('id, name, avatarUrl').eq('id', user.id).single()
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        });
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (name: string, avatarUrl: string) => {
    if (!user) return;
    const newProfile = { id: user.id, name, avatarUrl };
    await supabase.from('profiles').upsert(newProfile);
    setProfile(newProfile);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, loading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
