# FloCafe Login Credentials

## System Access

The system is currently running at: **http://localhost:3001**

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
