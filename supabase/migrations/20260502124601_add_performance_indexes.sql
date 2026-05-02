-- Performance indexes for reviews / likes / follows tables
-- NOTE: 本番適用時は CONCURRENTLY オプション必須 (DB ロック回避)
--       例: CREATE INDEX CONCURRENTLY IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);

CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews (created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_store_id_idx ON public.reviews (store_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_eaten_at_idx ON public.reviews (eaten_at DESC);
CREATE INDEX IF NOT EXISTS likes_review_id_idx ON public.likes (review_id);
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows (follower_id);

-- Rollback (手動ロールバック参照用):
-- DROP INDEX IF EXISTS reviews_created_at_idx;
-- DROP INDEX IF EXISTS reviews_store_id_idx;
-- DROP INDEX IF EXISTS reviews_user_id_idx;
-- DROP INDEX IF EXISTS reviews_eaten_at_idx;
-- DROP INDEX IF EXISTS likes_review_id_idx;
-- DROP INDEX IF EXISTS follows_follower_id_idx;
