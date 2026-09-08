# CSV Import Guide - FloCafe

## Quick Start

Your FloCafe system now has **50 Kenyan menu items** imported across **14 categories**!

### View Your Menu
Open: **http://localhost:3001/menu**

---

## What Was Imported

### Categories (14)
- Main Dishes, Vegetables, Breads, Snacks, Salads, Sides
- Hot Beverages, Cold Beverages, Soft Drinks, Alcoholic Beverages
- Breakfast Combos, Lunch Combos, Dinner Specials, Street Food

### Products (50)
Traditional Kenyan foods including:
- **Main Dishes**: Ugali, Nyama Choma, Githeri, Pilau, Fish Fry, etc.
- **Vegetables**: Sukuma Wiki, Irio, Mukimo, etc.
- **Breads**: Chapati, Mandazi, Mahamri
- **Beverages**: Chai ya Maziwa, Madafu, Fresh Juices, Sodas, Beers
- **Combos**: Meal deals and platters
- **Street Food**: Mkate Mayai, Mutura, Viazi Karai

---

## CSV Format Reference

### Categories CSV
```csv
name,description,color,icon,sort_order
Beverages,Hot and cold drinks,blue,☕,1
Food,Snacks and meals,green,🍔,2
```

**Fields:**
- `name` (required) - Category name
- `description` - Brief description
- `color` - Tailwind color (blue, green, red, etc.)
- `icon` - Emoji icon
- `sort_order` - Display order (lower = first)

### Products CSV
```csv
id,sku,name,category,price,description,cost,tax_type,tax_rate,tax_category,tax_behavior,cashback_percent,tags,is_active
,,Cappuccino,Beverages,150,Rich espresso,50,inclusive,16,,,0,"veg,bestseller",yes
prod-123,,Espresso,Beverages,100,,40,inclusive,16,,,0,veg,yes
```

**Fields:**
- `id` - Leave empty for new items, or provide to update existing
- `sku` - Stock keeping unit (optional)
- `name` (required) - Product name
- `category` - Must match existing category name
- `price` (required) - Selling price (Kenyan Shillings)
- `description` - Product description
- `cost` - Cost price
- `tax_type` - `none`, `inclusive`, or `exclusive`
- `tax_rate` - Tax percentage (16 for Kenya VAT)
- `tax_category` - Advanced tax category ID
- `tax_behavior` - `country_default`, `inclusive`, `exclusive`, or `exempt`
- `cashback_percent` - Loyalty cashback percentage
- `tags` - Comma-separated tags (veg, non_veg, bestseller, etc.)
- `is_active` - `yes` or `no`

---

## How to Import CSV

### Method 1: Using the Import Script (Recommended)

1. **Edit the CSV files:**
   - `kenyan-categories.csv` - Add/modify categories
   - `kenyan-menu.csv` - Add/modify products

2. **Run the import:**
   ```bash
   node import-kenyan-menu.js
   ```

3. **Check the results:**
   - Created, updated, and skipped counts
   - Any error messages

### Method 2: Via API (Programmatic)

```bash
# Login first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@flocafe.ke","password":"Admin123"}'

# Get the access_token from response, then:

# Import categories
curl -X POST http://localhost:3001/api/menu-csv/import/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"csv":"name,description\nTest,A test category"}'

# Import products
curl -X POST http://localhost:3001/api/menu-csv/import/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"csv":"name,price\nTest Product,100"}'
```

### Method 3: Via Frontend (Coming Soon)
The frontend UI will provide a file upload interface.

---

## Adding Product Images

### Option 1: Via Frontend UI (Recommended)
1. Login to http://localhost:3001
2. Go to **Menu Management** → **Products**
3. Click on a product
4. Click **Upload Image** or **Add Image**
5. Choose an image file (PNG, JPG, WEBP)
6. Crop and adjust
7. Save

### Option 2: Via API (Base64 Data URI)

Images must be Base64-encoded data URIs:

```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('ugali.jpg');
const base64Image = imageBuffer.toString('base64');
const dataUri = `data:image/jpeg;base64,${base64Image}`;

// Update product with image
const response = await fetch('http://localhost:3001/api/products/PRODUCT_ID', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ image_url: dataUri })
});
```

**Supported formats:** PNG, JPEG, WEBP
**Max size:** 50,000 characters (~36 KB after encoding)

### Option 3: Via External URL Fetch

