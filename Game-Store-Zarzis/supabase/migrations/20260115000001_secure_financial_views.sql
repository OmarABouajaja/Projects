-- Secure Financial Views
-- This migration attempts to secure the views shown in the screenshot.
-- If the view name differs slightly, please adjust the name below.

DO $$
BEGIN
  -- 1. Yearly Financial Summary
  IF EXISTS (SELECT FROM pg_views WHERE viewname = 'yearly_financial_summary') THEN
    ALTER VIEW yearly_financial_summary SET (security_invoker = true);
    REVOKE ALL ON yearly_financial_summary FROM anon;
    REVOKE ALL ON yearly_financial_summary FROM public;
    GRANT SELECT ON yearly_financial_summary TO authenticated;
  END IF;

  -- 2. Monthly Financial Summary (Precautionary)
  IF EXISTS (SELECT FROM pg_views WHERE viewname = 'monthly_financial_summary') THEN
    ALTER VIEW monthly_financial_summary SET (security_invoker = true);
    REVOKE ALL ON monthly_financial_summary FROM anon;
    REVOKE ALL ON monthly_financial_summary FROM public;
    GRANT SELECT ON monthly_financial_summary TO authenticated;
  END IF;

    -- 3. Daily Financial Summary (Precautionary)
  IF EXISTS (SELECT FROM pg_views WHERE viewname = 'daily_financial_summary') THEN
    ALTER VIEW daily_financial_summary SET (security_invoker = true);
    REVOKE ALL ON daily_financial_summary FROM anon;
    REVOKE ALL ON daily_financial_summary FROM public;
    GRANT SELECT ON daily_financial_summary TO authenticated;
  END IF;
END $$;
