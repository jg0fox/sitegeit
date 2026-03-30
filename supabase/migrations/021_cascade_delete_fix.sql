-- Fix: activity_log and notifications missing ON DELETE CASCADE for business_id.
-- This prevents deleting businesses that have related activity or notification rows.

-- activity_log: drop old FK, add with cascade
alter table public.activity_log
  drop constraint if exists activity_log_business_id_fkey;

alter table public.activity_log
  add constraint activity_log_business_id_fkey
  foreign key (business_id) references public.businesses(id) on delete cascade;

-- notifications: drop old FK, add with cascade
alter table public.notifications
  drop constraint if exists notifications_business_id_fkey;

alter table public.notifications
  add constraint notifications_business_id_fkey
  foreign key (business_id) references public.businesses(id) on delete cascade;
