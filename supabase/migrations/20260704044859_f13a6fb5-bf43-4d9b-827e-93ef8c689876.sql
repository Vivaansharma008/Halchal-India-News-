GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.app_role TO anon, authenticated, service_role;

-- Ensure storage policies for news-images bucket exist for admins
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can upload news images') THEN
    CREATE POLICY "Admins can upload news images" ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can update news images') THEN
    CREATE POLICY "Admins can update news images" ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins can delete news images') THEN
    CREATE POLICY "Admins can delete news images" ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'news-images' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Anyone can read news images') THEN
    CREATE POLICY "Anyone can read news images" ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id = 'news-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Anyone can read video uploads') THEN
    CREATE POLICY "Anyone can read video uploads" ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id = 'video-uploads');
  END IF;
END $$;