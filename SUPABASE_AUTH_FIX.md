# Supabase Auth 403 Forbidden Fix

## Problem
The application was experiencing a **403 Forbidden** error when users tried to sign out:
```
POST https://qhkcrrphsjpytdfqfamq.supabase.co/auth/v1/logout?scope=global 403 (Forbidden)
```

This was affecting login/register functionality.

## Root Cause
In recent versions of `@supabase/supabase-js` (v2.86.0), the default behavior of `supabase.auth.signOut()` changed to use **global scope** logout, which:
- Signs out the user from ALL devices/sessions
- Requires admin-level authentication privileges
- Results in 403 Forbidden errors when called with regular user credentials

## Solution
Changed all `supabase.auth.signOut()` calls to use **local scope**:
```typescript
await supabase.auth.signOut({ scope: 'local' });
```

This:
- Only signs out the current browser session
- Does NOT require admin privileges
- Resolves the 403 Forbidden error

## Files Modified
- `contexts/AuthContext.tsx` - Updated both signOut function calls:
  - Line 95: Error handler signOut call
  - Line 130: Main signOut function

## Testing
After this fix:
1. ✅ Users can successfully sign out without 403 errors
2. ✅ Login/register functionality works correctly
3. ✅ The session is properly cleared from the current browser
4. ✅ Other devices/sessions remain signed in (expected behavior for local scope)

## Alternative: Global Scope
If you need to sign out users from ALL devices (e.g., for security reasons like password change), you would need to:
1. Use the Supabase Admin API with service role key on the backend
2. Call signOut with global scope from a secure API route
3. Never expose the service role key to the frontend

For normal logout operations, **local scope is the correct and secure approach**.
