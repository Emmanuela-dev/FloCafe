# Password Recovery Help - For FloCafe Users

Hi! If you forgot your password, here's how to fix it:

---

## Step 1: Find Your Email Address

1. Open **Command Prompt** (search for "cmd" in Windows Start menu)

2. Navigate to where FloCafe is installed:
   ```
   cd "C:\Users\YourName\AppData\Local\Programs\flo-cafe"
   ```
   OR wherever you installed FloCafe

3. Run this command:
   ```
   node resources\app\check-users.js
   ```

4. You'll see your exact email address. **Copy it exactly!**

---

## Step 2: Reset Your Password

1. Open FloCafe

2. Click **"Forgot Password?"** or **"Recover Access"**

3. Enter:
   - **Email:** (paste the EXACT email from Step 1)
   - **Master PIN:** `1234` (unless you changed it)
   - **New Password:** Must have:
     - At least 8 characters
     - At least 1 uppercase letter (A-Z)
     - At least 1 lowercase letter (a-z)  
     - At least 1 number (0-9)

4. Click **"Reset Password"**

---

## Example Good Passwords

✅ Rwanda@254  
✅ FloCafe2024  
✅ MyPassword1  
✅ Coffee123Shop  

❌ password (no uppercase, no number)  
❌ Pass1 (too short)  
❌ PASSWORD (no lowercase, no number)  

---

## Still Not Working?

### Option A: Manual Password Reset (Easier)

1. Open **Command Prompt** as Administrator

2. Go to FloCafe folder:
   ```
   cd "C:\Users\YourName\AppData\Local\Programs\flo-cafe"
   ```

3. Run this command (replace with YOUR email and desired password):
   ```
   node resources\app\reset-password-manual.js your.email@gmail.com YourNewPass123
   ```

   Example:
   ```
   node resources\app\reset-password-manual.js ligalamucution@gmail.com Rwanda@254
   ```

4. Done! You can now log in with the new password

---

### Option B: Contact Support

If nothing works, take screenshots of:
1. The error message
2. The output of `check-users.js`

And send them to your FloCafe administrator.

---

## Common Mistakes

1. **Email typo** - Must match EXACTLY (check with check-users.js)
2. **Wrong Master PIN** - Default is `1234`
3. **Weak password** - Must meet all 4 requirements above
4. **Extra spaces** - No spaces before/after email

---

## Questions?

**Q: What if I don't remember my Master PIN?**  
A: If you forgot it and it's not `1234`, use the manual reset script (Option A above)

**Q: Can I reset someone else's password?**  
A: Only if you have the Master PIN and you're resetting an owner/manager account

**Q: How do I know my role?**  
A: Run `check-users.js` - it shows your role (owner, manager, cashier, etc.)

---

## Technical Details (for IT people)

**Database location:** `%APPDATA%\flo-desktop\flo.db` (or installation folder)  
**Scripts location:** Inside the FloCafe installation folder, under `resources\app\`  
**Master PIN:** Stored separately from database for security  
**Password recovery:** Only works for owner and manager roles  

---

Good luck! 🎉
