/**
 * Check the bills table schema
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath, { readonly: true });

console.log('Bills table schema:\n');
const schema = db.prepare("PRAGMA table_info(bills)").all();

schema.forEach(col => {
  console.log(`${col.name.padEnd(30)} ${col.type.padEnd(10)} ${col.notnull ? 'NOT NULL' : ''}`);
});

console.log('\n\nSample bill:');
const sample = db.prepare("SELECT * FROM bills LIMIT 1").get();
if (sample) {
  console.log(JSON.stringify(sample, null, 2));
} else {
  console.log('No bills found');
}

db.close();
