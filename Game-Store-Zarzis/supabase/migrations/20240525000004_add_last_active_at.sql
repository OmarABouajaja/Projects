-- Add last_active_at column for online/offline status tracking
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMPTZ;
