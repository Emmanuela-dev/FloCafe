/**
 * Verify the Kenyan menu was imported correctly
 * Usage: node verify-menu.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'flo.db');
const db = new Database(dbPath, { readonly: true });

console.log('🔍 FloCafe Menu Verification\n');
console.log('═'.repeat(70));

// Count categories
const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories WHERE deleted_at IS NULL').get();
console.log(`\n📁 Categories: ${categoriesCount.count}`);

const categories = db.prepare('SELECT name, color, icon FROM categories WHERE deleted_at IS NULL ORDER BY sort_order').all();
categories.forEach(cat => {
  console.log(`   ${cat.icon || '📋'} ${cat.name} (${cat.color || 'default'})`);
});

// Count products
const productsCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL').get();
console.log(`\n🍽️ Products: ${productsCount.count}`);

// Products by category
const productsByCategory = db.prepare(`
  SELECT c.name as category, COUNT(p.id) as count
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.deleted_at IS NULL
  GROUP BY c.name
  ORDER BY c.sort_order
`).all();

console.log('\n📊 Products per Category:');
productsByCategory.forEach(row => {
  console.log(`   ${row.category || 'Uncategorized'}: ${row.count} items`);
});

// Price statistics
const priceStats = db.prepare(`
  SELECT 
    MIN(price) as min_price,
    MAX(price) as max_price,
    AVG(price) as avg_price,
    COUNT(*) as count
  FROM products 
  WHERE deleted_at IS NULL
`).get();

console.log('\n💰 Price Statistics:');
console.log(`   Lowest: KES ${priceStats.min_price}`);
console.log(`   Highest: KES ${priceStats.max_price}`);
console.log(`   Average: KES ${Math.round(priceStats.avg_price)}`);

// Products with images
const imagesCount = db.prepare(`
  SELECT COUNT(*) as count 
  FROM products 
  WHERE deleted_at IS NULL 
  AND image_url IS NOT NULL 
  AND image_url != ''
`).get();

console.log(`\n📸 Products with Images: ${imagesCount.count} of ${productsCount.count}`);
if (imagesCount.count === 0) {
  console.log('   💡 Tip: Run "node add-product-images.js" to add images');
}

// Sample products
console.log('\n🔍 Sample Products:');
const sampleProducts = db.prepare(`
  SELECT p.name, p.price, c.name as category, p.is_active
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.deleted_at IS NULL
  ORDER BY RANDOM()
  LIMIT 5
`).all();

sampleProducts.forEach(prod => {
  const status = prod.is_active ? '✅' : '❌';
  console.log(`   ${status} ${prod.name} - KES ${prod.price} (${prod.category})`);
});

// Tags analysis
const tagsProducts = db.prepare(`
  SELECT tags FROM products WHERE deleted_at IS NULL AND tags IS NOT NULL AND tags != ''
`).all();

const tagCounts = {};
tagsProducts.forEach(p => {
  try {
    const tags = JSON.parse(p.tags);
    tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  } catch (e) {
    // Skip invalid JSON
  }
});

if (Object.keys(tagCounts).length > 0) {
  console.log('\n🏷️ Popular Tags:');
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedTags.forEach(([tag, count]) => {
    console.log(`   ${tag}: ${count} items`);
  });
}

// Active vs Inactive
const activeStats = db.prepare(`
  SELECT 
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
  FROM products 
  WHERE deleted_at IS NULL
`).get();

console.log('\n📊 Product Status:');
console.log(`   Active: ${activeStats.active}`);
console.log(`   Inactive: ${activeStats.inactive}`);

console.log('\n' + '═'.repeat(70));
console.log('✅ Verification Complete!\n');

if (productsCount.count === 50 && categoriesCount.count === 14) {
  console.log('🎉 All Kenyan menu items imported successfully!');
  console.log('🌐 View at: http://localhost:3001/menu\n');
} else if (productsCount.count > 0) {
  console.log('⚠️ Menu partially imported:');
  console.log(`   Expected: 50 products, 14 categories`);
  console.log(`   Found: ${productsCount.count} products, ${categoriesCount.count} categories\n`);
} else {
  console.log('❌ No menu items found. Run: node import-kenyan-menu.js\n');
}

db.close();
