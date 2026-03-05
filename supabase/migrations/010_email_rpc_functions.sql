-- RPC functions for atomic counter increments
-- Used by email webhook handler and send worker

-- Increment open count on outreach_emails
create or replace function public.increment_open_count(email_id uuid)
returns void as $$
begin
  update public.outreach_emails
  set open_count = open_count + 1,
      opened_at = coalesce(opened_at, now())
  where id = email_id;
end;
$$ language plpgsql security definer;

-- Increment click count on outreach_emails
create or replace function public.increment_click_count(email_id uuid)
returns void as $$
begin
  update public.outreach_emails
  set click_count = click_count + 1,
      clicked_at = coalesce(clicked_at, now())
  where id = email_id;
end;
$$ language plpgsql security definer;

-- Increment emails_sent_today on sending_domains
create or replace function public.increment_sent_today(domain_id uuid)
returns void as $$
begin
  update public.sending_domains
  set emails_sent_today = emails_sent_today + 1
  where id = domain_id;
end;
$$ language plpgsql security definer;
