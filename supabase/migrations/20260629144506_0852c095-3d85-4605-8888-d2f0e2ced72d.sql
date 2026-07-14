ALTER TABLE public.news ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS author_name text;
CREATE UNIQUE INDEX IF NOT EXISTS news_source_id_uidx ON public.news (source_id) WHERE source_id IS NOT NULL;