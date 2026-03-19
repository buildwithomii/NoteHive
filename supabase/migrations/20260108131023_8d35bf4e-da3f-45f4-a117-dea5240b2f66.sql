-- Drop the existing view and recreate with SECURITY INVOKER (safe option)
DROP VIEW IF EXISTS public.notes_with_stats;

CREATE VIEW public.notes_with_stats 
WITH (security_invoker = true)
AS
SELECT 
  n.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(DISTINCT r.id) as rating_count,
  p.display_name as uploader_name
FROM public.notes n
LEFT JOIN public.ratings r ON n.id = r.note_id
LEFT JOIN public.profiles p ON n.user_id = p.user_id
GROUP BY n.id, p.display_name;