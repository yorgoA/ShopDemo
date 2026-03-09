const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();

  const orders = db
    .prepare(
      `SELECT id, status, total, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`
    )
    .all(req.user.id);

  const ordersWithItems = orders.map((order) => {
    const items = db
      .prepare(
        `SELECT oi.quantity, oi.price, p.id as product_id, p.name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`
      )
      .all(order.id);
    return { ...order, items };
  });

  return res.json(ordersWithItems);
});

module.exports = router;
