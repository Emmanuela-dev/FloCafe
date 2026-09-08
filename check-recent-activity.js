/**
 * Check recent orders and customer activity
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath, { readonly: true });

console.log('🔍 Checking Recent Activity\n');
console.log('═'.repeat(80));

// Check all customers
console.log('\n📋 ALL CUSTOMERS:');
const allCustomers = db.prepare(`
  SELECT id, name, phone, created_at, is_active 
  FROM customers 
  ORDER BY created_at DESC
`).all();

console.log(`Total customers: ${allCustomers.length}\n`);
allCustomers.slice(0, 10).forEach(c => {
  console.log(`- ${c.name} (${c.phone || 'No phone'}) - ${c.is_active ? '✓ Active' : '✗ Inactive'}`);
  console.log(`  ID: ${c.id}`);
  console.log(`  Created: ${c.created_at}`);
});

// Check recent orders
console.log('\n\n📦 RECENT ORDERS:');
const recentOrders = db.prepare(`
  SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    o.created_at,
    o.total,
    o.status,
    c.name as customer_name,
    c.phone as customer_phone
  FROM orders o
  LEFT JOIN customers c ON o.customer_id = c.id
  ORDER BY o.created_at DESC
  LIMIT 20
`).all();

console.log(`Total recent orders: ${recentOrders.length}\n`);
recentOrders.forEach(o => {
  console.log(`Order ${o.order_number}`);
  console.log(`  Customer: ${o.customer_name || 'Guest/None'} (${o.customer_phone || 'No phone'})`);
  console.log(`  Customer ID: ${o.customer_id || 'NULL - NOT LINKED!'}`);
  console.log(`  Total: KES ${o.total}`);
  console.log(`  Created: ${o.created_at}`);
  console.log(`  Status: ${o.status}`);
  console.log('');
});

// Check orders WITHOUT customers
console.log('\n⚠️ ORDERS WITHOUT CUSTOMER LINK:');
const ordersWithoutCustomer = db.prepare(`
  SELECT COUNT(*) as count 
  FROM orders 
  WHERE customer_id IS NULL
`).get();

console.log(`Orders without customer: ${ordersWithoutCustomer.count}`);

// Check customers WITH orders
console.log('\n\n✓ CUSTOMERS WITH ORDERS:');
const customersWithOrders = db.prepare(`
  SELECT 
    c.id,
    c.name,
    c.phone,
    COUNT(o.id) as order_count,
    MAX(o.created_at) as last_order_date
  FROM customers c
  INNER JOIN orders o ON c.id = o.customer_id
  GROUP BY c.id
  ORDER BY last_order_date DESC
`).all();

console.log(`Customers with orders: ${customersWithOrders.length}\n`);
customersWithOrders.forEach(c => {
  console.log(`- ${c.name} (${c.phone || 'No phone'})`);
  console.log(`  Orders: ${c.order_count}`);
  console.log(`  Last order: ${c.last_order_date}`);
});

// Check customers WITHOUT orders
console.log('\n\n✗ CUSTOMERS WITHOUT ORDERS:');
const customersWithoutOrders = db.prepare(`
  SELECT 
    c.id,
    c.name,
    c.phone,
    c.created_at
  FROM customers c
  LEFT JOIN orders o ON c.id = o.customer_id
  WHERE o.id IS NULL
  ORDER BY c.created_at DESC
`).all();

console.log(`Customers without orders: ${customersWithoutOrders.length}\n`);
customersWithoutOrders.forEach(c => {
  console.log(`- ${c.name} (${c.phone || 'No phone'})`);
  console.log(`  Created: ${c.created_at}`);
});

console.log('\n' + '═'.repeat(80));
console.log('💡 SOLUTION:');
console.log('Orders need to have customer_id field set when created.');
console.log('This links the order to the customer in the database.');

db.close();
