-- Auto-update updated_at timestamps and user creation on signup

-- ============================================================
-- updated_at trigger function
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables that have the column
create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.businesses
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.generated_sites
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.landing_pages
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.outreach_emails
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.sending_domains
  for each row execute function public.handle_updated_at();

-- ============================================================
-- Auto-create user profile on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
