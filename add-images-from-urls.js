/**
 * Add product images from URLs
 * 
 * This script fetches images from public URLs and adds them to products.
 * Useful for: stock photos, supplier catalogs, or migrating from another system
 * 
 * Usage: node add-images-from-urls.js
 */

const http = require('http');

// Map product names to image URLs
// Replace these with your actual image URLs
const productImageUrls = {
  'Ugali': 'https://example.com/images/ugali.jpg',
  'Nyama Choma': 'https://example.com/images/nyama-choma.jpg',
  'Sukuma Wiki': 'https://example.com/images/sukuma-wiki.jpg',
  'Chapati': 'https://example.com/images/chapati.jpg',
  'Mandazi': 'https://example.com/images/mandazi.jpg',
  // Add more products here...
};

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

// Get all products
async function getProducts(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products',
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
          resolve(result.products);
        } else {
          reject(new Error(`Failed to get products: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Fetch image from URL (backend will download and convert to data URI)
async function fetchImageFromUrl(token, url) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ url });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/products/fetch-url',
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
          const result = JSON.parse(data);
          resolve(result.data);
        } else {
          reject(new Error(`Failed to fetch image: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Update product with image
async function updateProductImage(token, productId, imageDataUri) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ image_url: imageDataUri });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/products/${productId}`,
      method: 'PUT',
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
          reject(new Error(`Failed to update product: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Main function
(async () => {
  console.log('🌐 FloCafe Image Importer from URLs\n');
  
  if (Object.keys(productImageUrls).length === 0) {
    console.log('⚠️ No product URLs configured!');
    console.log('\n📋 Edit this script and add your image URLs:');
    console.log('const productImageUrls = {');
    console.log('  "Product Name": "https://example.com/image.jpg",');
    console.log('  ...');
    console.log('};\n');
    return;
  }
  
  try {
    console.log('🔐 Logging in...');
    const token = await login();
    console.log('✅ Logged in\n');
    
    console.log('📦 Loading products...');
    const products = await getProducts(token);
    console.log(`✅ Found ${products.length} products\n`);
    
    let added = 0;
    let skipped = 0;
    let failed = 0;
    
    console.log('🚀 Processing...\n');
    
    for (const [productName, imageUrl] of Object.entries(productImageUrls)) {
      const product = products.find(p => p.name === productName);
      
      if (!product) {
        console.log(`⚠️ ${productName} - product not found`);
        failed++;
        continue;
      }
      
      if (product.has_image) {
        console.log(`⏭️ ${productName} - already has image`);
        skipped++;
        continue;
      }
      
      try {
        console.log(`📥 ${productName} - fetching from ${imageUrl}...`);
        const dataUri = await fetchImageFromUrl(token, imageUrl);
        
        console.log(`📤 ${productName} - uploading...`);
        await updateProductImage(token, product.id, dataUri);
        
        console.log(`✅ ${productName} - image added`);
        added++;
      } catch (error) {
        console.log(`❌ ${productName} - failed: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('📊 Summary:');
    console.log(`✅ Added: ${added}`);
    console.log(`⏭️ Skipped (already have images): ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('═'.repeat(50));
    
    if (added > 0) {
      console.log('\n🌐 View your menu at: http://localhost:3001/menu');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
