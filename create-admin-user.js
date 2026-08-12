/**
 * Quick setup script to create the first admin/owner user
 * Run this to bypass the frontend setup form
 * Usage: node create-admin-user.js
 */

const http = require('http');

const setupData = {
  name: 'Admin',
  password: 'admin123',  // Change this to a secure password
  business_type: 'restaurant',
  setup_profile: 'demo',  // Creates demo data (categories, products, etc.)
  service_model: 'finedine',  // or 'qsr' for quick service
  business_name: 'FloCafe Test',
  country: 'IN',
  currency: 'INR',
  currency_symbol: '₹',
  timezone: 'Asia/Kolkata',
  terms_accepted: true,
  anonymous_data_consent: true,
};

const postData = JSON.stringify(setupData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/setup/initialize',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('Creating admin user...');
console.log('Setup data:', setupData);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nStatus Code:', res.statusCode);
    console.log('Response:', data);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✅ SUCCESS! Admin user created.');
      console.log('\n📝 Login credentials:');
      console.log('   Email: admin@test.local');
      console.log('   Password: admin123');
      console.log('\n🌐 You can now log in at: http://localhost:3000/auth/login');
      console.log('   (or http://localhost:3001 if frontend is built)');
    } else {
      console.log('\n❌ Failed to create user. See response above.');
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ Error:', e.message);
  console.error('\nMake sure the backend server is running:');
  console.error('   node dev-server.js');
});

req.write(postData);
req.end();
