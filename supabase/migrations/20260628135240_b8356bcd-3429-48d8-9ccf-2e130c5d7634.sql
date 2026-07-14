DROP POLICY IF EXISTS "admins can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "admins can update news images" ON storage.objects;
DROP POLICY IF EXISTS "admins can delete news images" ON storage.objects;
DROP POLICY IF EXISTS "news_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "news_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "news_images_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "news_images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "public can view news images" ON storage.objects;

CREATE POLICY "news_images_public_read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'news-images');

CREATE POLICY "news_images_admin_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'news-images'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::public.app_role
  )
);

CREATE POLICY "news_images_admin_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'news-images'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::public.app_role
  )
)
WITH CHECK (
  bucket_id = 'news-images'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::public.app_role
  )
);

CREATE POLICY "news_images_admin_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'news-images'
  AND EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::public.app_role
  )
);