-- Create a function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- If pg_cron is enabled in the project, we can schedule it:
-- SELECT cron.schedule('0 0 * * *', $$SELECT cleanup_expired_codes()$$);

-- But for now, just defining the function allows calling it via RPC or backend.
