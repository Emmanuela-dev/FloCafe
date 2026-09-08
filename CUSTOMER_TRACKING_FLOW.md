# Customer Order Tracking - Visual Flow Guide

## 🔄 How Customer Orders are Tracked (Step-by-Step)

### Scenario: Customer Orders Online

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Customer Places Order Online                            │
└─────────────────────────────────────────────────────────────────┘

Customer: "John Doe" (+254712345678)
Orders:
  - 1x Nyama Choma (KES 450)
  - 2x Ugali (KES 150 each)
  - 1x Chai ya Maziwa (KES 50)

Timestamp: 2026-09-08 14:30:00

        ↓ Order API Call ↓

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: System Looks Up Customer                                │
└─────────────────────────────────────────────────────────────────┘

GET /api/customers?search=0712345678

Found: customer_id = "cust-abc123"

        ↓ Customer Found ↓

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Order Created with Customer Link                        │
└─────────────────────────────────────────────────────────────────┘

POST /api/orders
{
  "customer_id": "cust-abc123",  ← Linked here!
  "type": "delivery",
  "items": [
    {"product_id": "prod-1", "quantity": 1},  // Nyama Choma
    {"product_id": "prod-2", "quantity": 2},  // Ugali
    {"product_id": "prod-3", "quantity": 1}   // Chai
  ]
}

Database Automatically Records:
✓ Order Number: ORD-20260908-0145
✓ Customer ID: cust-abc123
✓ Date/Time: 2026-09-08 14:30:00
✓ Type: delivery
✓ Items: Nyama Choma, Ugali x2, Chai
✓ Status: pending
✓ Subtotal: KES 800
✓ Tax: KES 128 (16%)
✓ Total: KES 928

        ↓ Order in Kitchen ↓

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Order Progresses                                        │
└─────────────────────────────────────────────────────────────────┘

14:35:00 - Cooking started  → cooking_started_at recorded
14:50:00 - Order ready      → ready_at recorded
15:00:00 - Delivered        → served_at recorded

All timestamps automatically saved!

        ↓ Customer Pays ↓

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Payment Processed                                       │
└─────────────────────────────────────────────────────────────────┘

POST /api/bills/:billId/payments
{
  "method": "mpesa",
  "amount": 928
}

Database Automatically Records:
✓ Bill Number: INV-20260908-0145
✓ Payment Status: paid
✓ Payment Method: mpesa
✓ Amount Paid: KES 928
✓ Paid At: 2026-09-08 15:00:30
✓ Order Status: completed

        ↓ Data Linked ↓

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Everything Appears in Customer Profile!                 │
└─────────────────────────────────────────────────────────────────┘

GET /api/customers/cust-abc123

