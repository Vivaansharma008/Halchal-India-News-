
CREATE POLICY "public can view news images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'news-images');

CREATE POLICY "admins can upload news images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can update news images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins can delete news images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));
