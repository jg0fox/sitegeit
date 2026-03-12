-- Notification preferences per user per event type
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  event_type text not null,
  enabled boolean default true,
  delivery_method text default 'push' check (delivery_method in ('push', 'email', 'both')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, event_type)
);

create index idx_notification_preferences_user_id on public.notification_preferences(user_id);

-- RLS
alter table public.notification_preferences enable row level security;

create policy "Users can view own notification preferences"
  on public.notification_preferences for select
  using (user_id = auth.uid());

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (user_id = auth.uid());

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (user_id = auth.uid());

-- Daily digest settings on users table
alter table public.users
  add column if not exists daily_digest_enabled boolean default false,
  add column if not exists daily_digest_time time default '18:00';
