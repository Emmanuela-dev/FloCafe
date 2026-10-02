# FloCafe Production Setup Guide

## ✅ YES, Owners Can Use Their Own Email!

**FloCafe does NOT force you to use `admin@flocafe.ke`**

Each installation is completely independent. During the initial setup, you can use ANY email address you want.

---

## First-Time Setup Process

When you install FloCafe for the first time, you'll see a setup wizard with these steps:

### Step 1: Choose Language & Country
- Select your language (English, Spanish, Portuguese)
- Select your country (for currency, timezone, tax settings)

### Step 2: Master PIN (Security)
- Create a 4-digit Master PIN (example: `1234`, `9876`, `2580`)
- This PIN is used for password recovery
- **REMEMBER THIS PIN!** You'll need it if you forget your password

### Step 3: Owner Account **← YOU ENTER YOUR OWN EMAIL HERE**
Fill in:
- **Your Name:** (Example: "John Smith" or "Cafe Owner")
- **Your Email:** **ANY email you want!** (Examples:)
  - `ligalamucution@gmail.com`
  - `owner@mycafe.com`
  - `john.smith@gmail.com`
  - `business@mybakery.com`
- **Password:** Must have:
  - At least 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
- **Business Name:** (Example: "Joe's Cafe", "Main Street Bakery")

### Step 4: Choose Profile
- **Empty:** Start from scratch
- **Express:** Pre-populated with sample products (recommended)
- **Demo:** Includes sample data for testing

### Step 5: Service Model
- **QSR (Quick Service):** Fast food, cafes, takeaway
- **Fine Dining:** Restaurants with table service

### Step 6: Complete!
- Click "Complete Setup"
- You'll be redirected to login with YOUR email

---

## Example Real-World Setups

### Example 1: Rwanda Cafe
```
Name: Mugisha Emmanuel
Email: mugisha@gmail.com
Password: Rwanda@2024
Business Name: Flo Cafe Rwanda
Master PIN: 1234
```

### Example 2: Kenya Restaurant
```
Name: Wanjiru Mary
Email: mary.wanjiru@yahoo.com
Password: Nairobi254!
Business Name: Mary's Kitchen
Master PIN: 2580
```

### Example 3: Tanzania Bakery
```
Name: Hassan Ahmed
Email: hassan.bakery@gmail.com
Password: Bakery2024!
Business Name: Hassan's Bakery
Master PIN: 9876
```

---

## Important Notes

### 1. Each Installation is Separate
- If you install FloCafe on 3 different computers, you can use:
  - Computer 1: `owner1@email.com`
  - Computer 2: `owner2@email.com`
  - Computer 3: `owner3@email.com`
- Each one is completely independent!

### 2. The `admin@flocafe.ke` Account
- This is just the default account in the **demo/development** version
- When you do a fresh install, there's NO default account
- You create your own account during setup

### 3. Multiple Users
After setup, you can add more users:
- **Settings → Staff**
- Add cashiers, waiters, chefs, managers
- Each can have their own email and role

### 4. Password Recovery
If you forget your password:
1. Click "Forgot Password" on login
2. Enter your email (the one you used during setup)
3. Enter your Master PIN
4. Set a new password

---

## Testing vs Production

### Development/Testing:
- Use: `admin@flocafe.ke` / `Admin123`
- Master PIN: `1234`
- This is just for developers testing the app

### Production (Your Real Business):
- Use: **YOUR OWN EMAIL ADDRESS**
- Password: **YOUR OWN SECURE PASSWORD**
- Master PIN: **YOUR OWN 4-DIGIT PIN**

---

## Common Questions

**Q: Do I need to use `admin@flocafe.ke`?**  
A: **NO!** Use your own email address.

**Q: Can two cafes use the same email?**  
A: Yes, if they're separate installations. Each computer/installation is independent.

**Q: Can I change the owner email later?**  
A: Currently no. Choose carefully during setup. But you can add multiple owner accounts via Staff settings.

**Q: What if I make a mistake during setup?**  
A: You can delete the database and start over:
1. Delete `flo.db` file from the installation folder
2. Restart FloCafe
3. Go through setup again

**Q: Where is the database stored?**  
A: Depends on your operating system:
- Windows: `%APPDATA%\flo-desktop\flo.db`
- macOS: `~/Library/Application Support/flo-desktop/flo.db`
- Linux: `~/.config/flo-desktop/flo.db`

---

## Security Best Practices

### Good Passwords:
✅ `MyBusiness2024!`  
✅ `Cafe@Rwanda254`  
✅ `SecurePass123`  

### Bad Passwords:
❌ `password` (too weak)  
❌ `12345678` (too predictable)  
❌ `admin` (too common)  

### Master PIN:
✅ Use something memorable but not obvious  
✅ Write it down in a secure place  
✅ Don't share it with staff (only owners)  

---

## Ready for Production?

When you build and install FloCafe for your customer:

1. **Install the app** on their computer
2. **Open FloCafe** - it will show the setup wizard
3. **Help them fill in their information:**
   - Their name
   - Their business email
   - A secure password
   - Their business name
   - A Master PIN they can remember
4. **Complete setup**
5. **Write down their credentials** somewhere safe
6. **Test the login** to make sure it works

---

## Summary

✅ **You can use ANY email during setup**  
✅ **No default `admin@flocafe.ke` is required**  
✅ **Each installation is independent**  
✅ **Perfect for production use**  

Your friend can use `ligalamucution@gmail.com` or any other email they prefer!
