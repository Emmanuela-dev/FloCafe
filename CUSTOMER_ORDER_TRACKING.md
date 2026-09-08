# Customer Order Tracking - FloCafe

## ✅ Feature Implemented

Your FloCafe system now automatically tracks all customer orders with complete details including:
- Order date and time
- Items ordered
- Amount paid
- Payment methods used
- Order status and history
- Staff member who served them

## 🎯 How It Works

### Automatic Tracking

When a customer places an order (online or in-store):

1. **Order is linked to customer** via `customer_id` field
2. **Order details are recorded**:
   - Date/time (`created_at`)
   - Order number
   - Order type (dine-in, takeout, delivery)
   - Items ordered with quantities and prices
   - Special instructions
   - Status (pending, ready, served, completed)

3. **Payment information is captured**:
   - Payment method (cash, card, mobile money, etc.)
   - Amount paid
   - Payment timestamp (`paid_at`)
   - Bill number
   - Payment status

4. **Statistics are updated automatically**:
   - Total orders count
   - Lifetime value (total spent)
   - Average order value
   - Last visit date
   - First visit date

### All Data is Visible

Everything appears in the customer profile without any manual entry needed!

## 📋 API Endpoints

### 1. List All Customers with Order Stats
```
GET /api/customers
```

**Returns:**
- Customer name, phone, email
- Total number of orders (`visits_count`)
- Total amount spent (`total_spent`)
- Last visit date (`last_visit_at`)
- Today's orders count (`orders_today`)
- Total paid amount (`total_paid`)
- Loyalty wallet balance

**Example Response:**
```json
{
  "data": [
    {
      "id": "cust-123",
      "name": "John Doe",
      "phone": "+254712345678",
      "email": "john@example.com",
      "visits_count": 15,
      "total_spent": 7500.00,
      "last_visit_at": "2026-09-08T14:30:00Z",
      "orders_today": 1,
      "total_paid": 7500.00,
      "wallet_balance": 250.00
    }
  ]
}
```

### 2. Get Customer Details with Order History
```
GET /api/customers/:id
```

**Returns:**
- Customer information
- Order history (last 50 orders) with:
  - Order number, date, type, status
  - Total amount, tax, discounts
  - Payment status and methods
  - Server name
  - Timestamps (ordered, served, completed, paid)
- Loyalty wallet transactions
- Statistics (total orders, lifetime value, average order, first/last order dates)

**Example Response:**
```json
{
  "customer": {
    "id": "cust-123",
    "name": "John Doe",
    "phone": "+254712345678",
    "orderHistory": [
      {
        "order_id": 456,
        "order_number": "ORD-20260908-0001",
        "order_type": "dine_in",
        "status": "completed",
        "subtotal": 450.00,
        "tax_amount": 72.00,
        "discount_amount": 0,
        "order_total": 522.00,
        "order_date": "2026-09-08T12:30:00Z",
        "completed_at": "2026-09-08T13:15:00Z",
        "bill_number": "INV-20260908-0001",
        "payment_status": "paid",
        "paid_amount": 522.00,
        "paid_at": "2026-09-08T13:15:30Z",
        "payment_methods": [
          {
            "method": "mpesa",
            "amount": 522.00,
            "timestamp": "2026-09-08T13:15:30Z"
          }
        ],
        "served_by": "Jane Smith"
      }
    ],
    "stats": {
      "total_orders": 15,
      "lifetime_value": 7500.00,
      "average_order_value": 500.00,
      "first_order_date": "2026-01-15T10:00:00Z",
      "last_order_date": "2026-09-08T12:30:00Z"
    },
    "walletBalance": 250.00
  }
}
```

### 3. Get Complete Order Details with Items
```
GET /api/customers/:id/orders
```

**Returns:**
- All orders for the customer
- Each order includes:
  - Full order details
  - All items ordered (with product names, quantities, prices)
  - Payment methods breakdown
  - Server information

**Example Response:**
```json
{
  "orders": [
    {
      "id": 456,
      "order_number": "ORD-20260908-0001",
      "type": "dine_in",
      "status": "completed",
      "total": 522.00,
      "created_at": "2026-09-08T12:30:00Z",
      "items": [
        {
          "product_name": "Nyama Choma",
          "quantity": 1,
          "unit_price": 450.00,
          "subtotal": 450.00
        }
      ],
      "bill_number": "INV-20260908-0001",
      "payment_status": "paid",
      "paid_amount": 522.00,
      "payment_methods": [
        {
          "method": "mpesa",
          "amount": 522.00
        }
      ]
    }
  ]
}
```

### 4. Get Loyalty Wallet History
```
GET /api/customers/:id/wallet
```

Returns loyalty points/cashback transactions.

## 🖥️ Frontend Display

