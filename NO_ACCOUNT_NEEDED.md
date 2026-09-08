# ❌ No Account Required!

## Quick Answer

**NO, customers do NOT need to create accounts to order!**

## How It Works

### Customers Just Need:
1. **Name** (required)
2. **Phone** (recommended)

That's it! No passwords, no email verification, no account creation.

## Simple Process

```
Customer gives Name + Phone → Order placed → Automatically tracked ✅
```

## For Walk-in Orders
```
Customer: "I'd like to order Nyama Choma"
Staff: "What's your name and phone?"
Customer: "John, 0712345678"
Staff: Creates order
✅ Done! Order tracked.
```

## For Online Orders
```
Checkout form:
  Name: [John Doe]
  Phone: [0712345678]
  Address: [Nairobi]
  
[Place Order]

✅ No account needed!
✅ Order tracked automatically!
```

## What Gets Tracked

Even without accounts, the system tracks:
- ✅ Order date/time
- ✅ Items ordered
- ✅ Amount paid
- ✅ Payment method
- ✅ Order history
- ✅ Statistics

## New API Endpoint

```
POST /api/customers/find-or-create

Body: {
  "name": "John Doe",
  "phone": "0712345678"
}

Returns: customer object
```

This endpoint:
- Checks if customer exists
- Creates if new
- Returns customer to link with order
- Works with minimal data

## Benefits

### For Customers:
- ✅ No signup process
- ✅ No passwords to remember
- ✅ Quick checkout
- ✅ Privacy-friendly
- ✅ Still get order tracking

### For Business:
- ✅ Less friction = more orders
- ✅ All orders still tracked
- ✅ Customer history maintained
- ✅ Can add accounts later if needed

## Optional: Add Accounts Later

If you want, you can offer **optional** accounts for:
- Viewing order history online
- Loyalty program features
- Saved delivery addresses
- Order notifications

But it's **completely optional** - guest checkout works perfectly!

## Example Integration

```javascript
// At checkout
const { customer } = await fetch('/api/customers/find-or-create', {
  method: 'POST',
  body: JSON.stringify({
    name: customerName,
    phone: customerPhone,
    address: deliveryAddress
  })
});

// Create order
await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    customer_id: customer.id,  // ← Links automatically
    items: cartItems
  })
});

// ✅ Order tracked without customer needing account!
```

## Summary

- ❌ **No account required**
- ✅ **Just name + phone**
- ✅ **Orders tracked automatically**
- ✅ **Works for all order types**
- ✅ **Staff can see full history**

**Your FloCafe system is designed for frictionless ordering with complete tracking!**

---

For detailed guide, see [GUEST_CHECKOUT_GUIDE.md](GUEST_CHECKOUT_GUIDE.md)
