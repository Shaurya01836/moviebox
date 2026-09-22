export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItem {
  collectionId: string;
  mediaId: string;
  userId: string;
  addedAt: string;
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}
