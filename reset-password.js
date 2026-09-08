/**
 * Reset a user's password
 * Usage: node reset-password.js <email> <new-password>
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const email = process.argv[2] || 'admin@flocafe.ke';
const newPassword = process.argv[3] || 'Admin123';

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath);

console.log(`Resetting password for: ${email}`);
console.log(`New password: ${newPassword}\n`);

// Check if user exists
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

if (!user) {
  console.log(`❌ User with email ${email} not found.`);
  console.log('\nAvailable users:');
  const users = db.prepare('SELECT email FROM users').all();
  users.forEach(u => console.log(`  - ${u.email}`));
  db.close();
  process.exit(1);
}

// Hash the new password
const hashedPassword = bcrypt.hashSync(newPassword, 10);

// Update the password
db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);

console.log('✅ Password reset successfully!');
console.log('\n📝 Login credentials:');
console.log(`   Email: ${email}`);
console.log(`   Password: ${newPassword}`);
console.log('\n🌐 You can now log in at: http://localhost:3001/auth/login');

db.close();
