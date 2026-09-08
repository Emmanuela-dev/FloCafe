/**
 * Import Kenyan menu data from CSV files
 * Usage: node import-kenyan-menu.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Read CSV files
const categoriesCSV = fs.readFileSync(path.join(__dirname, 'kenyan-categories.csv'), 'utf8');
const productsCSV = fs.readFileSync(path.join(__dirname, 'kenyan-menu.csv'), 'utf8');

// Login first to get token
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

// Import categories
async function importCategories(token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ csv: categoriesCSV });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/menu-csv/import/categories',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Categories import failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Import products
async function importProducts(token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ csv: productsCSV });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/menu-csv/import/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Products import failed: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Main execution
(async () => {
  try {
    console.log('🔐 Logging in...');
    const token = await login();
    console.log('✅ Logged in successfully\n');

    console.log('📦 Importing categories...');
    const catResult = await importCategories(token);
    console.log(`✅ Categories: ${catResult.created} created, ${catResult.skipped} skipped`);
    if (catResult.errors && catResult.errors.length > 0) {
      console.log('⚠️ Errors:', catResult.errors);
    }
    console.log('');

    console.log('🍽️ Importing products...');
    const prodResult = await importProducts(token);
    console.log(`✅ Products: ${prodResult.created} created, ${prodResult.updated} updated, ${prodResult.skipped} skipped`);
    if (prodResult.errors && prodResult.errors.length > 0) {
      console.log('⚠️ Errors:', prodResult.errors);
    }
    console.log('');

    console.log('🎉 Import complete!');
    console.log('\n🌐 View your menu at: http://localhost:3001/menu');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
