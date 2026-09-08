/**
 * Check existing users in the database
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath, { readonly: true });

console.log('Checking users in database...\n');

const users = db.prepare('SELECT id, email, name, role, is_active FROM users').all();

if (users.length === 0) {
  console.log('No users found in database.');
} else {
  console.log('Existing users:');
  console.log('─'.repeat(80));
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.is_active ? 'Yes' : 'No'}`);
    console.log('─'.repeat(80));
  });
}

// Check master PIN
const settings = db.prepare('SELECT * FROM settings WHERE key = ?').get('master_pin');
if (settings) {
  console.log('\n✓ Master PIN is set in the system');
} else {
  console.log('\n✗ No Master PIN found');
}

db.close();
