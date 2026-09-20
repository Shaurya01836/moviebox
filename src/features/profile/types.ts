export interface UserProfile {
  id: string;
  userId?: string;
  name: string;
  avatarUrl: string; // avatar_id, e.g. 'avatar-1'
  profileSetupCompleted?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DefaultAvatar {
  id: string;
  name: string;
  style: string; // e.g. Lorelei, Notionists, Adventurer, Open Peeps, Pixel Art, Bottts, Fun Emoji
  url: string;
  bg: string;
  iconColor: string;
  isActive: boolean;
  sortOrder: number;
}

export const AVATAR_OPTIONS: DefaultAvatar[] = [
  // Lorelei — polished illustrated people
  { id: 'avatar-lorelei-1', name: 'Sophia', style: 'Lorelei', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sophia&backgroundColor=b6e3f4', bg: 'bg-sky-500/20', iconColor: 'text-sky-300', isActive: true, sortOrder: 1 },
  { id: 'avatar-lorelei-2', name: 'Alexander', style: 'Lorelei', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alexander&backgroundColor=c0aede', bg: 'bg-purple-500/20', iconColor: 'text-purple-300', isActive: true, sortOrder: 2 },
  { id: 'avatar-lorelei-3', name: 'Maya', style: 'Lorelei', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Maya&backgroundColor=ffd5dc', bg: 'bg-rose-500/20', iconColor: 'text-rose-300', isActive: true, sortOrder: 3 },

  // Notionists — modern/product-app style
  { id: 'avatar-notion-1', name: 'Julian', style: 'Notionists', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Julian&backgroundColor=ffdfbf', bg: 'bg-amber-500/20', iconColor: 'text-amber-300', isActive: true, sortOrder: 4 },
  { id: 'avatar-notion-2', name: 'Elena', style: 'Notionists', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena&backgroundColor=d1d4f9', bg: 'bg-indigo-500/20', iconColor: 'text-indigo-300', isActive: true, sortOrder: 5 },
  { id: 'avatar-notion-3', name: 'Marcus', style: 'Notionists', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus&backgroundColor=c0aede', bg: 'bg-violet-500/20', iconColor: 'text-violet-300', isActive: true, sortOrder: 6 },

  // Adventurer — colorful cartoon people
  { id: 'avatar-adv-1', name: 'Leo', style: 'Adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=b6e3f4', bg: 'bg-cyan-500/20', iconColor: 'text-cyan-300', isActive: true, sortOrder: 7 },
  { id: 'avatar-adv-2', name: 'Aria', style: 'Adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=ffdfbf', bg: 'bg-orange-500/20', iconColor: 'text-orange-300', isActive: true, sortOrder: 8 },
  { id: 'avatar-adv-3', name: 'Zack', style: 'Adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zack&backgroundColor=c0aede', bg: 'bg-purple-500/20', iconColor: 'text-purple-300', isActive: true, sortOrder: 9 },

  // Open Peeps — hand-drawn characters
  { id: 'avatar-peeps-1', name: 'Chloe', style: 'Open Peeps', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Chloe&backgroundColor=d1d4f9', bg: 'bg-blue-500/20', iconColor: 'text-blue-300', isActive: true, sortOrder: 10 },
  { id: 'avatar-peeps-2', name: 'Ethan', style: 'Open Peeps', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Ethan&backgroundColor=b6e3f4', bg: 'bg-teal-500/20', iconColor: 'text-teal-300', isActive: true, sortOrder: 11 },

  // Pixel Art — gaming-style
  { id: 'avatar-pixel-1', name: 'Pixel Hero', style: 'Pixel Art', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelHero&backgroundColor=ffdfbf', bg: 'bg-amber-500/20', iconColor: 'text-amber-300', isActive: true, sortOrder: 12 },
  { id: 'avatar-pixel-2', name: 'Retro Gamer', style: 'Pixel Art', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroGamer&backgroundColor=b6e3f4', bg: 'bg-emerald-500/20', iconColor: 'text-emerald-300', isActive: true, sortOrder: 13 },

  // Bottts — robots
  { id: 'avatar-bot-1', name: 'Cyber Bot', style: 'Bottts', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBot&backgroundColor=c0aede', bg: 'bg-fuchsia-500/20', iconColor: 'text-fuchsia-300', isActive: true, sortOrder: 14 },
  { id: 'avatar-bot-2', name: 'Mecha Unit', style: 'Bottts', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MechaUnit&backgroundColor=b6e3f4', bg: 'bg-sky-500/20', iconColor: 'text-sky-300', isActive: true, sortOrder: 15 },

  // Fun Emoji — playful profiles
  { id: 'avatar-emoji-1', name: 'Cool Face', style: 'Fun Emoji', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=CoolFace&backgroundColor=ffdfbf', bg: 'bg-yellow-500/20', iconColor: 'text-yellow-300', isActive: true, sortOrder: 16 },
  { id: 'avatar-emoji-2', name: 'Party Spark', style: 'Fun Emoji', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=PartySpark&backgroundColor=ffd5dc', bg: 'bg-pink-500/20', iconColor: 'text-pink-300', isActive: true, sortOrder: 17 },
];

export function getAvatarOption(avatarIdOrUrl?: string): DefaultAvatar {
  if (!avatarIdOrUrl) return AVATAR_OPTIONS[0];
  
  // If it's a direct URL string
  if (avatarIdOrUrl.startsWith('http://') || avatarIdOrUrl.startsWith('https://')) {
    return {
      id: 'custom-url',
      name: 'Custom Profile',
      style: 'Custom',
      url: avatarIdOrUrl,
      bg: 'bg-red-600/20',
      iconColor: 'text-white',
      isActive: true,
      sortOrder: 99,
    };
  }

  const found = AVATAR_OPTIONS.find((a) => a.id === avatarIdOrUrl);
  return found || AVATAR_OPTIONS[0];
}
