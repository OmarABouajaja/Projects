-- MASTER FIX: All RLS Policies for Multi-Staff + Attendance + Client Access
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. PROFILES (Online status + visibility)
-- ============================================
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "last_active_at" TIMESTAMPTZ;

DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_select_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_select_all" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_insert_all" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_update_all" ON "public"."profiles";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."profiles";

CREATE POLICY "profiles_all" ON "public"."profiles" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 2. STAFF_SHIFTS (Attendance - CRITICAL)
-- ============================================
ALTER TABLE "public"."staff_shifts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can insert their own shifts" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "Staff can update their own shifts" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "staff_shifts_select_policy" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "staff_shifts_select_all" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "staff_shifts_insert_all" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "staff_shifts_update_all" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."staff_shifts";

CREATE POLICY "staff_shifts_all" ON "public"."staff_shifts" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 3. USER_ROLES
-- ============================================
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_all" ON "public"."user_roles";
DROP POLICY IF EXISTS "user_roles_select_policy" ON "public"."user_roles";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."user_roles";

CREATE POLICY "user_roles_all" ON "public"."user_roles" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 4. CLIENTS
-- ============================================
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."clients";
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."clients";

CREATE POLICY "clients_all" ON "public"."clients" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 5. PRODUCTS
-- ============================================
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."products";
DROP POLICY IF EXISTS "products_all" ON "public"."products";

CREATE POLICY "products_all" ON "public"."products" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 6. GAMING_SESSIONS
-- ============================================
ALTER TABLE "public"."gaming_sessions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."gaming_sessions";
DROP POLICY IF EXISTS "gaming_sessions_all" ON "public"."gaming_sessions";

CREATE POLICY "gaming_sessions_all" ON "public"."gaming_sessions" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 7. CONSOLES
-- ============================================
ALTER TABLE "public"."consoles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."consoles";
DROP POLICY IF EXISTS "consoles_all" ON "public"."consoles";

CREATE POLICY "consoles_all" ON "public"."consoles" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 8. PRICING
-- ============================================
ALTER TABLE "public"."pricing" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."pricing";
DROP POLICY IF EXISTS "pricing_all" ON "public"."pricing";

CREATE POLICY "pricing_all" ON "public"."pricing" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 9. SALES
-- ============================================
ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."sales";
DROP POLICY IF EXISTS "sales_all" ON "public"."sales";

CREATE POLICY "sales_all" ON "public"."sales" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 10. POINTS_TRANSACTIONS
-- ============================================
ALTER TABLE "public"."points_transactions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."points_transactions";
DROP POLICY IF EXISTS "points_transactions_all" ON "public"."points_transactions";

CREATE POLICY "points_transactions_all" ON "public"."points_transactions" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 11. EXPENSES
-- ============================================
ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."expenses";
DROP POLICY IF EXISTS "expenses_all" ON "public"."expenses";

CREATE POLICY "expenses_all" ON "public"."expenses" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 12. STORE_SETTINGS
-- ============================================
ALTER TABLE "public"."store_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."store_settings";
DROP POLICY IF EXISTS "store_settings_all" ON "public"."store_settings";

CREATE POLICY "store_settings_all" ON "public"."store_settings" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 13. SERVICE REQUESTS (if exists)
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_requests') THEN
    ALTER TABLE "public"."service_requests" ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "service_requests_all" ON "public"."service_requests";
    EXECUTE 'CREATE POLICY "service_requests_all" ON "public"."service_requests" FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- ============================================
-- DEFAULTS
-- ============================================
ALTER TABLE "public"."clients" ALTER COLUMN "points" SET DEFAULT 0;
ALTER TABLE "public"."clients" ALTER COLUMN "total_spent" SET DEFAULT 0;
ALTER TABLE "public"."products" ALTER COLUMN "stock_quantity" SET DEFAULT 0;
ALTER TABLE "public"."products" ALTER COLUMN "is_active" SET DEFAULT true;
