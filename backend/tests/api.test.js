const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Point the app at a throwaway database before anything requires db.js, so tests
// never touch the real dev database and always start from a clean slate.
process.env.DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'shopdemo-test-')), 'test.db');

const request = require('supertest');
const { createApp } = require('../app');
const { initializeDatabase } = require('../db');

let app;

test.before(async () => {
  await initializeDatabase();
  app = createApp();
});

function registerUser(email = `user-${Date.now()}-${Math.random()}@example.com`, password = 'password123') {
  return request(app).post('/register').send({ email, password }).then((res) => ({ ...res.body, email, password }));
}

test('GET /health reports ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('GET /products returns the seeded catalog', async () => {
  const res = await request(app).get('/products');
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 10);
  assert.ok(res.body[0].name);
});

test('GET /products/:id 404s for an unknown product', async () => {
  const res = await request(app).get('/products/999999');
  assert.equal(res.status, 404);
});

test('register then login issues a token', async () => {
  const { email, password, token } = await registerUser();
  assert.ok(token);

  const loginRes = await request(app).post('/login').send({ email, password });
  assert.equal(loginRes.status, 200);
  assert.ok(loginRes.body.token);
});

test('register rejects a duplicate email', async () => {
  const { email, password } = await registerUser();
  const res = await request(app).post('/register').send({ email, password });
  assert.equal(res.status, 409);
});

test('login rejects a wrong password', async () => {
  const { email } = await registerUser();
  const res = await request(app).post('/login').send({ email, password: 'wrong-password' });
  assert.equal(res.status, 401);
});

test('cart routes require authentication', async () => {
  const res = await request(app).get('/cart');
  assert.equal(res.status, 401);
});

test('full flow: register, add to cart, checkout, appears in order history', async () => {
  const { token } = await registerUser();

  const products = await request(app).get('/products');
  const product = products.body[0];

  const addRes = await request(app)
    .post('/cart/add')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId: product.id, quantity: 2 });
  assert.equal(addRes.status, 200);

  const checkoutRes = await request(app).post('/checkout').set('Authorization', `Bearer ${token}`);
  assert.equal(checkoutRes.status, 201);
  assert.ok(checkoutRes.body.orderId);
  assert.equal(checkoutRes.body.total, Math.round(product.price * 2 * 100) / 100);

  const ordersRes = await request(app).get('/orders').set('Authorization', `Bearer ${token}`);
  assert.equal(ordersRes.status, 200);
  assert.equal(ordersRes.body.length, 1);
  assert.equal(ordersRes.body[0].items[0].quantity, 2);

  const cartAfterCheckout = await request(app).get('/cart').set('Authorization', `Bearer ${token}`);
  assert.equal(cartAfterCheckout.body.length, 0);
});

test('checkout rejects an order that exceeds available stock', async () => {
  const { token } = await registerUser();

  const products = await request(app).get('/products');
  const product = products.body[1];

  await request(app)
    .post('/cart/add')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId: product.id, quantity: product.stock + 1 });

  const checkoutRes = await request(app).post('/checkout').set('Authorization', `Bearer ${token}`);
  assert.equal(checkoutRes.status, 400);
});

test('password change requires the correct current password', async () => {
  const { token, password } = await registerUser();

  const wrongRes = await request(app)
    .put('/profile/password')
    .set('Authorization', `Bearer ${token}`)
    .send({ currentPassword: 'not-the-password', newPassword: 'newpassword123' });
  assert.equal(wrongRes.status, 401);

  const rightRes = await request(app)
    .put('/profile/password')
    .set('Authorization', `Bearer ${token}`)
    .send({ currentPassword: password, newPassword: 'newpassword123' });
  assert.equal(rightRes.status, 200);
});
