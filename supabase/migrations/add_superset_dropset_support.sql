-- Add support for supersets, tri-sets, and drop-sets
-- This allows users to group exercises into blocks and track rounds

-- Create block table
create table if not exists block (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references workout_session(id) on delete cascade not null,
  block_type text not null check (block_type in ('superset', 'triset', 'giant', 'drop')),
  rounds int not null default 1 check (rounds > 0),
  rest_between_rounds int default 60, -- in seconds
  position int not null default 0, -- order within session
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add block-related columns to set_entry
alter table set_entry
  add column if not exists block_id uuid references block(id) on delete cascade,
  add column if not exists round_index int,
  add column if not exists is_drop_step boolean default false,
  add column if not exists drop_order int;

-- Add index for better query performance
create index if not exists idx_set_entry_block_id on set_entry(block_id);
create index if not exists idx_block_session_id on block(session_id);

-- Add RLS policies for block table
alter table block enable row level security;

-- Users can view their own blocks
create policy "Users can view own blocks"
  on block for select
  using (
    session_id in (
      select id from workout_session
      where user_id = auth.uid()
    )
  );

-- Users can insert their own blocks
create policy "Users can insert own blocks"
  on block for insert
  with check (
    session_id in (
      select id from workout_session
      where user_id = auth.uid()
    )
  );

-- Users can update their own blocks
create policy "Users can update own blocks"
  on block for update
  using (
    session_id in (
      select id from workout_session
      where user_id = auth.uid()
    )
  );

-- Users can delete their own blocks
create policy "Users can delete own blocks"
  on block for delete
  using (
    session_id in (
      select id from workout_session
      where user_id = auth.uid()
    )
  );

-- Add comment documentation
comment on table block is 'Represents exercise blocks (supersets, tri-sets, drop-sets) within workout sessions';
comment on column block.block_type is 'Type of block: superset (2 exercises), triset (3 exercises), giant (4+ exercises), or drop (single exercise with weight drops)';
comment on column block.rounds is 'Number of rounds to complete for this block';
comment on column block.rest_between_rounds is 'Rest time in seconds between each round';
comment on column block.position is 'Position of this block within the workout session';
comment on column set_entry.block_id is 'Reference to block if this set is part of a superset/drop-set';
comment on column set_entry.round_index is 'Which round this set belongs to (1-indexed)';
comment on column set_entry.is_drop_step is 'True if this is a drop step in a drop set';
comment on column set_entry.drop_order is 'Order of the drop (1 = first drop, 2 = second drop, etc.)';

