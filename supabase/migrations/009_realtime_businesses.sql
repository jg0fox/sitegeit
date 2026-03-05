-- Ensure businesses table is included in the realtime publication
-- so pipeline status changes push to connected clients automatically.
-- This is a no-op if already configured.
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;
