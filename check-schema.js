/**
 * Check the users table schema
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath, { readonly: true });

console.log('Users table schema:\n');
const schema = db.prepare("PRAGMA table_info(users)").all();

schema.forEach(col => {
  console.log(`${col.name} (${col.type})`);
});

db.close();
