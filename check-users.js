/**
 * Diagnostic script to check all users in the database
 * Run with: node check-users.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
console.log(`[Check Users] Opening database: ${dbPath}`);

try {
  const db = new Database(dbPath, { readonly: true });
  
  console.log('\n=== ALL USERS IN DATABASE ===\n');
  
  const users = db.prepare(`
    SELECT id, name, email, role, is_active, created_at, updated_at 
    FROM users 
    ORDER BY created_at DESC
  `).all();
  
  if (users.length === 0) {
    console.log('❌ NO USERS FOUND - Setup may not have completed');
  } else {
    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
  }
  
  // Check for owner accounts specifically
  const owners = users.filter(u => u.role === 'owner' && u.is_active);
  console.log(`\n=== ACTIVE OWNER ACCOUNTS (can recover password) ===`);
  console.log(`Found ${owners.length} active owner(s):\n`);
  owners.forEach(owner => {
    console.log(`   ✓ ${owner.name} (${owner.email})`);
  });
  
  db.close();
  
  console.log('\n=== INSTRUCTIONS ===');
  console.log('To recover a password, you need:');
  console.log('1. The exact email address from the list above');
  console.log('2. The Master PIN (default: 1234)');
  console.log('3. Use the "Recover Access" option on the login screen');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
