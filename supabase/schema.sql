-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL, -- In production, use proper hashing (e.g., bcrypt)
    tracking_route TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create vendor_deals table
CREATE TABLE IF NOT EXISTS public.vendor_deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vendor_id TEXT NOT NULL, -- Can be UUID or string ID used in frontend
    vendor_name TEXT NOT NULL,
    deal_type TEXT,
    deal_details JSONB DEFAULT '[]'::jsonb,
    total_price NUMERIC DEFAULT 0,
    custom_items JSONB DEFAULT '[]'::jsonb,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_deals ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for production)
-- For now, allow public read/write for demo purposes or specific authenticated roles
CREATE POLICY "Allow public read access to vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Allow public read access to vendor_deals" ON public.vendor_deals FOR SELECT USING (true);
CREATE POLICY "Allow insert to vendor_deals" ON public.vendor_deals FOR INSERT WITH CHECK (true);

-- Insert Seed Data for EE Auto
-- Note: 'ee-auto-uuid' is hardcoded in app/vendor/ee-auto/page.tsx
INSERT INTO public.vendors (id, name, password_hash, tracking_route)
VALUES 
    ('ee-auto-uuid', 'EE Auto', 'eeauto123', '/vendor/ee-auto')
ON CONFLICT (id) DO NOTHING;
