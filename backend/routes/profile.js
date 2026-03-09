const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, name, address FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});

router.put('/', authenticateToken, (req, res) => {
  const { name, email, address } = req.body;
  const db = getDb();

  if (email) {
    const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (conflict) {
      return res.status(409).json({ error: 'Email already in use' });
    }
  }

  db.prepare(`
    UPDATE users SET
      name    = COALESCE(?, name),
      email   = COALESCE(?, email),
      address = COALESCE(?, address)
    WHERE id = ?
  `).run(name ?? null, email ?? null, address ?? null, req.user.id);

  const updated = db.prepare('SELECT id, email, name, address FROM users WHERE id = ?').get(req.user.id);
  return res.json(updated);
});

router.put('/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const db = getDb();
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

  if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

  return res.json({ message: 'Password updated successfully' });
});

module.exports = router;
