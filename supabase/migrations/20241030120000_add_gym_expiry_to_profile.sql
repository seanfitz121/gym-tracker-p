-- Add gym membership expiry date to profile
-- This allows users to track when their gym membership expires

alter table public.profile
add column if not exists gym_expiry_date date;

comment on column public.profile.gym_expiry_date is 'Date when users gym membership expires';

