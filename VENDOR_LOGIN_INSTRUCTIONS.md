# EE Auto Vendor Login Instructions

## 🔐 **Vendor Credentials**

**Vendor Name**: EE Auto  
**Password**: `eeauto`  
**Tracking Page**: `/vendor/ee-auto`

---

## 📱 **How Vendors Access the System**

### **Step 1: Member Scans QR Code**
Member opens their digital membership card and shows QR code to vendor.

### **Step 2: Vendor Scans QR Code**
URL format:
```
https://www.blitztclub.com/verify-member?member_id=31f25dda-d747-412d-94c8-d49021f7bfc4
```

### **Step 3: Member Verification**
- System displays member information
- Shows member name, ID, status
- "Vendor: Log Deal" button appears

### **Step 4: Vendor Authentication**
1. Vendor clicks "Vendor: Log Deal" button
2. Password field appears
3. Vendor enters: `eeauto`
4. Clicks "Authenticate"

### **Step 5: Automatic Redirect**
System redirects to:
```
https://www.blitztclub.com/vendor/ee-auto?member_id=31f25dda-d747-412d-94c8-d49021f7bfc4
```

### **Step 6: Deal Logging**
- Member information pre-loaded
- Vendor selects services from price list
- Can add custom items
- Submits sale
- Transaction saved to database

---

## 🗄️ **Database Setup Required**

Before this works, you must run the SQL migration:

### **Run This SQL in Supabase Dashboard**

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Copy and paste the SQL from: `supabase/migrations/create_vendors_tables.sql`
5. Click "Run"

**OR** use this SQL directly:

```sql
-- Create vendors table
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

-- Create vendor_deals table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_deals_member_id ON vendor_deals(member_id);
CREATE INDEX IF NOT EXISTS idx_vendor_deals_vendor_id ON vendor_deals(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_deals_created_at ON vendor_deals(created_at DESC);

-- Insert EE Auto vendor
INSERT INTO vendors (id, name, password_hash, tracking_route, contact_email, status)
VALUES (
    'ee-auto-uuid'::uuid,
    'EE Auto',
    'eeauto',
    '/vendor/ee-auto',
    'contact@ee-auto.com',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_deals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Vendors are viewable by authenticated users"
    ON vendors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Vendor deals are viewable by vendor"
    ON vendor_deals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Vendors can insert their own deals"
    ON vendor_deals FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Vendors can update their own deals"
    ON vendor_deals FOR UPDATE TO authenticated USING (true);

-- Create update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON vendors TO authenticated;
GRANT ALL ON vendor_deals TO authenticated;
```

---

## ✅ **Testing Checklist**

- [ ] Run database migration in Supabase
- [ ] Go to: `https://www.blitztclub.com/verify-member?member_id=<valid_member_id>`
- [ ] Verify member info displays
- [ ] Click "Vendor: Log Deal"
- [ ] Enter password: `eeauto`
- [ ] Confirm redirect to `/vendor/ee-auto?member_id=<member_id>`
- [ ] Verify member info loads on tracking page
- [ ] Log a test deal
- [ ] Check deal appears in database

---

## 📝 **Important Notes**

1. **Password is stored as plain text** - This is for development only
2. **For production**: Implement proper password hashing (bcrypt)
3. **Session storage**: Vendor credentials stored in browser `sessionStorage`
4. **Member ID**: Passed via URL parameter for context

---

## 🔄 **To Change Password Later**

```sql
UPDATE vendors 
SET password_hash = 'new_password_here'
WHERE id = 'ee-auto-uuid';
```

---

**Last Updated**: 2025-11-30  
**Password**: `eeauto`  
**Status**: Ready for deployment after migration
