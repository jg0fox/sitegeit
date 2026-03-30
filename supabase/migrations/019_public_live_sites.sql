-- Allow public (unauthenticated) reads for live generated sites
-- Needed for: middleware custom domain routing, public site rendering
create policy "Public can view live sites"
  on public.generated_sites for select
  using (deploy_status = 'live');
