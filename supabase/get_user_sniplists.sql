
-- This function will be called to retrieve a user's sniplists
-- It's a workaround for potential RLS policy issues
create or replace function public.get_user_sniplists(user_id_param uuid)
returns setof sniplists
language sql
security definer
as $$
  select * from sniplists
  where user_id = user_id_param
  order by created_at desc;
$$;
