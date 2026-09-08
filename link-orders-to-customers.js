/**
 * Link existing orders to customers
 * Creates customer profiles for orders that don't have one
 * 
 * Usage: node link-orders-to-customers.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath);

console.log('🔗 Linking Orders to Customers\n');
console.log('═'.repeat(80));

// Get orders without customer_id
const ordersWithoutCustomer = db.prepare(`
  SELECT 
    o.id,
    o.order_number,
    o.created_at,
    o.total,
    o.type,
    b.bill_number,
    b.payment_details
  FROM orders o
  LEFT JOIN bills b ON b.order_id = o.id
  WHERE o.customer_id IS NULL
  ORDER BY o.created_at DESC
`).all();

console.log(`\nFound ${ordersWithoutCustomer.length} orders without customers\n`);

if (ordersWithoutCustomer.length === 0) {
  console.log('✅ All orders already have customers!');
  db.close();
  process.exit(0);
}

let created = 0;
let linked = 0;

ordersWithoutCustomer.forEach((order, idx) => {
  console.log(`\n${idx + 1}. Order ${order.order_number}`);
  console.log(`   Date: ${order.created_at}`);
  console.log(`   Type: ${order.type}`);
  console.log(`   Total: KES ${order.total}`);
  
  // Create a guest customer for this order
  const customerName = `Guest Customer ${order.order_number}`;
  const customerId = 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  try {
    // Insert customer
    db.prepare(`
      INSERT INTO customers (id, name, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(
      customerId,
      customerName,
      order.created_at,  // Use order date as customer creation date
      order.created_at
    );
    
    created++;
    console.log(`   ✓ Created customer: ${customerName} (${customerId})`);
    
    // Link order to customer
    db.prepare(`
      UPDATE orders SET customer_id = ? WHERE id = ?
    `).run(customerId, order.id);
    
    // Link bill to customer if exists
    if (order.bill_number) {
      db.prepare(`
        UPDATE bills SET customer_id = ? WHERE order_id = ?
      `).run(customerId, order.id);
    }
    
    linked++;
    console.log(`   ✓ Linked order to customer`);
    
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }
});

console.log('\n' + '═'.repeat(80));
console.log(`\n✅ Summary:`);
console.log(`   Customers created: ${created}`);
console.log(`   Orders linked: ${linked}`);

// Verify
const stillOrphaned = db.prepare(`
  SELECT COUNT(*) as count FROM orders WHERE customer_id IS NULL
`).get();

console.log(`   Orders still without customer: ${stillOrphaned.count}`);

if (stillOrphaned.count === 0) {
  console.log('\n🎉 All orders now have customers!');
  console.log('✓ Orders will appear in customer dashboard');
  console.log('✓ Check at: http://localhost:3001/customers');
}

db.close();
