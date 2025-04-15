
-- Create a custom function for searching profiles and sniplists
-- This will be called from the Edge Function
CREATE OR REPLACE FUNCTION public.search_profiles_and_sniplists(search_term TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- Profiles search
  SELECT 
    p.id, 
    COALESCE(p.username, '') AS title,
    'profile' AS type,
    p.created_at
  FROM profiles p
  WHERE p.is_public = true AND p.username ILIKE search_term
  
  UNION ALL
  
  -- Sniplists search
  SELECT 
    s.id,
    COALESCE(s.title, '') AS title,
    'sniplist' AS type,
    s.created_at
  FROM sniplists s
  JOIN profiles p ON s.user_id = p.id
  WHERE p.is_public = true AND s.title ILIKE search_term
  
  ORDER BY created_at DESC
  LIMIT 20;
$$;
