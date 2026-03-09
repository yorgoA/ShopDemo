const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const items = db
    .prepare(
      `SELECT ci.id, ci.quantity,
              p.id as product_id, p.name, p.price, p.stock, p.description
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`
    )
    .all(req.user.id);
  return res.json(items);
});

router.post('/add', authenticateToken, (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const db = getDb();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  const existing = db
    .prepare('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, productId);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?').run(
      quantity,
      req.user.id,
      productId
    );
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(
      req.user.id,
      productId,
      quantity
    );
  }

  return res.json({ message: 'Item added to cart' });
});

router.post('/remove', authenticateToken, (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  const db = getDb();
  db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);

  return res.json({ message: 'Item removed from cart' });
});

router.post('/update', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ error: 'productId and quantity are required' });
  }

  const db = getDb();

  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
    return res.json({ message: 'Item removed from cart' });
  }

  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }

  db.prepare('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?').run(
    quantity,
    req.user.id,
    productId
  );

  return res.json({ message: 'Cart updated' });
});

module.exports = router;
