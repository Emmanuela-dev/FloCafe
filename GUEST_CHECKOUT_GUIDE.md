# Guest Checkout & Customer Tracking Guide

## 🎯 Short Answer: NO, Customers Don't Need an Account!

Your FloCafe system supports **guest checkout** - customers can order without creating an account.

## 🛒 How It Works

### For Walk-in/Phone Orders
```
Customer → Gives Name + Phone → Staff creates profile → Order tracked ✅
```

**Example:**
1. Customer: "I'd like to order Nyama Choma"
2. Staff: "Sure! What's your name and phone?"
3. Customer: "John Doe, 0712345678"
4. Staff creates minimal profile (just name + phone)
5. Order is linked to that profile
6. ✅ All future orders tracked automatically!

### For Online Orders (Guest Checkout)
```
Customer → Enters Name + Phone at Checkout → Profile auto-created → Order tracked ✅
```

**Example:**
1. Customer browses menu online
2. Adds items to cart
3. At checkout, fills simple form:
   ```
   Name: John Doe
   Phone: 0712345678
   Address: Nairobi, Kenya
   ```
4. System automatically creates customer profile
5. Order placed and tracked
6. ✅ No account/password needed!

## 📋 Minimum Required Information

To track a customer, you only need:

### Absolutely Required:
- ✅ **Name** - Any name (first name is enough)

### Recommended (for better tracking):
- ✅ **Phone Number** - To identify returning customers

### Optional:
- Email
- Address
- Notes

## 🔌 API Endpoints for Guest Checkout

### New Endpoint: Find or Create Customer
```
POST /api/customers/find-or-create
```

**Purpose:** Perfect for guest checkout!
- Checks if customer exists by phone
- If exists: Returns existing customer
- If not: Creates new customer
- Works with minimal data (just name + phone)

**Example Request:**
```json
{
  "name": "John Doe",
  "phone": "0712345678",
  "address": "Nairobi, Kenya"
}
```

**Response:**
```json
{
  "customer": {
    "id": "cust-1234567890-abc123",
    "name": "John Doe",
    "phone": "+254712345678",
    "address": "Nairobi, Kenya"
  },
  "created": true  // false if customer already existed
}
```

## 💡 Integration Examples

### Example 1: Simple Guest Checkout

```javascript
// Frontend: Customer places order
async function guestCheckout(orderDetails) {
  // Step 1: Find or create customer
  const response = await fetch('http://localhost:3001/api/customers/find-or-create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffToken}`
    },
    body: JSON.stringify({
      name: orderDetails.customerName,
      phone: orderDetails.customerPhone,
      address: orderDetails.deliveryAddress
    })
  });
  
  const { customer } = await response.json();
  
  // Step 2: Create order linked to customer
  const orderResponse = await fetch('http://localhost:3001/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffToken}`
    },
    body: JSON.stringify({
      customer_id: customer.id,  // ← Link here!
      type: 'delivery',
      items: orderDetails.items,
      // ... other order details
    })
  });
  
  // Done! Order is now tracked under this customer
}
```

### Example 2: Returning Customer

```javascript
// Same code works for returning customers!
const response = await fetch('/api/customers/find-or-create', {
  method: 'POST',
  body: JSON.stringify({
    name: "John Doe",
    phone: "0712345678"  // Same phone as before
  })
});

const { customer, created } = await response.json();

if (!created) {
  // Customer found! Show their order history
  console.log(`Welcome back ${customer.name}!`);
  console.log(`You've ordered ${customer.visits_count} times`);
}
```

### Example 3: Staff Taking Phone Order

```javascript
// Staff answers phone
// Customer: "I'd like to order..."
// Staff: "Sure! Have you ordered before? What's your phone number?"

const customerPhone = "0712345678";

// Look up customer
const response = await fetch('/api/customers/find-or-create', {
  method: 'POST',
  body: JSON.stringify({
    name: "John Doe",  // Staff asks if not found
    phone: customerPhone
  })
});

const { customer, created } = await response.json();

if (created) {
  console.log("New customer created!");
} else {
  console.log(`Welcome back! Last order: ${customer.last_visit_at}`);
}

// Create order linked to this customer
// ... order creation code
```

## 🎨 Frontend Checkout Flow

### Simple Checkout Form

```html
<form id="checkout-form">
  <h2>Delivery Details</h2>
  
  <!-- Required -->
  <input name="name" placeholder="Your Name" required>
  <input name="phone" placeholder="Phone (0712345678)" required>
  
  <!-- Optional but recommended -->
  <input name="address" placeholder="Delivery Address">
  <textarea name="notes" placeholder="Special instructions (optional)"></textarea>
  
  <button type="submit">Place Order</button>
  
  <p>
    No account needed! We'll remember you by your phone number.
  </p>
