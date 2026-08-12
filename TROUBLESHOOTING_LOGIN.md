# Troubleshooting: Database Login Error

## Current Status
✅ **Backend API**: Working (verified via direct API test)
✅ **Database**: Healthy (integrity checks passed)
✅ **Login Credentials**: Valid (admin@flocafe.ke / Admin123!)
❌ **Frontend Login**: Showing "Database error: Login failed"

## Root Cause
The backend API login works perfectly. The error is occurring at the **frontend level**, not the database itself.

## Solutions (Try in Order)

### Solution 1: Clear Browser Cache & Local Storage
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Local Storage**, find `http://localhost:3000`
4. Click **Clear All**
5. Under **Session Storage**, clear that too
6. **Refresh the page** (Ctrl+Shift+R for hard refresh)
7. Try logging in again

### Solution 2: Check Frontend Console for Actual Error
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try logging in
4. Look for the actual error message (might be different from "Database error")
5. Share the error details if needed

Common errors you might see:
- `NetworkError` or `ERR_CONNECTION_REFUSED` → Backend not reachable
- `CORS error` → Frontend and backend CORS mismatch
- `401 Unauthorized` → Wrong credentials
- Timeout errors → Server too slow to respond

### Solution 3: Verify API Endpoint Configuration
The frontend should be calling: `http://localhost:3001/api/auth/login`

Check in browser DevTools → **Network** tab:
1. Try logging in
2. Look for the `/api/auth/login` request
3. Check:
   - Request URL (should be http://localhost:3001/api/auth/login)
   - Status Code (should be 200 on success)
   - Response body (should contain access_token)

### Solution 4: Restart Frontend Dev Server
```powershell
# Stop frontend (Ctrl+C in the terminal running it)
# Then restart:
cd frontend
npm run dev
```

### Solution 5: Restart Backend Server
```powershell
# Find the running process
Get-Process -Name node | Where-Object {$_.Path -like "*node*"}

# Kill all node processes (if needed)
Stop-Process -Name node -Force

# Restart backend
node dev-server.js
```

### Solution 6: Test Login via API Directly (Verification)
Run this in PowerShell to confirm backend works:

```powershell
$body = @{
  email = "admin@flocafe.ke"
  password = "Admin123!"
  remember = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

If this works, the problem is **frontend-only**.

### Solution 7: Database Lock Issue (If Others Don't Work)
Sometimes SQLite gets locked. Close everything and:

```powershell
# Stop all servers
Stop-Process -Name node -Force

# Delete WAL files (they'll be recreated)
Remove-Item flo.db-wal, flo.db-shm -Force -ErrorAction SilentlyContinue

# Restart backend
node dev-server.js

# In another terminal, restart frontend
cd frontend
npm run dev
```

### Solution 8: Create New User (Workaround)
If the issue is specific to the admin account:

```powershell
# Use the working API to create a new user
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Use token from Solution 6

$headers = @{ Authorization = "Bearer $token" }
$newUser = @{
  name = "Test Admin"
  email = "test@flocafe.ke"
  password = "Test123!"
  role = "owner"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/staff" -Method POST -Headers $headers -Body $newUser -ContentType "application/json"
```

Then try logging in with test@flocafe.ke / Test123!

## Quick Test Script

Run this to verify the backend is working:

```powershell
# Test health endpoint
curl.exe http://localhost:3001/api/health

# Test login
$body = '{"email":"admin@flocafe.ke","password":"Admin123!"}' 
curl.exe -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d $body
```

Both should return JSON responses with no errors.

## What to Check Next

1. **Browser Console** - What's the actual error?
2. **Network Tab** - Is the request reaching the backend?
3. **Server Logs** - Any errors when you try to login?

## Most Likely Issue

Based on testing, the backend works fine. The error message **"Database error: Login failed"** is probably:

1. **Generic error message** from frontend catching any login failure
2. **Not actually a database error** but a connection/CORS/network error
3. **Cached frontend state** showing stale error

**Next Step**: Check browser console (F12 → Console) and share the actual error message you see there.

---

## Working Credentials

```
Email: admin@flocafe.ke
Password: Admin123!
```

API endpoint tested and confirmed working: ✅
