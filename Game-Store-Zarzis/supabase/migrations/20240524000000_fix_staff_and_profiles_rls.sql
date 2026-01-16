-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Staff Shifts Policies
DROP POLICY IF EXISTS "Staff can insert their own shifts" ON public.staff_shifts;
CREATE POLICY "Staff can insert their own shifts" 
ON public.staff_shifts FOR INSERT 
WITH CHECK (auth.uid() = staff_id);

DROP POLICY IF EXISTS "Staff can update their own shifts" ON public.staff_shifts;
CREATE POLICY "Staff can update their own shifts" 
ON public.staff_shifts FOR UPDATE 
USING (auth.uid() = staff_id);

DROP POLICY IF EXISTS "Staff shifts are viewable by everyone" ON public.staff_shifts;
CREATE POLICY "Staff shifts are viewable by everyone" 
ON public.staff_shifts FOR SELECT 
USING (true);
