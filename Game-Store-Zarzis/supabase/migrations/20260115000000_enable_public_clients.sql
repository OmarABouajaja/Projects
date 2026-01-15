-- Enable public access for clients table (needed for client portal registration/login)

-- Allow public to create their own profile
CREATE POLICY "Public can register as client" ON public.clients
    FOR INSERT
    WITH CHECK (true);

-- Allow public to read client profiles (needed for login check)
-- Ideally this would be restricted, but for the current architecture where 
-- login happens via client-side query, we need read access.
CREATE POLICY "Public can view clients" ON public.clients
    FOR SELECT
    USING (true);

-- Allow public to update their own profile? 
-- Difficult to secure without auth context. 
-- For now, updates might need to be staff-only or via secure backend.
