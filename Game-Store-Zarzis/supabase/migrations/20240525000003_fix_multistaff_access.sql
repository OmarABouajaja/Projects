-- COMPREHENSIVE MULTI-STAFF ACCESS FIX
-- This script ensures ALL authenticated staff can access ALL relevant data

-- ============================================
-- 1. FIX PROFILES TABLE (Staff can see each other)
-- ============================================
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_select_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_insert_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "profiles_update_policy" ON "public"."profiles";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."profiles";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."profiles";

-- Create PERMISSIVE policies for all authenticated staff
CREATE POLICY "profiles_select_all" ON "public"."profiles" FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_all" ON "public"."profiles" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_update_all" ON "public"."profiles" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 2. FIX STAFF_SHIFTS TABLE (Staff can view all shifts)
-- ============================================
ALTER TABLE "public"."staff_shifts" ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing restrictive policies
DROP POLICY IF EXISTS "Staff can insert their own shifts" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "Staff can update their own shifts" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "staff_shifts_select_policy" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "staff_shifts_insert_policy" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "staff_shifts_update_policy" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."staff_shifts";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."staff_shifts";

-- Create PERMISSIVE policies
CREATE POLICY "staff_shifts_select_all" ON "public"."staff_shifts" FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_shifts_insert_all" ON "public"."staff_shifts" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_shifts_update_all" ON "public"."staff_shifts" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 3. FIX USER_ROLES TABLE (Staff can verify roles)
-- ============================================
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."user_roles";
DROP POLICY IF EXISTS "user_roles_select_policy" ON "public"."user_roles";

CREATE POLICY "user_roles_select_all" ON "public"."user_roles" FOR SELECT TO authenticated USING (true);

-- ============================================
-- 4. FIX GAMING_SESSIONS TABLE
-- ============================================
ALTER TABLE "public"."gaming_sessions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."gaming_sessions";

CREATE POLICY "gaming_sessions_all" ON "public"."gaming_sessions" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 5. FIX CONSOLES TABLE
-- ============================================
ALTER TABLE "public"."consoles" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."consoles";

CREATE POLICY "consoles_all" ON "public"."consoles" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 6. FIX PRICING TABLE
-- ============================================
ALTER TABLE "public"."pricing" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."pricing";

CREATE POLICY "pricing_all" ON "public"."pricing" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 7. FIX STORE_SETTINGS TABLE
-- ============================================
ALTER TABLE "public"."store_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."store_settings";

CREATE POLICY "store_settings_all" ON "public"."store_settings" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 8. FIX SALES TABLE
-- ============================================
ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."sales";

CREATE POLICY "sales_all" ON "public"."sales" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 9. FIX POINTS_TRANSACTIONS TABLE
-- ============================================
ALTER TABLE "public"."points_transactions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."points_transactions";

CREATE POLICY "points_transactions_all" ON "public"."points_transactions" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- 10. FIX EXPENSES TABLE
-- ============================================
ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."expenses";

CREATE POLICY "expenses_all" ON "public"."expenses" FOR ALL TO authenticated USING (true) WITH CHECK (true);
