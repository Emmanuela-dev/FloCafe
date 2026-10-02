# Customer Email Setup - Quick Answer

## Can owners use their own email? 

**YES! ✅**

FloCafe does NOT require `admin@flocafe.ke`. Each customer can use their own email address.

---

## How It Works

### When Installing for a Customer:

1. **Install FloCafe** on their computer (run the `.exe` installer)

2. **First launch** shows setup wizard

3. **Customer fills in their info:**
   ```
   Name: [Their Name]
   Email: [THEIR OWN EMAIL] ← They choose this!
   Password: [Their Password]
   Business Name: [Their Business]
   Master PIN: [4-digit PIN they choose]
   ```

4. **Setup complete** - they log in with THEIR email

---

## Your Friend's Case

Your friend's error: "No active owner account found with that email"

**Possible reasons:**
1. ✅ They used `ligalamucution@gmail.com` during setup
2. ❌ But typed it wrong when recovering (typo, extra space)
3. ❌ Or the setup didn't complete properly

**Solution:**
```powershell
# On THEIR computer (where FloCafe is installed), run:
node check-users.js

# This shows the EXACT email they used
# Then use that exact email for password recovery
```

---

## For Development vs Production

### Your Development Database (Current):
- Has `admin@flocafe.ke` with password `Admin123`
- Used for testing
- This is YOUR database

### Customer's Production Database:
- When THEY install FloCafe on THEIR computer
- They get a FRESH database
- NO admin@flocafe.ke exists
- They create their OWN account with THEIR email

---

## Building for Customers

### Option 1: Fresh Install (Recommended)
When you build `npm run build:win`, it creates an installer that:
- Contains NO database
- First launch shows setup wizard
- Customer creates their own account

### Option 2: Pre-configured Install
If you want to ship with demo data (menu items already imported):
```powershell
# 1. Reset database but keep menu
node reset-for-production.js

# 2. Build installer
npm run build:win

# 3. Customer gets setup wizard but menu is pre-loaded
```

---

## Password Recovery Fixed

I already fixed the password recovery system to:
1. ✅ Show better error messages
2. ✅ Work for both owner and manager roles
3. ✅ Provide clearer instructions

**To get the fix:**
```powershell
# Rebuild backend
npm run build

# Rebuild frontend
cd frontend
npm run build
cd ..

# Rebuild installer
npm run build:win
```

---

## Testing the Full Flow

Want to test the customer experience?

```powershell
# 1. Backup current database
copy flo.db flo-dev-backup.db

# 2. Delete database to simulate fresh install
del flo.db

# 3. Start the app
node dev-server.js

# 4. Open http://localhost:3001
# You'll see the setup wizard

# 5. Create account with ANY email you want
# Example: test@mycafe.com

# 6. After setup, test password recovery

# 7. When done, restore your dev database
copy flo-dev-backup.db flo.db
```

---

## Summary

✅ Customers can use ANY email (gmail, yahoo, custom domain, etc.)  
✅ Each installation is independent  
✅ No hardcoded `admin@flocafe.ke` required  
✅ Setup wizard lets them choose their email  
✅ Password recovery works with their chosen email  

**Your friend's specific issue:**
They need to check the EXACT email they used during setup on THEIR computer, not yours.
