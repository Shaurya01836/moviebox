-- Migration for Personal Entertainment Data (Moods & Favorite Cast)

-- Update user_rating to support decimal precision (0.0 to 10.0)
-- If it's currently an integer, this will convert it to a numeric type.
ALTER TABLE public.watchlist ALTER COLUMN user_rating TYPE NUMERIC(4, 1);

-- Personal Moods Table
CREATE TABLE IF NOT EXISTS public.personal_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id, mood)
);

CREATE INDEX IF NOT EXISTS idx_personal_moods_user_media ON public.personal_moods(user_id, media_id);

ALTER TABLE public.personal_moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own moods" 
  ON public.personal_moods 
  FOR ALL 
  USING (auth.uid()::text = user_id);


-- Favorite Persons (Actors and Characters) Table
CREATE TABLE IF NOT EXISTS public.favorite_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  person_id TEXT NOT NULL, -- TMDB ID
  person_name TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('actor', 'character')),
  profile_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id, person_id, role_type)
);

CREATE INDEX IF NOT EXISTS idx_favorite_persons_user_media ON public.favorite_persons(user_id, media_id);

ALTER TABLE public.favorite_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorite persons" 
  ON public.favorite_persons 
  FOR ALL 
  USING (auth.uid()::text = user_id);
