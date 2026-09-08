import { Router, Request, Response } from 'express';
import { getDatabase, now, getSettingValue } from '../db';
import { requireRole } from '../middleware/security';
import { parsePhoneE164, stripPhoneDigits } from '../lib/phone';

export function parseCustomer(c: any): any {
  if (!c) return c;
  return {
    ...c,
    tag_counts: c.tag_counts ? (() => { try { return JSON.parse(c.tag_counts); } catch { return null; } })() : null,
  };
}

const router = Router();

export function getWalletBalance(customerId: string | number | null): number {
  if (!customerId) return 0;
  const db = getDatabase();
  const credits = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM loyalty_ledger
    WHERE customer_id = ? AND type = 'credit'
  `).get(customerId) as { total: number };

  const debits = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM loyalty_ledger
    WHERE customer_id = ? AND type = 'debit'
  `).get(customerId) as { total: number };

  return Math.max(0, credits.total - debits.total);
}

// Cleanup endpoint: delete all customers with null IDs - must be before /:id
router.delete('/admin/cleanup', requireRole('owner'), (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const result = db.prepare("DELETE FROM customers WHERE id IS NULL").run();
    res.json({ message: `Deleted ${result.changes} customers with null IDs` });
  } catch (error: any) {
    console.error("[API] Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/alerts', requireRole('owner', 'manager', 'cashier', 'waiter'), (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const result = db.prepare(`
      SELECT COUNT(*) as count 
      FROM customers 
      WHERE is_active = 1 
      AND phone IS NOT NULL AND phone != '' 
      AND phone != '+' || phone_digits
    `).get() as { count: number };
    
    res.json({ invalidPhonesCount: result.count });
  } catch (error: any) {
    console.error("[API] Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/', requireRole('owner', 'manager', 'cashier', 'waiter'), (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    let query = `SELECT c.*,
      COALESCE((SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id), 0) as visits_count,
      COALESCE((SELECT SUM(total) FROM orders o WHERE o.customer_id = c.id), 0) as total_spent,
      MAX(0,
        COALESCE((SELECT SUM(ll.amount) FROM loyalty_ledger ll WHERE ll.customer_id = c.id AND ll.type = 'credit'), 0) -
        COALESCE((SELECT SUM(ll.amount) FROM loyalty_ledger ll WHERE ll.customer_id = c.id AND ll.type = 'debit'), 0)
      ) as wallet_balance,
      (SELECT MAX(created_at) FROM orders o WHERE o.customer_id = c.id) as last_visit_at,
      (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND DATE(o.created_at) = DATE('now')) as orders_today,
      (SELECT SUM(b.paid_amount) FROM bills b 
       JOIN orders o ON b.order_id = o.id 
       WHERE o.customer_id = c.id AND b.payment_status = 'paid') as total_paid
      FROM customers c WHERE c.is_active = 1`;
    const params: any[] = [];

    if (req.query.search) {
      const search = `%${req.query.search}%`;
      query += ' AND (c.name LIKE ? OR c.phone_digits LIKE ? OR c.email LIKE ?)';
      params.push(search, search, search);
    }

    if (req.query.filter === 'invalid_phones') {
      query += " AND c.phone IS NOT NULL AND c.phone != '' AND c.phone != '+' || c.phone_digits";
    }

    const sortField = (req.query.sort as string) || 'name';
    const sortOrder = (req.query.order as string) === 'desc' ? 'DESC' : 'ASC';
    
    const allowedSortFields: Record<string, string> = {
      name: 'c.name COLLATE NOCASE',
      phone: 'c.phone_digits',
      visits: 'visits_count',
      spent: 'total_spent',
      loyalty: 'wallet_balance',
      last_visit: 'last_visit_at'
    };

    const orderBy = allowedSortFields[sortField] || 'c.name COLLATE NOCASE';
    query += ` ORDER BY ${orderBy} ${sortOrder}`;

    if (req.query.per_page) {
      query += ` LIMIT ${parseInt(req.query.per_page as string)}`;
    }

    const customers = db.prepare(query).all(...params);
    res.json({ data: customers });
  } catch (error: any) {
    console.error("[API] Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/:id', requireRole('owner', 'manager', 'cashier', 'waiter'), (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const customerRaw = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customerRaw) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const customer = parseCustomer(customerRaw);

    const walletBalance = getWalletBalance(req.params.id as string);
    const loyaltyHistory = db.prepare(`
      SELECT * FROM loyalty_ledger WHERE customer_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(req.params.id);

    // Enhanced order history with payment details
    const orderHistory = db.prepare(`
      SELECT 
        o.id as order_id,
        o.order_number,
        o.type as order_type,
        o.status,
        o.subtotal,
        o.tax_amount,
        o.discount_amount,
        o.total as order_total,
        o.guest_count,
        o.special_instructions,
        o.created_at as order_date,
        o.completed_at,
        o.served_at,
        b.id as bill_id,
        b.bill_number,
        b.payment_status,
        b.paid_amount,
        b.payment_details,
        b.paid_at,
        u.name as served_by
      FROM orders o
      LEFT JOIN bills b ON b.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
      LIMIT 50
    `).all(req.params.id);

    // Parse payment details JSON
    const parsedOrderHistory = orderHistory.map((order: any) => {
      let paymentMethods = [];
      if (order.payment_details) {
        try {
          paymentMethods = JSON.parse(order.payment_details);
        } catch (e) {
          // Invalid JSON, leave empty
        }
      }
      return {
        ...order,
        payment_methods: paymentMethods
      };
    });

    // Get order statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as lifetime_value,
        COALESCE(AVG(o.total), 0) as average_order_value,
        MAX(o.created_at) as last_order_date,
        MIN(o.created_at) as first_order_date
      FROM orders o
      WHERE o.customer_id = ?
    `).get(req.params.id) as any;

    res.json({ 
      customer: { 
        ...customer, 
        walletBalance, 
        loyaltyHistory, 
        orderHistory: parsedOrderHistory,
        stats
      } 
    });
  } catch (error: any) {
    console.error("[API] Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/:id/wallet', requireRole('owner', 'manager', 'cashier', 'waiter'), (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const customerId = req.params.id as string;
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const balance = getWalletBalance(customerId);
    const transactions = db.prepare(`
      SELECT * FROM loyalty_ledger WHERE customer_id = ? ORDER BY created_at DESC LIMIT 100
    `).all(customerId);

    res.json({ balance, transactions });
  } catch (error: any) {
    console.error("[API] Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New endpoint: Get complete order history with items
router.get('/:id/orders', requireRole('owner', 'manager', 'cashier', 'waiter'), (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const customerId = req.params.id as string;
    
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get all orders with full details
    const orders = db.prepare(`
      SELECT 
        o.*,
        b.bill_number,
        b.payment_status,
        b.paid_amount,
        b.payment_details,
        b.paid_at,
        u.name as served_by_name,
        u.email as served_by_email
      FROM orders o
      LEFT JOIN bills b ON b.order_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `).all(customerId) as any[];

    // Get order items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT 
          oi.*,
          p.name as product_name,
          p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY oi.id
      `).all(order.id);

      // Parse payment details
      let paymentMethods = [];
      if (order.payment_details) {
        try {
          paymentMethods = JSON.parse(order.payment_details);
        } catch (e) {
          // Invalid JSON
        }
      }

      return {
        ...order,
        items,
        payment_methods: paymentMethods
      };
    });

    res.json({ orders: ordersWithItems });
  } catch (error: any) {
    console.error("[API] Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/', requireRole('owner', 'manager', 'cashier', 'waiter'), (req: Request, res: Response) => {
  try {
    const { phone, name, email, address, notes, country_code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const db = getDatabase();

    let finalPhone = phone ? String(phone).trim() : null;
    let finalCountryCode = country_code ? String(country_code).trim() : null;

    if (finalPhone) {
      const tenantCountry = getSettingValue('country') || 'IN';
      const parsed = parsePhoneE164(finalPhone, tenantCountry);
      if (!parsed) {
        return res.status(400).json({ message: 'Phone number is not valid. Use international format (e.g. +919876543210).' });
      }
      finalPhone = parsed.e164;
      finalCountryCode = parsed.countryCode;

      const phoneDigits = stripPhoneDigits(finalPhone);
      const existing = db.prepare('SELECT * FROM customers WHERE phone_digits = ?').get(phoneDigits) as any;
      if (existing) {
        if (existing.is_active === 0) {
          db.prepare(`
            UPDATE customers SET
              name = ?,
              email = ?,
              country_code = COALESCE(NULLIF(?, ''), country_code),
              address = ?,
              notes = ?,
              is_active = 1,
              updated_at = ?
            WHERE id = ?
          `).run(
            String(name).trim(),
            email ? String(email).trim() : null,
            finalCountryCode,
            address ? String(address).trim() : null,
            notes ? String(notes).trim() : null,
            now(),
            existing.id
          );
          const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(existing.id);
          return res.status(201).json({ customer });
        } else {
          return res.status(409).json({ message: 'Customer with this phone already exists' });
        }
      }
    }

    const id = 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    db.prepare(`
      INSERT INTO customers (id, phone, name, email, country_code, address, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      finalPhone,
      String(name).trim(),
      email ? String(email).trim() : null,
      finalCountryCode,
      address ? String(address).trim() : null,
      notes ? String(notes).trim() : null,
      now(),
      now()
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.status(201).json({ customer });
  } catch (error: any) {
    console.error('[Customer POST error]', error);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

// Quick lookup endpoint for guest checkout
router.post('/find-or-create', requireRole('owner', 'manager', 'cashier', 'waiter'), (req: Request, res: Response) => {
  try {
    const { phone, name, email, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const db = getDatabase();

    // If phone provided, check if customer exists
    if (phone && phone.trim()) {
      const tenantCountry = getSettingValue('country') || 'KE';
      const parsed = parsePhoneE164(String(phone).trim(), tenantCountry);
      
      if (parsed) {
        const phoneDigits = stripPhoneDigits(parsed.e164);
        const existing = db.prepare('SELECT * FROM customers WHERE phone_digits = ? AND is_active = 1').get(phoneDigits) as any;
        
        if (existing) {
          // Customer exists, return it
          return res.json({ customer: existing, created: false });
        }

        // Create new customer with phone
        const id = 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        db.prepare(`
          INSERT INTO customers (id, phone, name, email, country_code, address, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          parsed.e164,
          String(name).trim(),
          email ? String(email).trim() : null,
          parsed.countryCode,
          address ? String(address).trim() : null,
          now(),
          now()
        );

        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
        return res.status(201).json({ customer, created: true });
      }
    }

    // No phone or invalid phone - create customer with just name
    const id = 'cust-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    db.prepare(`
      INSERT INTO customers (id, name, email, address, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      String(name).trim(),
      email ? String(email).trim() : null,
      address ? String(address).trim() : null,
      now(),
      now()
    );

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.status(201).json({ customer, created: true });
  } catch (error: any) {
    console.error('[Customer find-or-create error]', error);
    res.status(500).json({ message: 'Failed to process customer' });
  }
});

