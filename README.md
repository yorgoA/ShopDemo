# ShopDemo — E-Commerce Demo App

A minimal but realistic e-commerce web application built for QA.

## Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React + Vite                |
| Backend  | Node.js + Express           |
| Database | SQLite (via sql.js / WASM)  |

---

## Installation

From the project root, install all dependencies (root, backend, and frontend) in one command:

```bash
npm install
```

---

## Running the App

Start both the backend and frontend concurrently:

```bash
npm run dev
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:5173  |
| Backend  | http://localhost:3000  |

The SQLite database is created automatically at `database/shop.db` on first run and seeded with 10 demo products.

---

## API Endpoints

### Auth

| Method | Endpoint    | Body                    | Description         |
|--------|-------------|-------------------------|---------------------|
| POST   | /register   | `{ email, password }`   | Register a new user |
| POST   | /login      | `{ email, password }`   | Login, returns JWT  |

### Products

| Method | Endpoint       | Auth | Description       |
|--------|----------------|------|-------------------|
| GET    | /products      | No   | List all products |
| GET    | /products/:id  | No   | Get product by ID |

### Cart

| Method | Endpoint      | Auth | Body                        | Description             |
|--------|---------------|------|-----------------------------|-------------------------|
| GET    | /cart         | Yes  | —                           | Get current user's cart |
| POST   | /cart/add     | Yes  | `{ productId, quantity? }`  | Add item to cart        |
| POST   | /cart/remove  | Yes  | `{ productId }`             | Remove item from cart   |
| POST   | /cart/update  | Yes  | `{ productId, quantity }`   | Update item quantity    |

### Checkout & Orders

| Method | Endpoint   | Auth | Description                               |
|--------|------------|------|-------------------------------------------|
| POST   | /checkout  | Yes  | Place order, validates stock, clears cart |
| GET    | /orders    | Yes  | Get current user's order history          |

### Profile

| Method | Endpoint           | Auth | Body                              | Description               |
|--------|--------------------|------|-----------------------------------|---------------------------|
| GET    | /profile           | Yes  | —                                 | Get current user profile  |
| PUT    | /profile           | Yes  | `{ name?, email?, address? }`     | Update profile details    |
| PUT    | /profile/password  | Yes  | `{ currentPassword, newPassword }`| Change password           |

---

## Pages

| Route        | Description                              |
|--------------|------------------------------------------|
| `/`          | Product catalog                          |
| `/product/:id` | Product detail page                    |
| `/cart`      | Cart with checkout                       |
| `/orders`    | Order history with receipt download      |
| `/profile`   | Edit name, email, address, password      |
| `/login`     | Login                                    |
| `/register`  | Register                                 |

---

## `data-testid` Attributes

| Element                    | `data-testid`               |
|----------------------------|-----------------------------|
| Navbar                     | `navbar`                    |
| Brand logo                 | `navbar-brand`              |
| Navbar profile link        | `navbar-user`               |
| Cart link                  | `nav-cart`                  |
| Cart badge (item count)    | `cart-badge`                |
| Logout button              | `logout-button`             |
| Product card               | `product-card`              |
| Product name               | `product-name`              |
| Product price              | `product-price`             |
| Product stock              | `product-stock`             |
| Add to Cart button         | `add-to-cart-button`        |
| Quantity input             | `quantity-input`            |
| Cart item                  | `cart-item`                 |
| Cart quantity input        | `cart-quantity-input`       |
| Remove cart item           | `remove-cart-item-button`   |
| Cart total                 | `cart-grand-total`          |
| Checkout button            | `checkout-button`           |
| Download receipt button    | `download-receipt-button`   |
| Order success              | `order-success`             |
| Order ID (post-checkout)   | `order-id`                  |
| View orders button         | `view-orders-button`        |
| Login form                 | `login-form`                |
| Login button               | `login-button`              |
| Register button            | `register-button`           |
| Email input                | `email-input`               |
| Password input             | `password-input`            |
| Orders list                | `orders-list`               |
| Order card                 | `order-card`                |
| Order status               | `order-status`              |
| Profile form               | `profile-form`              |
| Profile name input         | `profile-name-input`        |
| Profile email input        | `profile-email-input`       |
| Profile address input      | `profile-address-input`     |
| Save profile button        | `save-profile-button`       |
| Password form              | `password-form`             |
| Current password input     | `current-password-input`    |
| New password input         | `new-password-input`        |
| Change password button     | `change-password-button`    |

---

## Project Structure

```
project-root/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── checkout.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   └── profile.js
│   ├── db.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── Cart.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   └── shop.db          ← created automatically on first run
├── package.json
└── README.md
```
