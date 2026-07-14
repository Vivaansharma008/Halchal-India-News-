
CREATE TYPE public.video_source AS ENUM ('youtube', 'upload');
CREATE TYPE public.video_category AS ENUM ('politics','india','world','sports','entertainment','technology','business','health');

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category public.video_category NOT NULL DEFAULT 'india',
  source public.video_source NOT NULL,
  youtube_url text,
  youtube_id text,
  video_url text,
  thumbnail_url text,
  duration text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX videos_published_idx ON public.videos (is_published, published_at DESC);
CREATE INDEX videos_featured_idx ON public.videos (is_featured, published_at DESC);
CREATE INDEX videos_category_idx ON public.videos (category, published_at DESC);

GRANT SELECT ON public.videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published videos"
  ON public.videos FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert videos"
  ON public.videos FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update videos"
  ON public.videos FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete videos"
  ON public.videos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for video-uploads (private bucket; access via signed URLs)
CREATE POLICY "Public can read video uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'video-uploads');

CREATE POLICY "Admins can upload videos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'video-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update video uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'video-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete video uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'video-uploads' AND public.has_role(auth.uid(), 'admin'));
