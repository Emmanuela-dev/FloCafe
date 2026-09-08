# Kenyan Menu Setup - Complete Guide

## ✅ What's Been Done

Your FloCafe system now has:
- **50 Kenyan menu items** imported and ready to use
- **14 food categories** organized by meal type
- Full CSV import/export functionality working
- Scripts for bulk image management
- Complete documentation

## 🚀 Quick Start

### 1. Access Your System
```bash
# Backend should already be running
# If not, start it with:
node dev-server.js
```

Open: **http://localhost:3001**

Login with:
- Email: `admin@flocafe.ke`
- Password: `Admin123`

### 2. View Your Menu
Go to: **http://localhost:3001/menu**

You'll see 50 Kenyan dishes organized in categories!

## 📋 What's Included

### Categories (14)
1. **Main Dishes** - Ugali, Nyama Choma, Pilau, Fish Fry, etc.
2. **Vegetables** - Sukuma Wiki, Irio, Mukimo
3. **Breads** - Chapati, Mandazi, Mahamri
4. **Snacks** - Samosas, Bhaji, Viazi Karai
5. **Salads** - Kachumbari
6. **Sides** - Coconut Rice
7. **Hot Beverages** - Chai, Kahawa, Uji
8. **Cold Beverages** - Madafu, Fresh Juices
9. **Soft Drinks** - Stoney, Fanta, Coke, Sprite
10. **Alcoholic Beverages** - Tusker, White Cap, Dawa
11. **Breakfast Combos** - Mandazi na Chai, etc.
12. **Lunch Combos** - Chapati na Dengu, Fish & Chips
13. **Dinner Specials** - Nyama Choma Platter, etc.
14. **Street Food** - Mkate Mayai, Mutura, Smokies

### Products (50)
All priced in Kenyan Shillings (KES) with:
- 16% VAT (inclusive pricing)
- Proper categorization
- Tags (veg/non_veg, bestseller, spicy, etc.)
- Cost prices for margin tracking

## 🖼️ Adding Product Images

### Option 1: Frontend UI (Easiest)
1. Login to http://localhost:3001
2. Navigate to Menu Management → Products
3. Click on any product
4. Click "Upload Image"
5. Select image file and crop
6. Save

### Option 2: Bulk Upload from Local Files
1. Create an `images/` folder in the project root
2. Add photos named after your products:
   - `Ugali.jpg`
   - `Nyama Choma.png`
   - `Chapati.webp`
3. Run:
```bash
node add-product-images.js
```

### Option 3: Bulk Upload from URLs
1. Edit `add-images-from-urls.js`
2. Add your image URLs:
```javascript
const productImageUrls = {
  'Ugali': 'https://example.com/ugali.jpg',
  'Nyama Choma': 'https://example.com/nyama-choma.jpg',
  // ... more
};
```
3. Run:
```bash
node add-images-from-urls.js
```

## 📝 Modifying the Menu

### Update Prices or Details
1. Edit `kenyan-menu.csv`
2. Modify prices, descriptions, or any field
3. Re-import:
```bash
node import-kenyan-menu.js
```

### Add New Items
Add rows to `kenyan-menu.csv`:
```csv
,,Githeri Mix,Main Dishes,140,Beans and maize,50,inclusive,16,,,0,veg,yes
```

### Add New Categories
Add rows to `kenyan-categories.csv`:
```csv
Desserts,Sweet treats,pink,🍰,15
```

## 📊 CSV Format Quick Reference

### Products CSV Fields
- `id` - Leave empty for new, provide to update
- `name` (required) - Product name
- `category` (required) - Must match existing category
- `price` (required) - In KES (no symbols)
- `description` - Product description
- `cost` - Cost price for margin tracking
- `tax_type` - `inclusive`, `exclusive`, or `none`
- `tax_rate` - Tax percentage (16 for Kenya)
- `tags` - Comma-separated (veg, non_veg, bestseller, etc.)
- `is_active` - `yes` or `no`

