-- Restrict auto-admin trigger to owner allowlist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.email IN ('papa@halchalbharat.com', 'sushilsharma@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Revoke admin from all users not in the owner allowlist
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
    SELECT id FROM auth.users
    WHERE email IN ('papa@halchalbharat.com', 'sushilsharma@gmail.com')
  );

-- Switch has_role to SECURITY INVOKER (user_roles RLS still allows a user to read own rows,
-- which is exactly what has_role(auth.uid(), ...) needs inside RLS policies).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- record_news_view is only invoked through the service-role admin client;
-- revoke direct execution from anon/authenticated to close the SECURITY DEFINER surface.
REVOKE EXECUTE ON FUNCTION public.record_news_view(uuid, text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_news_view(uuid, text) TO service_role;