-- Storage INSERT ポリシーを更新: 自分のUID配下のパスにのみアップロード可
DROP POLICY IF EXISTS "Auth upload review images" ON storage.objects;

CREATE POLICY "Auth upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
