-- users テーブルに削除ポリシーを追加（退会機能に必要）
create policy "Self delete" on public.users for delete using (auth.uid() = id);
