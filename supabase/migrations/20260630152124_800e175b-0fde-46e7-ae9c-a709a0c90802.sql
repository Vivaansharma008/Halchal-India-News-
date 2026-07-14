
CREATE TABLE IF NOT EXISTS public.slug_redirects (
  old_slug TEXT PRIMARY KEY,
  new_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS slug_redirects_new_slug_idx ON public.slug_redirects(new_slug);

GRANT SELECT ON public.slug_redirects TO anon, authenticated;
GRANT ALL ON public.slug_redirects TO service_role;

ALTER TABLE public.slug_redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "slug_redirects_public_read" ON public.slug_redirects;
CREATE POLICY "slug_redirects_public_read"
  ON public.slug_redirects FOR SELECT
  TO anon, authenticated
  USING (true);
