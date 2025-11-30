# EE Auto Vendor Tracking System - Setup Guide

## Overview
This system allows vendors to authenticate via password verification after scanning a member's QR code, then access their dedicated tracking dashboard.

## Flow
1. **Member QR Code Scan** → `/verify-member?member_id=<uuid>`
2. **Member Verification** → System verifies member is active
3. **Vendor Authentication** → Vendor enters password
4. **Vendor Dashboard** → Redirects to vendor-specific tracking page (e.g., `/vendor/ee-auto`)

## Files Created

### 1. Verify Member Page
- **Location**: `app/verify-member/page.tsx`
- **Purpose**: Verifies member and provides vendor authentication
- **Features**:
  - Displays member information
  - Vendor password input form
  - Validates against `vendors` table
  - Redirects to vendor-specific dashboard

### 2. EE Auto Tracking Page
- **Location**: `app/vendor/ee-auto/page.tsx`
- **Purpose**: Dedicated dashboard for EE Auto to log and view deals
- **Features**:
  - Bilingual support (Chinese/English)
  - Member information display
  - Deal selection from price list
  - Custom item entry
  - Previous sales history
  - All deals view
  - Export functionality (CSV)

### 3. EE Auto CSS
- **Location**: `app/vendor/ee-auto/ee-auto.css`
- **Purpose**: Premium dark theme styling for EE Auto page

### 4. Database Migration
- **Location**: `supabase/migrations/create_vendors_tables.sql`
- **Purpose**: Creates necessary database tables

## Database Setup

### Step 1: Run the Migration

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `supabase/migrations/create_vendors_tables.sql`
5. Paste and click **Run**

#### Option B: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Verify Tables Created
Check that these tables exist:
- `vendors`
- `vendor_deals`

### Step 3: Update Vendor Password
⚠️ **IMPORTANT**: Change the default password!

```sql
UPDATE vendors 
SET password_hash = 'your_secure_password_here'
WHERE id = 'ee-auto-uuid';
```

## Configuration

### Environment Variables
Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Adding New Vendors

### 1. Add to Database
```sql
INSERT INTO vendors (name, password_hash, tracking_route, contact_email, status)
VALUES (
    'Vendor Name',
    'secure_password',
    '/vendor/vendor-slug',
    'contact@vendor.com',
    'active'
);
```

### 2. Create Vendor Page
Create a new page at `app/vendor/vendor-slug/page.tsx` using the EE Auto page as a template.

### 3. Update Vendor Constants
Update the vendor constants in the new page:
```tsx
const VENDOR_ID = 'vendor-uuid-from-database';
const VENDOR_NAME = 'Vendor Name';
```

## Usage

### For Members
1. Members access their QR code from their dashboard
2. QR code contains: `https://yoursite.com/verify-member?member_id=<uuid>`

### For Vendors
1. Scan member QR code
2. Verify member information is displayed
3. Click "Vendor: Log Deal"
4. Enter vendor password (e.g., "eeauto2024" for EE Auto - **CHANGE THIS!**)
5. System redirects to vendor tracking page
6. Log deals and view history

## Security Considerations

### ⚠️ Current Implementation
The current implementation uses **plain text password comparison** for simplicity. This is **NOT recommended for production**.

### 🔒 Production Recommendations

#### 1. Hash Passwords
Use bcrypt or similar:
```tsx
import bcrypt from 'bcryptjs';

// When creating vendor
const hashedPassword = await bcrypt.hash('password', 10);

// When verifying
const isValid = await bcrypt.compare(vendorPassword, vendor.password_hash);
```

#### 2. Implement Session Management
- Use HTTP-only cookies
- Add JWT tokens
- Implement session expiration

#### 3. Add Rate Limiting
Prevent brute force attacks on vendor passwords.

#### 4. Use Supabase Auth
Consider integrating with Supabase's built-in authentication system.

## Customization

### Change Language
```typescript
// In the vendor page
const [lang, setLang] = useState('zh'); // or 'en'
```

### Add Deal Types
Update `dealOptionsList` array in the vendor page:
```typescript
const dealOptionsList = [
    {
        type: 'new_deal_type',
        label: { zh: '中文名称', en: 'English Name' },
        desc: { zh: '中文描述', en: 'English Description' },
        price: 100
    },
    // ... more deals
];
```

### Styling
Modify `ee-auto.css` or create vendor-specific CSS files.

## Troubleshooting

### Issue: "Member not found"
- Check that the member_id in the URL is correct
- Verify the member exists in the `profiles` table
- Ensure member has `membership_status = 'active'`

### Issue: "Invalid vendor password"
- Verify password in database matches input
- Check vendor record exists in `vendors` table
- Ensure vendor status is 'active'

### Issue: Redirect not working
- Verify `tracking_route` in vendors table matches page location
- Check browser console for errors
- Ensure sessionStorage is working

### Issue: No deals appearing
- Check `vendor_deals` table has data
- Verify RLS policies are correctly set
- Check browser console for Supabase errors

## Testing Flow

1. **Create Test Member**
   - Ensure member has active status
   - Note the member's UUID

2. **Test Verification**
   ```
   https://localhost:3000/verify-member?member_id=<test_member_uuid>
   ```

3. **Test Vendor Auth**
   - Click "Vendor: Log Deal"
   - Enter password: `eeauto2024` (or your custom password)
   - Should redirect to `/vendor/ee-auto`

4. **Test Deal Logging**
   - Select deals from price list
   - Add custom items
   - Submit sale
   - Verify in database and Previous Sales section

## Future Enhancements

- [ ] Multi-factor authentication for vendors
- [ ] Email notifications on deal completions
- [ ] Analytics dashboard for vendors
- [ ] QR code generation for members
- [ ] Bulk deal import/export
- [ ] Vendor-specific branding customization
- [ ] Real-time deal notifications
- [ ] Mobile app for vendors

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check Supabase dashboard logs
4. Verify database tables and data

---

**Last Updated**: 2025-11-30
**Version**: 1.0.0
