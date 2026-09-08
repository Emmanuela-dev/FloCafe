/**
 * Set Master PIN
 * Usage: node set-master-pin.js <4-digit-pin>
 */

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const masterPin = process.argv[2] || '1234';

if (!/^\d{4}$/.test(masterPin)) {
  console.log('❌ Master PIN must be exactly 4 digits');
  process.exit(1);
}

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath);

console.log(`Setting Master PIN: ${masterPin}\n`);

// Hash the PIN
const hashedPin = bcrypt.hashSync(masterPin, 10);

// Check if master_pin setting exists
const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get('master_pin');

if (existing) {
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(hashedPin, 'master_pin');
  console.log('✅ Master PIN updated!');
} else {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('master_pin', hashedPin);
  console.log('✅ Master PIN created!');
}

console.log(`\n🔐 Master PIN: ${masterPin}`);
console.log('   (Use this for password recovery and administrative tasks)');

db.close();
