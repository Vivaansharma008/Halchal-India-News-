
-- Add view_count column to news
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_news_view_count ON public.news(view_count DESC);

-- Table for per-visitor dedup (24h)
CREATE TABLE IF NOT EXISTS public.news_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  visitor_hash text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_views_dedup ON public.news_views(news_id, visitor_hash, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_views_viewed_at ON public.news_views(viewed_at DESC);

GRANT SELECT, INSERT ON public.news_views TO authenticated;
GRANT ALL ON public.news_views TO service_role;

ALTER TABLE public.news_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read views"
ON public.news_views FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RPC: record a view with 24h dedup. SECURITY DEFINER so anon can call it via service-side wrapper.
CREATE OR REPLACE FUNCTION public.record_news_view(_news_id uuid, _visitor_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.news_views
    WHERE news_id = _news_id
      AND visitor_hash = _visitor_hash
      AND viewed_at > now() - interval '24 hours'
  ) INTO recent_exists;

  IF recent_exists THEN
    RETURN false;
  END IF;

  INSERT INTO public.news_views (news_id, visitor_hash) VALUES (_news_id, _visitor_hash);
  UPDATE public.news SET view_count = view_count + 1 WHERE id = _news_id;
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_news_view(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_news_view(uuid, text) TO service_role;
