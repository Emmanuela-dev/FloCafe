# Password Recovery Guide - FloCafe

## Problem: "No active owner account found with that email"

This error occurs when trying to recover a password. Here's how to fix it:

---

## Step 1: Check What Users Exist

Run this command to see all users in your database:

```powershell
node check-users.js
```

This will show you:
- All user accounts
- Their email addresses (exact spelling!)
- Their roles (owner, manager, cashier, etc.)
- Which accounts are active

---

## Step 2: Verify the Email Address

**Most common issue:** Email address mismatch!

✅ **Correct:** `ligalamucution@gmail.com`  
❌ **Wrong:** `ligalamucution @gmail.com` (extra space)  
❌ **Wrong:** `Ligalamucution@gmail.com` (wrong capitalization)

**The email must match EXACTLY** as shown in the `check-users.js` output.

---

## Step 3: Check the Master PIN

The Master PIN is required for password recovery.

**Default Master PIN:** `1234`

If you changed it during setup, you need to remember it. The Master PIN cannot be recovered - it's stored securely outside the database.

---

## Step 4: Password Recovery Process

1. Click "Forgot Password?" on the login screen
2. Enter the **exact email address** from Step 1
3. Enter the **Master PIN** (default: 1234)
4. Enter your **new password** (must meet requirements)
5. Confirm the new password
6. Click "Reset Password"

---

## Password Requirements

Your new password MUST:
- Be at least 8 characters long
- Contain at least one UPPERCASE letter
- Contain at least one lowercase letter
- Contain at least one number

✅ **Good examples:**
- `Rwanda@254`
- `FloCafe2024`
- `MyPassword1`

❌ **Bad examples:**
- `password` (no uppercase, no number)
- `Pass1` (too short)
- `PASSWORD123` (no lowercase)

---

## Who Can Recover Passwords?

**UPDATED:** Password recovery now works for:
- ✅ Owner accounts (role: `owner`)
- ✅ Manager accounts (role: `manager`)

❌ Cashier, waiter, and chef accounts CANNOT use self-service recovery.  
→ Contact your owner/manager to reset those passwords.

---

## Troubleshooting Checklist

### Issue: "No active account found"

**Possible causes:**
1. ☐ Email address typo - run `node check-users.js` to get exact email
2. ☐ Account was deactivated - check `is_active` column
3. ☐ Account doesn't exist - setup may not have completed

### Issue: "Passwords do not match"

**Solution:** Make sure both password fields are identical

### Issue: "Invalid Master PIN"

**Solutions:**
- Try default: `1234`
- After 5 wrong attempts, you'll be locked out for 15 minutes
- Wait and try again with the correct PIN

### Issue: Master PIN is lost

**No recovery available.** The Master PIN is stored outside the database for security.

**Workaround for developers:**
1. Delete the Master PIN file (location varies by OS)
2. You'll need to set a new one
3. This is a last resort and requires technical knowledge

---

## For Your Friend

Tell them to:

1. **Check the exact email address:**
   ```powershell
   node check-users.js
   ```

2. **Copy the email exactly** as shown (no extra spaces!)

3. **Use Master PIN:** `1234` (unless changed during setup)

4. **Try password recovery again** with the exact email

5. **If it still fails:**
   - Take a screenshot of the `check-users.js` output
   - Take a screenshot of the recovery screen
   - Share both screenshots so we can diagnose the issue

---

## What I Fixed

✅ **Before:** Only `owner` role could recover passwords  
✅ **After:** Both `owner` AND `manager` roles can recover passwords  

✅ **Before:** Generic error message  
✅ **After:** Clearer error messages explaining the issue  

✅ **Added:** `check-users.js` diagnostic script  

---

## Need More Help?

If password recovery still doesn't work:

1. Run `node check-users.js` and share the output
2. Check if the email shown matches the recovery attempt
3. Verify the account role is `owner` or `manager`
4. Confirm the account is active (`is_active: Yes`)

---

## Installation Notes

After making these fixes, you need to:

1. **Rebuild the app:**
   ```powershell
   npm run build:win
   ```

2. **Or restart the dev server:**
   ```powershell
   node dev-server.js
   ```

3. **If already installed:** Reinstall the new `.exe` file to get the fixes

---

## Summary

The most common issue is **email address mismatch**. Use `node check-users.js` to see the exact email, then copy it carefully into the recovery form.
