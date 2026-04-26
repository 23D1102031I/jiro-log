-- 店舗メニューテーブル（ログインユーザーがwiki的に編集可）
CREATE TABLE public.store_menus (
  store_id   uuid REFERENCES public.stores(id) ON DELETE CASCADE PRIMARY KEY,
  ramen      jsonb NOT NULL DEFAULT '[]',
  toppings   jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

ALTER TABLE public.store_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"  ON public.store_menus FOR SELECT USING (true);
CREATE POLICY "Auth insert"  ON public.store_menus FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth update"  ON public.store_menus FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
