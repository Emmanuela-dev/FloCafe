# FloCafe Kenya Configuration

## ✅ System Configured for Kenya

The FloCafe POS system has been configured for Kenya operations with the following settings:

### Business Information
- **Business Name**: FloCafe Kenya
- **Country**: Kenya (KE)
- **Currency**: Kenyan Shilling (KES)
- **Currency Symbol**: KSh
- **Timezone**: Africa/Nairobi (EAT - East Africa Time)
- **Language**: English
- **Country Dial Code**: +254

### Login Credentials

**Admin/Owner Account**:
```
Email: admin@flocafe.ke
Password: Admin123!
Role: Owner (Full Access)
```

### Demo Data Included

#### Categories (4)
1. **Starters** 🍔
2. **Main Course** 🍛
3. **Beverages** 🥤
4. **Desserts** 🍰

#### Products (8)
Sample menu items with prices in KES:
- Paneer Tikka - KSh 250
- Chicken Wings - KSh 280
- Butter Chicken - KSh 320
- Dal Makhani - KSh 220
- Jeera Rice - KSh 150
- Cola - KSh 60
- Lemon Soda - KSh 70
- Gulab Jamun - KSh 80

#### Tables (4)
- T1 (4 seats)
- T2 (4 seats)
- T3 (6 seats)
- T4 (2 seats)

#### Demo Customers (3)
All with Kenya country code (+254):
- Aarav Sharma
- Maya Iyer
- Kabir Khan

## How to Access the System

### Option 1: Frontend Development Server (Recommended)
```powershell
cd frontend
npm run dev
```
Then open: http://localhost:3000/auth/login

### Option 2: Production Build
Build the frontend first:
```powershell
npm run build:frontend
```
Then access: http://localhost:3001/auth/login

### Backend API Endpoints
- Main API: http://localhost:3001
- Health Check: http://localhost:3001/api/health
- KDS Server: http://localhost:3002

## Kenya-Specific Features

### Currency Formatting
All amounts are displayed with **KSh** symbol:
- Example: KSh 1,250.00
- Uses Kenyan locale for number formatting

### Tax Configuration
The system is configured for Kenya tax rules:
- Tax registration field available (for PIN/VAT registration)
- Supports Kenya tax categories when enabled

### Phone Numbers
All customer phone numbers use Kenya country code:
- Format: +254 XXX XXX XXX
- Validates against Kenya phone number formats

### Business Hours
Configured for East Africa Time (EAT):
- Timezone: Africa/Nairobi
- UTC+3 (no daylight saving time)

## Next Steps

### 1. Update Business Information
Login and go to **Settings > Business** to update:
- Business address in Kenya
- Kenya phone number
- Tax registration number (KRA PIN if registered)
- Email address

### 2. Customize Menu
Go to **Menu Management** to:
- Edit product prices in KES
- Add your actual menu items
- Remove/modify demo products
- Upload product images

### 3. Configure Staff
Go to **Settings > Staff** to:
- Add cashiers, waiters, kitchen staff
- Set up user PINs for quick login
- Assign roles and permissions

### 4. Setup Printers (When Hardware Arrives)
Go to **Settings > Printers** to:
- Add receipt printers
- Configure Kitchen Display System (KDS)
- Setup Kitchen Order Tickets (KOT)
- Test print connections

### 5. Add Real Customers
Go to **Customers** to:
- Import customer list
- Add loyalty program members
- Set up wallet/credit system

## Kenya Payment Methods

Common payment methods in Kenya:
- **M-PESA** (most popular mobile money)
- **Airtel Money**
- **Cash**
- **Bank Cards** (Visa, Mastercard)

Configure these in the system as payment methods.

## Support

- Server Status: Check http://localhost:3001/api/health
- Database Location: `flo.db` in project root
- Backups: Stored in `backups/` folder
- Logs: Check server console output

## Security Notes

⚠️ **Important**: Change the admin password after first login!

Go to: **Profile > Change Password**

The default password `Admin123!` should only be used for initial setup.

---

**Last Updated**: 2026-08-11
**System Version**: 2.4.0
**Database Schema**: v38
