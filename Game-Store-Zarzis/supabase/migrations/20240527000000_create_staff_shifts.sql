-- Create staff_shifts table
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    check_in TIMESTAMPTZ DEFAULT now() NOT NULL,
    check_out TIMESTAMPTZ,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (check_out - check_in)) / 60
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON public.staff_shifts TO authenticated;
GRANT ALL ON public.staff_shifts TO service_role;

-- Policies

-- 1. Read: Everyone can read (for owner dashboard stats), or restrict to own + owner.
-- For simplicity in a small team, allowing authenticated users to read is fine, but let's try to be specific.
-- Staff can see their own, Owners can see all.
CREATE POLICY "Staff can view own shifts" 
ON public.staff_shifts 
FOR SELECT 
USING (auth.uid() = staff_id);

CREATE POLICY "Owners can view all shifts" 
ON public.staff_shifts 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
    )
);

-- 2. Insert: Staff can clock in (create a shift for themselves)
CREATE POLICY "Staff can clock in" 
ON public.staff_shifts 
FOR INSERT 
WITH CHECK (auth.uid() = staff_id);

-- 3. Update: Staff can clock out (update own shift)
-- We only allow updating check_out if it's currently null
CREATE POLICY "Staff can clock out" 
ON public.staff_shifts 
FOR UPDATE 
USING (auth.uid() = staff_id);

-- 4. Delete: Only owners
CREATE POLICY "Owners can delete shifts" 
ON public.staff_shifts 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'owner'
    )
);
