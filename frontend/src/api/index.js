const API_BASE = '/api';

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export function getProducts() {
  return request('/products');
}

export function getProduct(id) {
  return request(`/products/${id}`);
}

export function register(email, password) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function login(email, password) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getCart(token) {
  return request('/cart', { headers: authHeader(token) });
}

export function addToCart(token, productId, quantity = 1) {
  return request('/cart/add', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ productId, quantity }),
  });
}

export function removeFromCart(token, productId) {
  return request('/cart/remove', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ productId }),
  });
}

export function updateCartItem(token, productId, quantity) {
  return request('/cart/update', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({ productId, quantity }),
  });
}

export function checkout(token) {
  return request('/checkout', {
    method: 'POST',
    headers: authHeader(token),
  });
}

export function getOrders(token) {
  return request('/orders', { headers: authHeader(token) });
}

export function getProfile(token) {
  return request('/profile', { headers: authHeader(token) });
}

export function updateProfile(token, data) {
  return request('/profile', {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export function updatePassword(token, currentPassword, newPassword) {
  return request('/profile/password', {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
