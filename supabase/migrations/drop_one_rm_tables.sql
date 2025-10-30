-- Drop 1RM tables to allow recreation with correct types
drop view if exists public.one_rm_progress cascade;
drop trigger if exists trigger_auto_log_one_rm on public.set_entry;
drop function if exists public.auto_log_one_rm() cascade;
drop table if exists public.one_rm_goal cascade;
drop table if exists public.one_rm_lift cascade;