</form>
```

### Advanced: Show Order History for Returning Customers

```javascript
document.getElementById('phone').addEventListener('blur', async (e) => {
  const phone = e.target.value;
  
  if (phone.length >= 10) {
    // Check if customer exists
    const response = await fetch(`/api/customers?search=${phone}`);
    const { data } = await response.json();
    
    if (data.length > 0) {
      const customer = data[0];
      showWelcomeBack(customer);
      // Pre-fill form with saved details
      document.getElementById('name').value = customer.name;
      document.getElementById('address').value = customer.address || '';
    }
  }
});

function showWelcomeBack(customer) {
  const message = `
    Welcome back ${customer.name}! 
    You've ordered ${customer.visits_count} times.
    Last order: ${customer.last_visit_at}
  `;
  showNotification(message);
}
```

## 🔐 Optional: Customer Accounts

If you want to offer optional accounts:

### Benefits of Accounts:
- Customers can view their order history online
- Save multiple delivery addresses
- Track loyalty points
- Faster checkout (details saved)
- Order notifications

### How to Implement:

1. **Customer registers (optional):**
```javascript
POST /api/auth/customer/register
{
  "name": "John Doe",
  "phone": "+254712345678",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

2. **Customer logs in (optional):**
```javascript
POST /api/auth/customer/login
{
  "phone": "+254712345678",
  "password": "SecurePass123"
}
```

3. **But guest checkout still works!**
   - No login required
   - Just name + phone at checkout

## ✅ Comparison

### Guest Checkout (Current System)
- ✅ No account needed
- ✅ Just name + phone
- ✅ Orders tracked automatically
- ✅ Instant - no signup process
- ✅ Privacy-friendly
- ❌ Customer can't view history online
- ❌ No online profile management

### With Optional Accounts
- ✅ Everything from guest checkout
- ✅ Plus: Online order history
- ✅ Plus: Profile management
- ✅ Plus: Saved addresses
- ❌ Requires signup process
- ❌ Customer needs to remember password

## 🎯 Recommendation

**Use guest checkout as default!**

Then optionally add:
- "Create account to track orders online" (optional checkbox)
- "View your order history" button → prompts account creation
- Loyalty program that requires account

This way:
- Most customers order quickly without accounts ✅
- Engaged customers can create accounts for extra features ✅
- All orders are tracked either way ✅

## 📊 What Gets Tracked (Guest vs Account)

Both guest checkout and accounts track the same information:

| Data | Guest Checkout | With Account |
|------|---------------|--------------|
| Order history | ✅ Yes | ✅ Yes |
| Payment details | ✅ Yes | ✅ Yes |
| Order timestamps | ✅ Yes | ✅ Yes |
| Items ordered | ✅ Yes | ✅ Yes |
| Delivery address | ✅ Yes | ✅ Yes |
| Statistics | ✅ Yes | ✅ Yes |
| Loyalty points | ✅ Yes | ✅ Yes |
| Online access | ❌ No | ✅ Yes |
| Password | ❌ No | ✅ Yes |

## 🚀 Quick Start

### For Your Online System

1. **At checkout, show a simple form:**
   ```
   Name: [______]
   Phone: [______]
   Address: [______]
   
   [Place Order] button
   
   "No account needed!"
   ```

2. **In your backend:**
   ```javascript
   // When order submitted:
   const customer = await findOrCreateCustomer({
     name: formData.name,
     phone: formData.phone,
     address: formData.address
   });
   
   await createOrder({
     customer_id: customer.id,
     items: cartItems,
     // ...
   });
   ```

3. **Done!** ✅
   - Customer orders without account
   - Order tracked in system
   - Staff can see all their orders
   - Customer can order again with same phone

## 💡 Tips

### For Staff
- Always ask for phone number
- Search existing customers first
- Create minimal profile if new
- Orders automatically link

### For Online System
- Make checkout as simple as possible
- Just name + phone + address
- No password required
- Optional account creation after first order

### For Regular Customers
- They'll appreciate not needing to create account
- System remembers them by phone
- Can offer account creation for loyalty benefits

## ✅ Summary

**Your FloCafe system supports guest checkout!**

- ❌ Customers DON'T need to create accounts
- ✅ Just name + phone is enough
- ✅ Orders tracked automatically
- ✅ Staff can see full order history
- ✅ Works for walk-in, phone, and online orders
- ✅ Optional: Can add accounts later for extra features

**The tracking happens automatically behind the scenes - customers just order and go!**

---

For technical implementation details, see [CUSTOMER_ORDER_TRACKING.md](CUSTOMER_ORDER_TRACKING.md)