### Common Tags for Kenyan Food
- `veg` - Vegetarian
- `non_veg` - Contains meat/fish
- `bestseller` - Popular items
- `spicy` - Spicy dishes
- `healthy` - Healthy options
- `local` - Traditional Kenyan
- `combo` - Meal combinations
- `hot` - Hot beverages
- `cold` - Cold beverages
- `alcohol` - Alcoholic drinks

## 🔧 Useful Commands

### Menu Management
```bash
# Import Kenyan menu
node import-kenyan-menu.js

# Add images from local files
node add-product-images.js

# Add images from URLs
node add-images-from-urls.js

# Export current menu
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/menu-csv/export/products \
  -o my-menu.csv
```

### System Management
```bash
# Start backend
node dev-server.js

# Check users
node check-users.js

# Reset password
node reset-password.js admin@flocafe.ke NewPassword123

# Set Master PIN
node set-master-pin.js 1234
```

## 📖 Documentation Files

- **LOGIN_CREDENTIALS.md** - Login details and system access
- **CSV_IMPORT_GUIDE.md** - Complete CSV import documentation
- **KENYAN_MENU_README.md** - This file

## 💡 Tips for Success

### Pricing Strategy
- **Breakfast**: KES 50-150
- **Snacks**: KES 50-100
- **Main Dishes**: KES 150-500
- **Beverages**: KES 50-150
- **Alcohol**: KES 150-300
- **Combos**: KES 200-700

### Image Optimization
- **Format**: WEBP (best compression)
- **Size**: 512x512 pixels
- **Max file size**: ~36 KB before encoding
- **Quality**: 80-85% works well

### Categories
- Use clear, descriptive names
- Add emoji icons for visual appeal
- Set sort_order to control display sequence
- Use Tailwind colors: blue, green, red, amber, etc.

### Tags Best Practices
- Keep them simple and consistent
- Use lowercase with underscores
- Common ones: veg, non_veg, bestseller, new, spicy
- Shows up in product filters

## 🆘 Troubleshooting

### "Category not found" Error
- Import categories before products
- Check category names match exactly (case-sensitive)

### "Invalid price" Error
- Remove currency symbols (KES, Ksh, etc.)
- Use numbers only: `150` not `KES 150`
- Decimals ok: `150.50`

### Images Too Large
- Compress images before upload
- Use online tools or: `npm install sharp` for batch processing
- Recommended: 512x512 WEBP at 85% quality

### Import Skipped Items
- Products with same name+category are skipped
- To update, provide the `id` column
- Check for typos in category names

## 🎯 Next Steps

1. **Review the Menu**
   - Check all items loaded correctly
   - Verify prices match your actual pricing
   - Adjust descriptions as needed

2. **Add Images**
   - Collect or download product photos
   - Use the bulk upload scripts
   - Or add via the UI

3. **Customize**
   - Add/remove items
   - Adjust categories
   - Set up combos and specials

4. **Set Up Addons**
   - Create addon groups (sizes, extras)
   - Link to products
   - Test with orders

5. **Test the System**
   - Create test orders
   - Check KDS display
   - Print test receipts
   - Verify tax calculations

## 📞 Support

For detailed documentation:
- API docs: `docs/API.md`
- Database schema: Run `node check-schema.js`
- Error logs: Check terminal where dev-server is running

## 🇰🇪 About the Menu

This menu includes authentic Kenyan dishes:
- **Traditional staples**: Ugali, Githeri, Mukimo
- **Popular mains**: Nyama Choma, Pilau, Fish Fry
- **Street food favorites**: Mkate Mayai, Mutura, Viazi Karai
- **Beverages**: Chai ya Maziwa, Madafu, Stoney Tangawizi
- **Combos**: Traditional meal combinations

All items are priced in Kenyan Shillings with 16% VAT included.

---

**Your FloCafe system is ready to serve authentic Kenyan cuisine! 🇰🇪**

Need help? Check the documentation files or review the terminal output for detailed error messages.
