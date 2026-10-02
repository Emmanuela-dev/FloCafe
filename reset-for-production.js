/**
 * Reset Database for Production
 * 
 * This script helps you start fresh for a real customer installation.
 * It will BACKUP your current database and create a clean one.
 * 
 * Usage: node reset-for-production.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
const backupPath = path.join(__dirname, 'backups', `flo-backup-dev-${Date.now()}.db`);

console.log('\n=== RESET DATABASE FOR PRODUCTION ===\n');
console.log('⚠️  WARNING: This will reset your database!\n');
console.log('Current database:', dbPath);
console.log('Backup will be saved to:', backupPath);
console.log('\nThis will:');
console.log('  1. Create a backup of your current database');
console.log('  2. Delete all users (including admin@flocafe.ke)');
console.log('  3. Keep all menu items, categories, and settings');
console.log('  4. Allow fresh setup with custom owner email\n');

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Ask for confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Do you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('\n❌ Reset cancelled.\n');
    rl.close();
    process.exit(0);
  }

  try {
    // Backup current database
    console.log('\n📦 Creating backup...');
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ Backup created:', backupPath);

    // Open database
    const db = new Database(dbPath);

    // Count what we're deleting
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;

    console.log('\n🗑️  Deleting:');
    console.log(`  - ${userCount} user(s)`);
    console.log(`  - ${orderCount} order(s)`);
    console.log(`  - ${customerCount} customer(s)`);

    // Delete users, orders, and related data
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM order_items').run();
    db.prepare('DELETE FROM bills').run();
    db.prepare('DELETE FROM customers').run();
    db.prepare('DELETE FROM loyalty_ledger').run();

    // Reset onboarding flag so setup wizard shows
    db.prepare("UPDATE settings SET value = 'false' WHERE key = 'onboarding_completed'").run();

    // Keep products, categories, printers, tables, etc.
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;

    console.log('\n✅ Kept:');
    console.log(`  - ${productCount} product(s)`);
    console.log(`  - ${categoryCount} categor(ies)`);
    console.log('  - All settings');
    console.log('  - All printers');
    console.log('  - All tables');

    db.close();

    console.log('\n✅ Database reset complete!\n');
    console.log('Next steps:');
    console.log('  1. Build the Windows installer: npm run build:win');
    console.log('  2. Install on customer computer');
    console.log('  3. Customer will see setup wizard');
    console.log('  4. Customer can use their own email\n');
    console.log('Backup available at:', backupPath, '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
});
