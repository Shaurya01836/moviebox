export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  role: 'user' | 'admin';
}
