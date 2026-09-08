/**
 * Bulk add images to products
 * 
 * Usage:
 * 1. Create an 'images' folder with product photos named after the products
 * 2. Run: node add-product-images.js
 * 
 * Image naming convention:
 * - "Ugali.jpg" → matches product "Ugali"
 * - "nyama-choma.png" → matches product "Nyama Choma"
 * - Images can be JPG, PNG, or WEBP
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const MAX_IMAGE_SIZE = 36 * 1024; // 36 KB (will be larger after Base64 encoding)

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

// Fetch image from URL
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

// Convert image file to data URI
function imageToDataUri(filePath) {
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString('base64');
  const ext = path.extname(filePath).toLowerCase().slice(1);
  
  let mimeType;
  if (ext === 'png') mimeType = 'image/png';
  else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
  else if (ext === 'webp') mimeType = 'image/webp';
  else throw new Error(`Unsupported format: ${ext}`);
  
  const dataUri = `data:${mimeType};base64,${base64}`;
  
  // Check size (approximate, Base64 adds ~33% overhead)
  if (dataUri.length > 50000) {
    console.warn(`⚠️ Warning: ${path.basename(filePath)} may be too large (${Math.round(dataUri.length/1000)}KB)`);
  }
  
  return dataUri;
}

// Normalize product name for file matching
function normalizeForMatching(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Find matching image file for product
function findImageForProduct(productName, imagesDir) {
  if (!fs.existsSync(imagesDir)) return null;
  
  const files = fs.readdirSync(imagesDir);
  const normalized = normalizeForMatching(productName);
  
  // Try exact matches first
  for (const file of files) {
    const nameWithoutExt = path.basename(file, path.extname(file));
    if (normalizeForMatching(nameWithoutExt) === normalized) {
      return path.join(imagesDir, file);
    }
  }
  
  return null;
}

// Main function
(async () => {
  console.log('🖼️ FloCafe Bulk Image Uploader\n');
  
  // Check if images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('📁 Creating images directory...');
    fs.mkdirSync(IMAGES_DIR);
    console.log(`✅ Created: ${IMAGES_DIR}`);
    console.log('\n📋 Instructions:');
    console.log('1. Add product images to the images/ folder');
    console.log('2. Name images after your products (e.g., "Ugali.jpg", "Nyama Choma.png")');
    console.log('3. Run this script again: node add-product-images.js\n');
    console.log('💡 Tip: Images should be 512x512 pixels, WEBP format for best results');
    return;
  }
  
  try {
    console.log('🔐 Logging in...');
    const token = await login();
    console.log('✅ Logged in\n');
    
    console.log('📦 Loading products...');
    const products = await getProducts(token);
    console.log(`✅ Found ${products.length} products\n`);
    
    const imageFiles = fs.readdirSync(IMAGES_DIR).filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });
    
    console.log(`📸 Found ${imageFiles.length} image(s) in images/ folder\n`);
    
    if (imageFiles.length === 0) {
      console.log('⚠️ No images found. Add some images to the images/ folder and try again.');
      return;
    }
    
    let added = 0;
    let skipped = 0;
    let failed = 0;
    
    console.log('🚀 Processing...\n');
    
    for (const product of products) {
      // Skip if already has an image
      if (product.has_image) {
        console.log(`⏭️ ${product.name} - already has image`);
        skipped++;
        continue;
      }
      
      const imagePath = findImageForProduct(product.name, IMAGES_DIR);
      
      if (!imagePath) {
        continue; // No image file found for this product
      }
      
      try {
        console.log(`📤 ${product.name} - uploading...`);
        const dataUri = imageToDataUri(imagePath);
        await updateProductImage(token, product.id, dataUri);
        console.log(`✅ ${product.name} - image added`);
        added++;
      } catch (error) {
        console.log(`❌ ${product.name} - failed: ${error.message}`);
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
