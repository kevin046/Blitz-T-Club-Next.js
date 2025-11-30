# Quick Fix Guide - Verify Member 404 Error

## Problem
Getting 404 errors when accessing `/verify-member.html?member_id=...`

## Solution Applied
Added automatic redirects in `next.config.ts` to redirect `.html` URLs to clean Next.js routes.

## How to Use the Correct URL

### ❌ Wrong (Old HTML way):
```
http://localhost:3000/verify-member.html?member_id=31f25dda-d747-412d-94c8-d49021f7bfc4
```

### ✅ Correct (Next.js way):
```
http://localhost:3001/verify-member?member_id=31f25dda-d747-412d-94c8-d49021f7bfc4
```

**Note:** Server is running on port **3001** (not 3000)

## Steps to Fix

### 1. Restart the Development Server
The config changes require a restart:

```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm run dev
```

### 2. Test the Correct URL
After restart, visit:
```
http://localhost:3001/verify-member?member_id=31f25dda-d747-412d-94c8-d49021f7bfc4
```

### 3. Update Any QR Codes or Links
If you have QR codes or links pointing to `.html` URLs, update them to use clean URLs:

**Member QR Code Format:**
```
https://yoursite.com/verify-member?member_id=<member_uuid>
```

## What Was Fixed

1. **Added Redirects** in `next.config.ts`:
   - `/verify-member.html` → `/verify-member`
   - Any `*.html` → clean URL (permanent 301 redirect)

2. **Configured Next.js** to handle both old and new URL formats

## Testing the Flow

1. **Get a test member ID** from your Supabase `profiles` table
2. **Visit the verify page**:
   ```
   http://localhost:3001/verify-member?member_id=<your_test_member_id>
   ```
3. **You should see**:
   - Member information displayed
   - "Vendor: Log Deal" button
4. **Click the button** and enter vendor password
5. **Should redirect** to `/vendor/ee-auto` page

## Generating QR Codes

When generating QR codes for members, use this URL format:

```javascript
const qrCodeURL = `https://yoursite.com/verify-member?member_id=${memberUUID}`;
```

**Do NOT use**:
- `.html` extensions
- `/verify-member.html`
- Port numbers in production URLs

## Next.js Route System

Next.js uses file-based routing:
- `app/verify-member/page.tsx` → `/verify-member`
- `app/vendor/ee-auto/page.tsx` → `/vendor/ee-auto`
- **No `.html` needed!**

## Common Mistakes

❌ Including `.html` in URLs  
❌ Using localhost:3000 when server is on 3001  
❌ Using just the member_id without the full URL  

✅ Use clean URLs without extensions  
✅ Check which port the server is actually running on  
✅ Include full path: `/verify-member?member_id=...`  

## If Still Having Issues

1. **Clear browser cache**: Ctrl+Shift+R
2. **Check server is running**: Look for "Ready in X.Xs" message
3. **Verify correct port**: Server might be on 3001 if 3000 is busy
4. **Check terminal for errors**: Look for build errors
5. **Test without query params first**: `http://localhost:3001/verify-member`

---

**Updated**: 2025-11-30  
**Status**: ✅ Fixed with redirects
