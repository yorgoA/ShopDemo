const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
  const db = getDb();

  const cartItems = db
    .prepare(
      `SELECT ci.quantity, p.id as product_id, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`
    )
    .all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${item.name}". Available: ${item.stock}`,
      });
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = db.transaction(() => {
    const order = db
      .prepare('INSERT INTO orders (user_id, status, total) VALUES (?, ?, ?)')
      .run(req.user.id, 'confirmed', Math.round(total * 100) / 100);

    const orderId = order.lastInsertRowid;

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
    );
    const decrementStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const item of cartItems) {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
      decrementStock.run(item.quantity, item.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    return orderId;
  });

  const orderId = placeOrder();

  return res.status(201).json({
    message: 'Order placed successfully',
    orderId,
    total: Math.round(total * 100) / 100,
  });
});

module.exports = router;
