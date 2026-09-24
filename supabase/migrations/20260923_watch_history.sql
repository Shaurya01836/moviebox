-- Migration for Watch History System

-- 1. WATCH HISTORY
-- Represents the summary state of a unique title per user
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  media_kind TEXT NOT NULL CHECK (media_kind IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  season_number INTEGER,
  episode_number INTEGER,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  watch_count INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: A user has exactly ONE history record per unique media (Movie or TV Episode)
  UNIQUE(user_id, media_id, season_number, episode_number)
);

CREATE INDEX IF NOT EXISTS idx_watch_history_user_updated ON public.watch_history(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_media ON public.watch_history(media_id);

ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watch history" 
  ON public.watch_history 
  FOR ALL 
  USING (auth.uid()::text = user_id);

-- 2. WATCH SESSIONS
-- Append-only log of individual viewing sessions for Analytics
CREATE TABLE IF NOT EXISTS public.watch_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  media_id TEXT NOT NULL,
  media_kind TEXT NOT NULL,
  season_number INTEGER,
  episode_number INTEGER,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watch_sessions_user_started ON public.watch_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_sessions_media ON public.watch_sessions(media_id);

ALTER TABLE public.watch_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watch sessions" 
  ON public.watch_sessions 
  FOR ALL 
  USING (auth.uid()::text = user_id);
