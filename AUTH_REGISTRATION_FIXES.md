# Auth & Registration Fixes - December 1, 2025

## Issues Fixed

### 1. ✅ 403 Forbidden Logout Error
**Problem**: Users couldn't log out - received 403 Forbidden error
```
POST https://qhkcrrphsjpytdfqfamq.supabase.co/auth/v1/logout?scope=global 403 (Forbidden)
```

**Root Cause**: Supabase Auth v2.86.0 changed default `signOut()` to use global scope, which requires admin privileges.

**Solution**: Changed all `signOut()` calls to use local scope:
```typescript
await supabase.auth.signOut({ scope: 'local' });
```

**Files Modified**:
- `contexts/AuthContext.tsx` - Updated signOut function (line 130) and error handler (line 95)

---

### 2. ✅ Duplicate Key Constraint Error
**Problem**: Registration failed with "duplicate key value violates unique constraint 'profiles_pkey'"

**Root Cause**: Supabase may have a database trigger that automatically creates profiles, causing conflicts when API tries to insert.

**Solution**: Added check for existing profile before insert, with update fallback:
```typescript
// Check if profile already exists (might be created by a trigger)
const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .single();

// Only insert if profile doesn't exist, otherwise update
if (!existingProfile) {
    // insert...
} else {
    // update...
}
```

**Files Modified**:
- `app/api/register/route.ts` - Added profile existence check

---

### 3. ✅ Email Verification SMTP Auth Failed
**Problem**: Email sending failed with "535 5.7.8 Error: authentication failed"

**Root Cause**: Custom SMTP configuration was having authentication issues with nodemailer.

**Solution**: **Switched to Supabase's built-in email verification** (per user request):
- Removed custom `crypto` token generation
- Removed `nodemailer` email sending
- Added `emailRedirectTo` option in `auth.signUp()`
- Supabase now handles all email verification automatically

**Benefits**:
- ✅ More reliable (uses Supabase's email infrastructure)
- ✅ More secure (no SMTP credentials exposed)
- ✅ Simpler code (no custom email logic)
- ✅ Better user experience (professional Supabase emails with their branding)

**Files Modified**:
- `app/api/register/route.ts` - Removed nodemailer, added emailRedirectTo

---

### 4. ✅ Missing Registration Fields
**Problem**: Frontend sent additional user data (phone, DOB, address, car models) but they weren't being stored.

**Solution**: Updated registration API to accept and store all fields:
- `phoneNumber`
- `dateOfBirth`
- `carModels` (array)
- `address.street`
- `address.city`
- `address.province`
- `address.postalCode`

These are now stored in both:
1. Supabase Auth metadata (`options.data`)
2. Profiles table

**Files Modified**:
- `app/api/register/route.ts` - Added all missing fields to insert/update

---

## Configuration Notes

### Supabase Email Settings
For Supabase email verification to work, ensure in your Supabase Dashboard:

1. **Email Templates** (`Authentication > Email Templates`):
   - Confirm signup template is enabled
   - Customize subject/body if needed
   
2. **Email Auth** (`Authentication > Providers`):
   - Email provider is enabled
   - Confirm email is enabled

3. **Redirect URLs** (`Authentication > URL Configuration`):
   - Add `http://localhost:3000/dashboard` to allowed redirect URLs
   - Add production URL when deploying

### Environment Variables
Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qhkcrrphsjpytdfqfamq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=http://localhost:3000  # Change in production
```

---

## Testing Checklist

- [x] User can register with all fields
- [x] User receives Supabase verification email
- [ ] User can click email link to verify
- [ ] User is redirected to dashboard after verification
- [ ] User can log out without 403 errors
- [ ] User can log in after verification
- [ ] All profile data is stored correctly

---

## Next Steps (Optional)

1. **Customize Supabase email templates** to match your brand
2. **Add resend verification email** functionality if users don't receive it
3. **Test email verification flow** end-to-end
4. **Update production redirect URLs** before deployment