router.put('/:id', requireRole('owner', 'manager', 'cashier'), (req: Request, res: Response) => {
  try {
    const {
      phone, name, email, address, notes, country_code
    } = req.body;
    const db = getDatabase();

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    let finalPhone = phone ? String(phone).trim() : null;
    let finalCountryCode = country_code ? String(country_code).trim() : null;

    if (finalPhone) {
      const tenantCountry = getSettingValue('country') || 'IN';
      const parsed = parsePhoneE164(finalPhone, tenantCountry);
      if (!parsed) {
        return res.status(400).json({ error: 'Phone number is not valid. Use international format (e.g. +919876543210).' });
      }
      finalPhone = parsed.e164;
      finalCountryCode = parsed.countryCode;

      const phoneDigits = stripPhoneDigits(finalPhone);
      const existing = db.prepare('SELECT id FROM customers WHERE phone_digits = ? AND id != ?').get(phoneDigits, req.params.id) as any;
      if (existing) {
        return res.status(409).json({ error: 'Customer with this phone already exists' });
      }
    }

    db.prepare(`
      UPDATE customers SET
        phone = COALESCE(NULLIF(?, ''), phone),
        name = COALESCE(NULLIF(?, ''), name),
        email = COALESCE(NULLIF(?, ''), email),
        country_code = COALESCE(NULLIF(?, ''), country_code),
        address = COALESCE(NULLIF(?, ''), address),
        notes = COALESCE(NULLIF(?, ''), notes),
        updated_at = ?
      WHERE id = ?
    `).run(
      finalPhone, name, email, finalCountryCode, address, notes, now(), req.params.id
    );

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    res.json({ customer: updated });
  } catch (error: any) {
    console.error("[API] Internal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Customers are never deletable — not even soft-deleted — by design: every
// row is permanently referenced by orders/bills/loyalty_ledger with no FK,
// and losing a customer's history/loyalty standing is worse than a stale
// record. There is intentionally no DELETE /:id route.

export const customerRoutes = router;
