-- Recovery SQL: Profiles & Staff Shifts
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create staff_shifts Table if missing
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    check_in TIMESTAMPTZ DEFAULT NOW(),
    check_out TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fix Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL DEFAULT 'Staff Member',
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ensure Foreign Key for staff_shifts
-- Note: Linking to auth.users is standard for staff_id tracking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_shifts_staff_id_fkey') THEN
        ALTER TABLE public.staff_shifts 
        ADD CONSTRAINT staff_shifts_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

-- 5. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Staff Shifts Policies (Attendance)
DROP POLICY IF EXISTS "Staff can insert their own shifts" ON public.staff_shifts;
CREATE POLICY "Staff can insert their own shifts" ON public.staff_shifts FOR INSERT WITH CHECK (auth.uid() = staff_id);

DROP POLICY IF EXISTS "Staff can update their own shifts" ON public.staff_shifts;
CREATE POLICY "Staff can update their own shifts" ON public.staff_shifts FOR UPDATE USING (auth.uid() = staff_id);

DROP POLICY IF EXISTS "Staff shifts are viewable by everyone" ON public.staff_shifts;
CREATE POLICY "Staff shifts are viewable by everyone" ON public.staff_shifts FOR SELECT USING (true);

-- 7. Backfill Profiles from Auth.Users
-- This ensures existing staff members get their email synced even if they haven't logged in yet
INSERT INTO public.profiles (id, email, full_name, last_sign_in_at, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Staff Member'),
    last_sign_in_at,
    created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET 
    email = EXCLUDED.email,
    last_sign_in_at = COALESCE(profiles.last_sign_in_at, EXCLUDED.last_sign_in_at),
    full_name = CASE 
        WHEN profiles.full_name = 'Staff Member' THEN EXCLUDED.full_name 
        ELSE profiles.full_name 
    END;
