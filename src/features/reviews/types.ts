export interface Review {
  id: string;
  mediaId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1-10
  content: string;
  createdAt: string;
  likesCount: number;
}
