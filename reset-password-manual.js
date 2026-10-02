/**
 * Manual Password Reset Script - EMERGENCY USE ONLY
 * 
 * This bypasses the normal password recovery flow.
 * Use this ONLY if the regular password recovery isn't working.
 * 
 * Usage:
 *   node reset-password-manual.js <email> <new-password>
 * 
 * Example:
 *   node reset-password-manual.js admin@flocafe.ke NewPassword123
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');

function now() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function validatePassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('\n❌ Usage: node reset-password-manual.js <email> <new-password>\n');
  console.error('Example:');
  console.error('  node reset-password-manual.js admin@flocafe.ke NewPassword123\n');
  process.exit(1);
}

const [email, newPassword] = args;

console.log(`\n=== MANUAL PASSWORD RESET ===\n`);
console.log(`Database: ${dbPath}`);
console.log(`Email: ${email}`);
console.log(`New Password: ${'*'.repeat(newPassword.length)}\n`);

// Validate password
if (!validatePassword(newPassword)) {
  console.error('❌ Password does not meet requirements:\n');
  console.error('  - At least 8 characters long');
  console.error('  - At least one UPPERCASE letter');
  console.error('  - At least one lowercase letter');
  console.error('  - At least one number\n');
  process.exit(1);
}

try {
  const db = new Database(dbPath);
  
  // Find user
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user) {
    console.error(`❌ No user found with email: ${email}\n`);
    console.error('Run "node check-users.js" to see all users\n');
    db.close();
    process.exit(1);
  }
  
  console.log(`✓ Found user: ${user.name}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Active: ${user.is_active ? 'Yes' : 'No'}\n`);
  
  if (!user.is_active) {
    console.warn('⚠️  WARNING: This account is deactivated!\n');
  }
  
  // Hash new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
  // Update password
  const stmt = db.prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?');
  const result = stmt.run(hashedPassword, now(), user.id);
  
  if (result.changes === 1) {
    console.log('✅ Password reset successful!\n');
    console.log('You can now log in with:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${newPassword}\n`);
    console.log('⚠️  Remember to change this password after logging in!\n');
  } else {
    console.error('❌ Failed to update password\n');
    process.exit(1);
  }
  
  db.close();
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
