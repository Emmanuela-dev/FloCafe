# FloCafe Login Credentials

## System Access

The system is currently running at: **http://localhost:3001**

### 🎉 NEW: Kenyan Menu Imported!
Your system now has **50 Kenyan menu items** across **14 categories** ready to use!
See [CSV_IMPORT_GUIDE.md](CSV_IMPORT_GUIDE.md) for full details.

## Available Users

### Owner/Admin Account
- **Email:** admin@flocafe.ke
- **Password:** Admin123
- **Role:** Owner (full access)

### Demo Manager Account
- **Email:** manager@flo.com
- **Password:** (needs to be reset - see instructions below)
- **Role:** Manager

### Demo Cashier Account
- **Email:** cashier@flo.com
- **Password:** (needs to be reset - see instructions below)
- **Role:** Cashier

### Demo Chef Account
- **Email:** chef@flo.local
- **Password:** (needs to be reset - see instructions below)
- **Role:** Chef

## Master PIN
- **PIN:** 1234
- Use this for password recovery and administrative tasks

## Quick Start

1. **Access the system:** Open your browser and go to http://localhost:3001
2. **Login:** Use the admin credentials above
3. **First-time setup:** You may be prompted to complete initial setup

## Running the System

### Backend Only (Current Method)
```bash
node dev-server.js
```
This runs the backend server at http://localhost:3001

### With Electron (Desktop App)
```bash
npm run dev
```
This will open the full Electron application

## Useful Scripts

### Reset Any User's Password
```bash
node reset-password.js <email> <new-password>
```
Example:
```bash
node reset-password.js manager@flo.com Manager123
```

### Change Master PIN
```bash
node set-master-pin.js <4-digit-pin>
```
Example:
```bash
node set-master-pin.js 5678
```

### Check Existing Users
```bash
node check-users.js
```

## Troubleshooting

### Cannot Login
1. Make sure the backend is running: `node dev-server.js`
2. Check the server output for any errors
3. Reset your password using the reset-password.js script

### Forgot Master PIN
Run:
```bash
node set-master-pin.js 1234
```

### Port Already in Use
If ports 3001 or 3002 are in use:
```bash
npm run clean
```
Then restart the server.

## Security Notes

⚠️ **Important:** The default passwords and PIN are for development only. 
In production, always use strong, unique passwords and PINs.

---

## CSV Import & Image Management

### Quick Import Kenyan Menu
```bash
node import-kenyan-menu.js
```

### Add Images to Products

**Option 1: From local files**
1. Create an `images/` folder
2. Add product photos (name them after products: "Ugali.jpg", "Chapati.png", etc.)
3. Run: `node add-product-images.js`

**Option 2: From URLs**
1. Edit `add-images-from-urls.js` with your image URLs
2. Run: `node add-images-from-urls.js`

**Option 3: Via Frontend UI**
1. Go to http://localhost:3001/menu
2. Click on any product
3. Upload image directly

### Full CSV & Image Guide
See [CSV_IMPORT_GUIDE.md](CSV_IMPORT_GUIDE.md) for:
- CSV format reference
- Import/export instructions
- Image specifications
- Troubleshooting tips
- Bulk operations

---

## Available Scripts

### User Management
- `node check-users.js` - List all users
- `node reset-password.js <email> <password>` - Reset user password
- `node set-master-pin.js <4-digit-pin>` - Set/change Master PIN

### Menu Management
- `node import-kenyan-menu.js` - Import Kenyan menu from CSV
- `node add-product-images.js` - Add images from local files
- `node add-images-from-urls.js` - Add images from URLs

### System
- `node dev-server.js` - Start backend server
- `npm run dev` - Start full Electron app
- `npm run clean` - Kill ports 3001 & 3002

---

## Files Created

### Documentation
- `LOGIN_CREDENTIALS.md` - This file
- `CSV_IMPORT_GUIDE.md` - Complete CSV import documentation

### Data Files
- `kenyan-categories.csv` - 14 Kenyan food categories
- `kenyan-menu.csv` - 50 Kenyan menu items with prices

### Scripts
- `check-users.js` - View database users
- `reset-password.js` - Reset any user's password
- `set-master-pin.js` - Set Master PIN
- `import-kenyan-menu.js` - Automated CSV import
- `add-product-images.js` - Bulk image upload from files
- `add-images-from-urls.js` - Bulk image upload from URLs
- `check-schema.js` - View database schema
