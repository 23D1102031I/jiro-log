-- follows テーブル
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Owner delete" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- reviews テーブルに食べた日カラム追加
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS eaten_at date;
