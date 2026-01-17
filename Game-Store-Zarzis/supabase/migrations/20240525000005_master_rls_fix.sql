-- MASTER FIX V2: "Bulletproof" RLS Reset
-- Wraps operations in DO blocks to prevent "already exists" errors.
-- Run this in Supabase SQL Editor.

-- ============================================
-- 1. PROFILES
-- ============================================
DO $$ 
BEGIN
    -- Enable RLS
    ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
    
    -- Add Column safely
    BEGIN
        ALTER TABLE "public"."profiles" ADD COLUMN "last_active_at" TIMESTAMPTZ;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    -- Drop old restrictive policies
    DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
    DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
    DROP POLICY IF EXISTS "profiles_select_policy" ON "public"."profiles";
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."profiles";
    
    -- Drop our own target policy to ensure clean slate
    DROP POLICY IF EXISTS "profiles_all" ON "public"."profiles";
    
    -- Create new permissive policy
    CREATE POLICY "profiles_all" ON "public"."profiles" FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;


-- ============================================
-- 2. STAFF_SHIFTS (Attendance)
-- ============================================
DO $$ 
BEGIN
    ALTER TABLE "public"."staff_shifts" ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Staff can insert their own shifts" ON "public"."staff_shifts";
    DROP POLICY IF EXISTS "Staff can update their own shifts" ON "public"."staff_shifts";
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."staff_shifts";
    DROP POLICY IF EXISTS "staff_shifts_all" ON "public"."staff_shifts";
    
    CREATE POLICY "staff_shifts_all" ON "public"."staff_shifts" FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;


-- ============================================
-- 3. USER_ROLES
-- ============================================
DO $$ 
BEGIN
    ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "user_roles_select_all" ON "public"."user_roles";
    DROP POLICY IF EXISTS "user_roles_select_policy" ON "public"."user_roles";
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."user_roles";
    DROP POLICY IF EXISTS "user_roles_all" ON "public"."user_roles";
    
    CREATE POLICY "user_roles_all" ON "public"."user_roles" FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;


-- ============================================
-- 4. CLIENTS
-- ============================================
DO $$ 
BEGIN
    ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."clients";
    DROP POLICY IF EXISTS "clients_all" ON "public"."clients";
    CREATE POLICY "clients_all" ON "public"."clients" FOR ALL TO authenticated USING (true) WITH CHECK (true);
    
    -- Defaults
    ALTER TABLE "public"."clients" ALTER COLUMN "points" SET DEFAULT 0;
    ALTER TABLE "public"."clients" ALTER COLUMN "total_spent" SET DEFAULT 0;
END $$;


-- ============================================
-- 5. OTHER CORE TABLES
-- ============================================
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY[
        'products', 
        'gaming_sessions', 
        'consoles', 
        'pricing', 
        'sales', 
        'points_transactions', 
        'expenses', 
        'store_settings'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE "public"."%I" ENABLE ROW LEVEL SECURITY', t);
        
        -- Drop potential old policies
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "public"."%I"', t);
        EXECUTE format('DROP POLICY IF EXISTS "%I_all" ON "public"."%I"', t, t);
        
        -- Create new permissive policy
        EXECUTE format('CREATE POLICY "%I_all" ON "public"."%I" FOR ALL TO authenticated USING (true) WITH CHECK (true)', t, t);
    END LOOP;
END $$;

-- Defaults for Products
ALTER TABLE "public"."products" ALTER COLUMN "stock_quantity" SET DEFAULT 0;
ALTER TABLE "public"."products" ALTER COLUMN "is_active" SET DEFAULT true;
