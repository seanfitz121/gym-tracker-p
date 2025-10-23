-- Create announcements table
create table public.announcement (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.announcement enable row level security;

-- Policies
create policy "All authenticated users can view announcements"
  on public.announcement for select
  to authenticated
  using (true);

create policy "Only admins can insert announcements"
  on public.announcement for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy "Only admins can delete announcements"
  on public.announcement for delete
  to authenticated
  using (
    exists (
      select 1 from public.admin_user
      where admin_user.user_id = auth.uid()
    )
  );

-- Create index for faster queries
create index if not exists idx_announcement_created_at 
  on public.announcement(created_at desc);


