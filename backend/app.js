const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');

// Split out from server.js so tests can build the app without also binding a port.
function createApp() {
  const app = express();

  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());

  app.use('/', authRoutes);
  app.use('/products', productRoutes);
  app.use('/cart', cartRoutes);
  app.use('/checkout', checkoutRoutes);
  app.use('/orders', orderRoutes);
  app.use('/profile', profileRoutes);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  return app;
}

module.exports = { createApp };
