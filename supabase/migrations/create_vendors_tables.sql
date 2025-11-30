-- Create vendors table for vendor authentication and tracking
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    tracking_route TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendor_deals table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendor_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    deal_type TEXT NOT NULL,
    deal_details JSONB,
    custom_items JSONB,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_deals_member_id ON vendor_deals(member_id);
CREATE INDEX IF NOT EXISTS idx_vendor_deals_vendor_id ON vendor_deals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_deals_created_at ON vendor_deals(created_at DESC);

-- Insert EE Auto vendor
INSERT INTO vendors (id, name, password_hash, tracking_route, contact_email, status)
VALUES (
    'ee-auto-uuid'::uuid,
    'EE Auto',
    'eeauto2024',  -- CHANGE THIS PASSWORD in production!
    '/vendor/ee-auto',
    'contact@ee-auto.com',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendors table
CREATE POLICY "Vendors are viewable by authenticated users"
    ON vendors FOR SELECT
    TO authenticated
    USING (true);

-- Create RLS policies for vendor_deals table
CREATE POLICY "Vendor deals are viewable by vendor"
    ON vendor_deals FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Vendors can insert their own deals"
    ON vendor_deals FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Vendors can update their own deals"
    ON vendor_deals FOR UPDATE
    TO authenticated
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vendors table
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON vendors TO authenticated;
GRANT ALL ON vendor_deals TO authenticated;
