-- Enable RLS on clients table
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."clients";

-- Create comprehensive policies for authenticated staff
-- We assume any logged-in user (role 'authenticated') is staff and should face clients.

CREATE POLICY "Enable read access for authenticated users" 
ON "public"."clients" 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON "public"."clients" 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON "public"."clients" 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON "public"."clients" 
FOR DELETE 
TO authenticated 
USING (true);

-- Ensure created_at has a default if not already
ALTER TABLE "public"."clients" 
ALTER COLUMN "created_at" SET DEFAULT now();

-- Ensure points default to 0
ALTER TABLE "public"."clients" 
ALTER COLUMN "points" SET DEFAULT 0;

-- Ensure total_spent default to 0
ALTER TABLE "public"."clients" 
ALTER COLUMN "total_spent" SET DEFAULT 0;

-- Ensure total_games_played default to 0
ALTER TABLE "public"."clients" 
ALTER COLUMN "total_games_played" SET DEFAULT 0;
