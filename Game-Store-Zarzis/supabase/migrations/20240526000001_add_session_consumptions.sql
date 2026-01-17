-- Create session_consumptions table
CREATE TABLE IF NOT EXISTS public.session_consumptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.gaming_sessions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,3) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add session_id to sales for tracking which session a sale belongs to
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.gaming_sessions(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.session_consumptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable all access for authenticated users" ON public.session_consumptions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON TABLE public.session_consumptions TO authenticated;
GRANT ALL ON TABLE public.session_consumptions TO service_role;
