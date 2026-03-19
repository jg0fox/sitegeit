-- Add booking_source to distinguish marketing bookings from client site bookings.
-- 'marketing' = booked via Simple Instant Site landing/booking page (operator's own)
-- 'client_site' = booked via a client's website booking page
ALTER TABLE bookings ADD COLUMN booking_source text NOT NULL DEFAULT 'marketing';