Returns:
{
  "customer": {
    "name": "John Doe",
    "phone": "+254712345678",
    "visits_count": 15,          ← Total orders
    "total_spent": 12928.00,     ← Lifetime value
    "last_visit_at": "2026-09-08T15:00:30Z",
    
    "orderHistory": [
      {
        "order_number": "ORD-20260908-0145",
        "order_date": "2026-09-08T14:30:00Z",
        "order_type": "delivery",
        "status": "completed",
        "items": [
          {"name": "Nyama Choma", "quantity": 1, "price": 450},
          {"name": "Ugali", "quantity": 2, "price": 150},
          {"name": "Chai ya Maziwa", "quantity": 1, "price": 50}
        ],
        "subtotal": 800.00,
        "tax_amount": 128.00,
        "total": 928.00,
        "bill_number": "INV-20260908-0145",
        "payment_status": "paid",
        "paid_amount": 928.00,
        "payment_methods": [
          {"method": "mpesa", "amount": 928.00}
        ],
        "paid_at": "2026-09-08T15:00:30Z",
        "completed_at": "2026-09-08T15:00:30Z"
      },
      // ... previous orders
    ],
    
    "stats": {
      "total_orders": 15,
      "lifetime_value": 12928.00,
      "average_order_value": 861.87,
      "first_order_date": "2026-01-15T10:00:00Z",
      "last_order_date": "2026-09-08T14:30:00Z"
    }
  }
}
```

## 📊 What Staff See in the UI

### Customer List View

```
┌──────────────────────────────────────────────────────────────────────┐
│ CUSTOMERS                                                    [+ New]  │
├──────────────────────────────────────────────────────────────────────┤
│ Name              Phone           Orders  Spent         Last Visit   │
├──────────────────────────────────────────────────────────────────────┤
│ John Doe          +254712345678   15      KES 12,928   Today 15:00  │
│ Jane Smith        +254723456789   8       KES 6,400    Yesterday    │
│ Peter Kamau       +254734567890   23      KES 18,750   Today 12:30  │
└──────────────────────────────────────────────────────────────────────┘
```

### Customer Detail View

```
┌──────────────────────────────────────────────────────────────────────┐
│ JOHN DOE                                              [Edit] [Orders]│
├──────────────────────────────────────────────────────────────────────┤
│ 📱 +254712345678          📧 john@example.com                        │
│                                                                       │
│ STATISTICS                                                            │
│ ┌─────────────────┬─────────────────┬─────────────────────────────┐ │
│ │ Total Orders    │ Lifetime Value  │ Average Order               │ │
│ │ 15              │ KES 12,928      │ KES 862                     │ │
│ └─────────────────┴─────────────────┴─────────────────────────────┘ │
│                                                                       │
│ RECENT ORDERS                                              [View All]│
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ Order #ORD-20260908-0145                      Today at 14:30     ││
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│ │ Type: Delivery         Status: Completed                         ││
│ │                                                                   ││
│ │ Items:                                                            ││
│ │   • Nyama Choma x1                              KES 450.00       ││
│ │   • Ugali x2                                    KES 300.00       ││
│ │   • Chai ya Maziwa x1                          KES 50.00        ││
│ │                                                                   ││
│ │ Subtotal:                                       KES 800.00       ││
│ │ Tax (16%):                                      KES 128.00       ││
│ │ Total:                                          KES 928.00       ││
│ │                                                                   ││
│ │ 💳 Paid via M-Pesa                            KES 928.00       ││
│ │ Paid at: 15:00:30                                                ││
│ │                                                                   ││
│ │ Bill: INV-20260908-0145                                          ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                       │
│ │ Order #ORD-20260906-0089                   2 days ago at 18:45   ││
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│ │ Type: Dine-in         Status: Completed                          ││
│ │ Total: KES 1,250.00   Paid via Cash                             ││
│ └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Points

### Automatic ✅
- No manual entry needed
- Everything links automatically
- Real-time updates

### Complete ✅
- All order details saved
- Payment information recorded
- Timestamps for every event

### Accessible ✅
- View in Customers section
- API endpoints available
- Works across all terminals

### Instant ✅
- Orders appear immediately
- Statistics update in real-time
- No delays or sync issues

## 🔑 Important Database Fields

### Orders Table
```sql
customer_id           -- Links to customer
order_number          -- ORD-20260908-0145
type                  -- dine_in, takeout, delivery
status                -- pending, ready, served, completed
total                 -- Final amount
created_at            -- When ordered
completed_at          -- When finished
served_at             -- When delivered/served
```

### Bills Table
```sql
order_id              -- Links to order
customer_id           -- Links to customer
bill_number           -- INV-20260908-0145
payment_status        -- pending, partial, paid
paid_amount           -- Amount received
payment_details       -- JSON: methods used
paid_at               -- Payment timestamp
```

### Order Items Table
```sql
order_id              -- Links to order
product_id            -- What was ordered
quantity              -- How many
unit_price            -- Price per item
subtotal              -- Total for this item
```

## 🚀 Usage Tips

### For Walk-in Orders
1. Ask customer for phone number
2. Look them up: `GET /api/customers?search=PHONE`
3. If found: Use their `customer_id` in order
4. If not found: Create customer first, then order

### For Online Orders
1. Customer logs in (customer_id in session)
2. Places order through web/app
3. Order API automatically links via `customer_id`
4. ✅ Everything tracked automatically!

### For Regular Customers
1. Staff recognize customer
2. Search by name or phone
3. View past orders
4. Suggest usual items
5. Create new order linked to them

## ✅ Result

**Every customer order is fully tracked with:**
- ✅ Date and time ordered
- ✅ Items ordered with quantities
- ✅ Amount paid
- ✅ Payment method
- ✅ Order status
- ✅ Server who handled it
- ✅ Complete timestamps

**All visible in one place: The Customers section!**

---

See [CUSTOMER_ORDER_TRACKING.md](CUSTOMER_ORDER_TRACKING.md) for API details and technical documentation.
