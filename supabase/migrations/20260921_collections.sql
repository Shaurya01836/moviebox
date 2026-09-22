-- Migration for Collections feature

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own collections" 
  ON public.collections 
  FOR ALL 
  USING (auth.uid()::text = user_id) 
  WITH CHECK (auth.uid()::text = user_id);

-- Migration for Collection Items (mapping titles to collections)
CREATE TABLE IF NOT EXISTS public.collection_items (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, media_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_items_user_id ON public.collection_items(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_media_id ON public.collection_items(media_id);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own collection items" 
  ON public.collection_items 
  FOR ALL 
  USING (auth.uid()::text = user_id) 
  WITH CHECK (auth.uid()::text = user_id);