The customer information appears in the **Customers** section of your POS:

### Customer List View
Shows:
- Name
- Phone number
- Total orders
- Total spent
- Last visit date

### Customer Detail View
Shows:
- Personal information
- Order history table with:
  - Date/Time
  - Order number
  - Amount
  - Payment status
  - Items ordered
- Statistics (lifetime value, average order, etc.)
- Loyalty points balance

## 🔄 How Orders Get Linked to Customers

### During Order Creation

When creating an order, include the customer ID:

```javascript
POST /api/orders
{
  "customer_id": "cust-123",  // Link to customer
  "type": "dine_in",
  "items": [
    {
      "product_id": "prod-456",
      "quantity": 1
    }
  ]
}
```

### Customer Lookup

Before creating an order, look up the customer:

1. **By Phone Number:**
```javascript
GET /api/customers?search=0712345678
```

2. **Create New Customer if Not Found:**
```javascript
POST /api/customers
{
  "name": "John Doe",
  "phone": "+254712345678",
  "email": "john@example.com"
}
```

3. **Link Order to Customer:**
Use the returned `customer.id` when creating the order.

## 📱 Online Orders

For online orders:

1. Customer registers/logs in online
2. Places order through online system
3. Order API is called with their `customer_id`
4. Order automatically appears in their history
5. When paid, payment details are recorded
6. Everything syncs to the customer profile

## 🧪 Testing

### Test the Customer Tracking

Run the test script:
```bash
node test-customer-orders.js
```

This will show:
- List of all customers
- Order statistics for each
- Detailed order history
- Payment information

### Create a Test Order with Customer

1. Login to http://localhost:3001
2. Go to POS → New Order
3. Select or create a customer
4. Add items to order
5. Complete payment
6. Check Customers section to see the order appears

## 📊 What Gets Tracked

### Order Information
- ✅ Order number
- ✅ Date and time
- ✅ Order type (dine-in, takeout, delivery)
- ✅ Status (pending, ready, served, completed)
- ✅ Items ordered with quantities
- ✅ Special instructions
- ✅ Guest count
- ✅ Table number (for dine-in)

### Financial Information
- ✅ Subtotal
- ✅ Tax amount
- ✅ Discounts applied
- ✅ Delivery/packaging charges
- ✅ Final total
- ✅ Amount paid
- ✅ Payment methods used
- ✅ Payment timestamp

### Timestamps
- ✅ Order created
- ✅ Cooking started
- ✅ Ready for pickup
- ✅ Served to customer
- ✅ Order completed
- ✅ Payment received

### Additional Data
- ✅ Server/staff member name
- ✅ Bill number
- ✅ Payment status
- ✅ Loyalty points earned/used

## 🎨 Frontend Integration

The frontend already supports this! The customer profile pages automatically fetch and display all this information.

### Customer List Component
Displays summary statistics for all customers.

### Customer Profile Component
Shows complete order history when you click on a customer.

### Order Creation
Links orders to customers during checkout.

## 🔒 Privacy & Security

- Only authorized staff (owner, manager, cashier, waiter) can view customer data
- Customer information is protected by authentication
- No customer data is shared publicly
- GDPR/privacy compliance built-in

## 📈 Business Intelligence

With this tracking, you can:
- Identify your best customers (highest lifetime value)
- Track customer frequency (visits per month)
- Analyze popular items per customer
- Identify payment method preferences
- Track customer acquisition dates
- Calculate customer retention rates
- Segment customers by spending patterns

## 🔄 Real-Time Updates

All customer data updates in real-time:
- New orders appear immediately
- Statistics update automatically
- No manual refresh needed
- Instant sync across all terminals

## 💡 Tips

### For Walk-in Customers
1. Create a customer profile (even minimal: name + phone)
2. Link all their orders to this profile
3. Builds customer history over time
4. Enables loyalty programs

### For Online Orders
1. Customer registration creates profile automatically
2. All online orders link to their account
3. In-store and online history combined
4. Single view of all customer activity

### For Regular Customers
1. Look them up by phone when they arrive
2. See their order history
3. Suggest their usual items
4. Track loyalty points
5. Apply customer-specific discounts

## ✅ Summary

Your FloCafe system now has **complete customer order tracking** with:
- ✅ Automatic order linking
- ✅ Full payment history
- ✅ Detailed timestamps
- ✅ Item-level tracking
- ✅ Server information
- ✅ Real-time statistics
- ✅ API endpoints for integration
- ✅ Frontend display
- ✅ Privacy & security

**Everything is automatic!** When a customer orders online or in-store, their order history, payment details, and timestamps are recorded and displayed in the Customers section.

---

**Test it now:** Create an order in the POS, link it to a customer, and see it appear in their profile instantly!
