/**
 * Test script to demonstrate customer order tracking
 * Shows how customer order history appears automatically
 * 
 * Usage: node test-customer-orders.js
 */

const http = require('http');

// Login to get token
async function login() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'admin@flocafe.ke',
      password: 'Admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          resolve(result.access_token);
        } else {
          reject(new Error(`Login failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Get all customers
async function getCustomers(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/customers',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          resolve(result.data);
        } else {
          reject(new Error(`Failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Get customer details with order history
async function getCustomerDetails(token, customerId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/customers/${customerId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          resolve(result.customer);
        } else {
          reject(new Error(`Failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Get complete order history
async function getCustomerOrders(token, customerId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/customers/${customerId}/orders`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          resolve(result.orders);
        } else {
          reject(new Error(`Failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Format date/time
function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-KE', { 
    dateStyle: 'medium', 
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi'
  });
}

// Format currency
function formatKES(amount) {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Main function
(async () => {
  console.log('🔍 Customer Order Tracking Demo\n');
  console.log('═'.repeat(80));
  
  try {
    console.log('\n🔐 Logging in...');
    const token = await login();
    console.log('✅ Logged in\n');
    
    console.log('📋 Fetching customers...');
    const customers = await getCustomers(token);
    console.log(`✅ Found ${customers.length} customers\n`);
    
    // Show customer list with summary
    console.log('👥 CUSTOMER LIST');
    console.log('═'.repeat(80));
    console.log('Name'.padEnd(25) + 'Phone'.padEnd(18) + 'Orders'.padEnd(10) + 'Spent'.padEnd(15) + 'Last Visit');
    console.log('─'.repeat(80));
    
    customers.slice(0, 10).forEach(customer => {
      const name = (customer.name || 'Unknown').padEnd(25);
      const phone = (customer.phone || 'N/A').padEnd(18);
      const orders = String(customer.visits_count || 0).padEnd(10);
      const spent = formatKES(customer.total_spent || 0).padEnd(15);
      const lastVisit = customer.last_visit_at 
        ? new Date(customer.last_visit_at).toLocaleDateString('en-KE')
        : 'Never';
      
      console.log(`${name}${phone}${orders}${spent}${lastVisit}`);
    });
    
    // Pick a customer with orders
    const customerWithOrders = customers.find(c => c.visits_count > 0);
    
    if (!customerWithOrders) {
      console.log('\n⚠️ No customers with orders found.');
      console.log('💡 Create an order in the POS system and link it to a customer to see the tracking in action!\n');
      return;
    }
    
    console.log('\n\n📊 DETAILED CUSTOMER VIEW');
    console.log('═'.repeat(80));
    console.log(`Customer: ${customerWithOrders.name}`);
    console.log(`Phone: ${customerWithOrders.phone || 'N/A'}`);
    console.log(`Email: ${customerWithOrders.email || 'N/A'}`);
    console.log('─'.repeat(80));
    
    // Get detailed information
    const details = await getCustomerDetails(token, customerWithOrders.id);
    
    console.log('\n📈 CUSTOMER STATISTICS');
    if (details.stats) {
      console.log(`Total Orders: ${details.stats.total_orders}`);
      console.log(`Lifetime Value: ${formatKES(details.stats.lifetime_value)}`);
      console.log(`Average Order: ${formatKES(details.stats.average_order_value)}`);
      console.log(`First Order: ${formatDateTime(details.stats.first_order_date)}`);
      console.log(`Last Order: ${formatDateTime(details.stats.last_order_date)}`);
    }
    
    console.log(`\nWallet Balance: ${formatKES(details.walletBalance || 0)}`);
    
    // Show order history
    if (details.orderHistory && details.orderHistory.length > 0) {
      console.log('\n\n📋 ORDER HISTORY (Last 10)');
      console.log('═'.repeat(80));
      
      details.orderHistory.slice(0, 10).forEach((order, idx) => {
        console.log(`\n${idx + 1}. Order #${order.order_number}`);
        console.log('─'.repeat(80));
        console.log(`   Date/Time: ${formatDateTime(order.order_date)}`);
        console.log(`   Type: ${order.order_type}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Guest Count: ${order.guest_count || 1}`);
        if (order.special_instructions) {
          console.log(`   Instructions: ${order.special_instructions}`);
        }
        console.log(`   Subtotal: ${formatKES(order.subtotal)}`);
        if (order.tax_amount > 0) {
          console.log(`   Tax: ${formatKES(order.tax_amount)}`);
        }
        if (order.discount_amount > 0) {
          console.log(`   Discount: -${formatKES(order.discount_amount)}`);
        }
        console.log(`   Total: ${formatKES(order.order_total)}`);
        
        if (order.bill_number) {
          console.log(`\n   💳 Payment Information:`);
          console.log(`   Bill Number: ${order.bill_number}`);
          console.log(`   Payment Status: ${order.payment_status}`);
          console.log(`   Amount Paid: ${formatKES(order.paid_amount || 0)}`);
          console.log(`   Paid At: ${formatDateTime(order.paid_at)}`);
          
          if (order.payment_methods && order.payment_methods.length > 0) {
            console.log(`   Payment Methods:`);
            order.payment_methods.forEach(pm => {
              console.log(`     - ${pm.method}: ${formatKES(pm.amount)}`);
            });
          }
        }
        
        if (order.served_by) {
          console.log(`   Served by: ${order.served_by}`);
        }
        
        if (order.completed_at) {
          console.log(`   Completed: ${formatDateTime(order.completed_at)}`);
        }
      });
    }
    
    // Get complete order details with items
    console.log('\n\n🛒 COMPLETE ORDER DETAILS (with items)');
    console.log('═'.repeat(80));
    
    const fullOrders = await getCustomerOrders(token, customerWithOrders.id);
    
    if (fullOrders.length > 0) {
      const latestOrder = fullOrders[0];
      console.log(`\nOrder #${latestOrder.order_number}`);
      console.log('─'.repeat(80));
      console.log(`Date: ${formatDateTime(latestOrder.created_at)}`);
      console.log(`Type: ${latestOrder.type}`);
      console.log(`Status: ${latestOrder.status}`);
      
      console.log('\nItems:');
      if (latestOrder.items) {
        latestOrder.items.forEach((item, idx) => {
          console.log(`  ${idx + 1}. ${item.product_name || 'Unknown Item'}`);
          console.log(`     Quantity: ${item.quantity}`);
          console.log(`     Price: ${formatKES(item.unit_price)}`);
          console.log(`     Total: ${formatKES(item.subtotal)}`);
        });
      }
      
      console.log(`\nOrder Total: ${formatKES(latestOrder.total)}`);
      
      if (latestOrder.bill_number) {
        console.log(`\n💳 Payment:`);
        console.log(`Status: ${latestOrder.payment_status}`);
        console.log(`Paid: ${formatKES(latestOrder.paid_amount || 0)}`);
        if (latestOrder.payment_methods) {
          console.log(`Methods: ${latestOrder.payment_methods.map(pm => pm.method).join(', ')}`);
        }
      }
    }
    
    console.log('\n\n═'.repeat(80));
    console.log('✅ Demo Complete!');
    console.log('\n📖 API Endpoints Available:');
    console.log('   GET /api/customers - List all customers with order stats');
    console.log('   GET /api/customers/:id - Customer details with order history');
    console.log('   GET /api/customers/:id/orders - Complete order details with items');
    console.log('   GET /api/customers/:id/wallet - Loyalty wallet transactions');
    console.log('\n💡 When a customer places an online order:');
    console.log('   1. Order is automatically linked to their customer ID');
    console.log('   2. Order details appear in their history immediately');
    console.log('   3. Payment information is tracked');
    console.log('   4. Statistics are updated automatically');
    console.log('   5. All timestamps (order date, served time, paid time) are recorded\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
