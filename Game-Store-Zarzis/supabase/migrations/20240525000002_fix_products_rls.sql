-- MASTER RLS FIX for Clients and Products

-- 1. Fix Clients Table
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."clients";

-- Create the SINGLE permissive policy for staff
CREATE POLICY "Enable all access for authenticated users" 
ON "public"."clients" 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 2. Fix Products Table
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."products";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."products";
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."products";
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."products";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."products";

-- Create the SINGLE permissive policy for staff
CREATE POLICY "Enable all access for authenticated users" 
ON "public"."products" 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Ensure Defaults (Optional but good for stability)
ALTER TABLE "public"."products" ALTER COLUMN "stock_quantity" SET DEFAULT 0;
ALTER TABLE "public"."products" ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE "public"."clients" ALTER COLUMN "points" SET DEFAULT 0;

