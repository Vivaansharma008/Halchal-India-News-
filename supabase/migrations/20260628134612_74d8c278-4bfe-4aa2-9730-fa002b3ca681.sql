
-- Drop existing storage policies on news-images that depend on has_role
DROP POLICY IF EXISTS "Admin can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update news images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete news images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view news images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read news images" ON storage.objects;

-- Recreate without calling has_role (which had EXECUTE revoked from authenticated)
CREATE POLICY "news_images_admin_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'news-images' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "news_images_admin_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'news-images' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  bucket_id = 'news-images' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "news_images_admin_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'news-images' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "news_images_public_select" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'news-images');

-- Also fix table policies on news/ads which use has_role() — replace with inline EXISTS check
-- News table
DROP POLICY IF EXISTS "admins can insert news" ON public.news;
DROP POLICY IF EXISTS "admins can update news" ON public.news;
DROP POLICY IF EXISTS "admins can delete news" ON public.news;
DROP POLICY IF EXISTS "admins can read all news" ON public.news;

CREATE POLICY "admins can insert news" ON public.news
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can update news" ON public.news
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can delete news" ON public.news
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can read all news" ON public.news
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Ads table
DROP POLICY IF EXISTS "admins can insert ads" ON public.ads;
DROP POLICY IF EXISTS "admins can update ads" ON public.ads;
DROP POLICY IF EXISTS "admins can delete ads" ON public.ads;
DROP POLICY IF EXISTS "admins can read all ads" ON public.ads;

CREATE POLICY "admins can insert ads" ON public.ads
FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can update ads" ON public.ads
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can delete ads" ON public.ads
FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "admins can read all ads" ON public.ads
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