```javascript
// The backend will fetch and convert the image
const response = await fetch('http://localhost:3001/api/products/fetch-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ 
    url: 'https://example.com/ugali-image.jpg' 
  })
});

const { data } = await response.json();
// data is now a Base64 data URI you can use to update the product
```

---

## Creating a Bulk Image Import Script

Here's a template for adding images to multiple products:

```javascript
const fs = require('fs');
const http = require('http');

// Map of product names to image files
const productImages = {
  'Ugali': 'images/ugali.jpg',
  'Nyama Choma': 'images/nyama-choma.jpg',
  'Sukuma Wiki': 'images/sukuma-wiki.jpg',
  // ... add more
};

async function addImagesToProducts(token) {
  // Get all products
  const products = await fetchProducts(token);
  
  for (const product of products) {
    const imagePath = productImages[product.name];
    if (!imagePath || !fs.existsSync(imagePath)) continue;
    
    // Read and encode image
    const buffer = fs.readFileSync(imagePath);
    const base64 = buffer.toString('base64');
    const ext = imagePath.split('.').pop();
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64}`;
    
    // Update product
    await updateProduct(token, product.id, { image_url: dataUri });
    console.log(`✅ Added image for ${product.name}`);
  }
}

// Run it
addImagesToProducts(YOUR_TOKEN);
```

---

## Export Your Current Menu

### Export Categories
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/menu-csv/export/categories \
  -o categories-export.csv
```

### Export Products
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/menu-csv/export/products \
  -o products-export.csv
```

### Via API
```
GET /api/menu-csv/export/categories
GET /api/menu-csv/export/products
GET /api/menu-csv/export/addons
```

---

## Download CSV Templates

```bash
# Categories template
curl http://localhost:3001/api/menu-csv/template/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o categories-template.csv

# Products template
curl http://localhost:3001/api/menu-csv/template/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o products-template.csv

# Addons template
curl http://localhost:3001/api/menu-csv/template/addons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o addons-template.csv
```

---

## Tips for Kenyan Menu

### Common Tags
- `veg` - Vegetarian
- `non_veg` - Contains meat/fish
- `bestseller` - Popular items
- `spicy` - Spicy dishes
- `healthy` - Healthy options
- `cold` - Cold beverages
- `hot` - Hot beverages
- `local` - Traditional Kenyan
- `combo` - Meal combinations
- `alcohol` - Alcoholic beverages

### Pricing Guide (Kenya)
- **Breakfast**: KES 50-150
- **Snacks**: KES 50-100
- **Main Dishes**: KES 150-500
- **Beverages**: KES 50-150
- **Alcohol**: KES 150-300
- **Combos**: KES 200-700

### Tax Rate
Kenya VAT: **16%**
Use `tax_type: inclusive` and `tax_rate: 16` for most items.

---

## Troubleshooting

### Import Errors

**"Category not found"**
- Import categories first, then products
- Ensure category names match exactly (case-sensitive)

**"Invalid price"**
- Price must be a number (no currency symbols)
- Use decimal point for cents (150.50)

**"Duplicate name"**
- Products with same name + category will be skipped
- Provide an `id` column to update existing products

### Image Issues

**"Image too large"**
- Compress images before encoding
- Max size: ~36 KB encoded
- Recommended: 512x512 pixels, WEBP format

**"Invalid image format"**
- Only PNG, JPEG, WEBP supported
- Must be Base64 data URI: `data:image/jpeg;base64,xxx`

---

## Next Steps

1. **Customize the menu:**
   - Edit `kenyan-menu.csv` with your actual prices
   - Add/remove items as needed
   - Re-run the import script

2. **Add images:**
   - Collect product photos
   - Use the frontend UI or bulk script
   - Optimize images (512x512 WEBP recommended)

3. **Set up categories:**
   - Adjust colors and icons
   - Set proper sort orders
   - Add descriptions

4. **Configure addons:**
   - Create addon groups (sizes, extras, etc.)
   - Link to products via the UI

5. **Test the menu:**
   - View at http://localhost:3001/menu
   - Create test orders
   - Check pricing and taxes

---

## Files Created

- `kenyan-categories.csv` - 14 Kenyan food categories
- `kenyan-menu.csv` - 50 Kenyan menu items
- `import-kenyan-menu.js` - Import automation script
- `CSV_IMPORT_GUIDE.md` - This guide

## Support

For issues or questions:
- Check the [API documentation](docs/API.md)
- Review error messages in the import output
- Check server logs in the terminal

---

**Your FloCafe system is now ready with a complete Kenyan menu! 🇰🇪**
