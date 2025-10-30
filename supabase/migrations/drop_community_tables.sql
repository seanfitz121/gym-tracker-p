-- Drop Community Tables (run this FIRST before re-running the main migration)
-- This is needed because we changed the foreign keys

-- Drop tables in reverse order (due to dependencies)
drop table if exists public.user_post_limit cascade;
drop table if exists public.community_report cascade;
drop table if exists public.post_view cascade;
drop table if exists public.reaction cascade;
drop table if exists public.comment cascade;
drop table if exists public.post cascade;
drop table if exists public.community_category cascade;

-- Drop functions
drop function if exists public.update_post_view_count() cascade;
drop function if exists public.reset_daily_post_limits() cascade;
drop function if exists public.can_user_post(uuid) cascade;
drop function if exists public.increment_user_post_count(uuid) cascade;

