-- 店舗到着時刻（例: 11:30）と並び時間（分）を reviews に追加
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS arrived_at  time    NULL,
  ADD COLUMN IF NOT EXISTS wait_minutes integer NULL CHECK (wait_minutes >= 0);
