-- Security Migration: Enable Row Level Security (RLS) on public.watchlist and public.profiles

-- 1. PROFILES TABLE RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can manage their own profiles'
  ) THEN
    CREATE POLICY "Users can manage their own profiles" 
      ON public.profiles 
      FOR ALL 
      USING (auth.uid()::text = user_id)
      WITH CHECK (auth.uid()::text = user_id);
  END IF;
END $$;


-- 2. WATCHLIST TABLE RLS
ALTER TABLE IF EXISTS public.watchlist ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'watchlist' AND policyname = 'Users can manage their own watchlist'
  ) THEN
    CREATE POLICY "Users can manage their own watchlist" 
      ON public.watchlist 
      FOR ALL 
      USING (auth.uid()::text = user_id)
      WITH CHECK (auth.uid()::text = user_id);
  END IF;
END $$;
