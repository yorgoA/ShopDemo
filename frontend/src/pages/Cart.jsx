import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { checkout } from '../api';

export default function Cart() {
  const { token } = useAuth();
  const { items, removeItem, updateItem, totalPrice, fetchCart } = useCart();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  if (!token) {
    return (
      <div className="empty-state" data-testid="cart-login-required">
        <h2>Your Cart</h2>
        <p>
          Please <Link to="/login">login</Link> to view your cart.
        </p>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="order-success" data-testid="order-success">
        <div className="success-icon">✓</div>
        <h2>Order Placed!</h2>
        <p>
          Your order ID is: <strong data-testid="order-id">#{orderId}</strong>
        </p>
        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary" data-testid="view-orders-button">
            View Orders
          </Link>
          <button onClick={downloadReceipt} className="btn btn-outline" data-testid="download-receipt-button">
            Download Receipt
          </button>
          <Link to="/" className="btn btn-outline" data-testid="continue-shopping-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Add some products to get started.</p>
        <Link to="/" className="btn btn-primary" data-testid="browse-products-button">
          Browse Products
        </Link>
      </div>
    );
  }

  async function handleCheckout() {
    setError('');
    setCheckingOut(true);
    const snapshot = { items: [...items], total: totalPrice };
    try {
      const result = await checkout(token);
      setReceiptData({ ...snapshot, orderId: result.orderId, date: new Date() });
      setOrderId(result.orderId);
      fetchCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  }

  function downloadReceipt() {
    const { orderId, items, total, date } = receiptData;
    const lines = [
      '========================================',
      '              SHOPDEMO RECEIPT          ',
      '========================================',
      `Order ID  : #${orderId}`,
      `Date      : ${date.toLocaleString()}`,
      '----------------------------------------',
      'ITEMS',
      '----------------------------------------',
      ...items.map((i) => `${i.name.padEnd(28)} x${i.quantity}  $${(i.price * i.quantity).toFixed(2)}`),
      '----------------------------------------',
      `TOTAL     : $${total.toFixed(2)}`,
      '========================================',
      'Thank you for your purchase!',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-order-${orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div data-testid="cart-page">
      <div className="page-header">
        <h1>Your Cart</h1>
      </div>

      <div className="cart-layout">
        <div className="cart-items" data-testid="cart-items">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="cart-item"
              data-testid="cart-item"
              data-product-id={item.product_id}
            >
              <div className="cart-item-info">
                <Link
                  to={`/product/${item.product_id}`}
                  className="cart-item-name"
                  data-testid="cart-item-name"
                >
                  {item.name}
                </Link>
                <span className="cart-item-price" data-testid="cart-item-price">
                  ${item.price.toFixed(2)} each
                </span>
              </div>

              <div className="cart-item-controls">
                <div className="quantity-input-group">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateItem(item.product_id, item.quantity - 1)}
                    data-testid="cart-quantity-decrease"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.product_id, Number(e.target.value))}
                    className="quantity-input"
                    data-testid="cart-quantity-input"
                  />
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => updateItem(item.product_id, item.quantity + 1)}
                    data-testid="cart-quantity-increase"
                  >
                    +
                  </button>
                </div>

                <span className="cart-item-subtotal" data-testid="cart-item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.product_id)}
                  data-testid="remove-cart-item-button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary" data-testid="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span data-testid="cart-total">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <strong>Total</strong>
            <strong data-testid="cart-grand-total">${totalPrice.toFixed(2)}</strong>
          </div>

          {error && (
            <div className="error-message" data-testid="checkout-error">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleCheckout}
            disabled={checkingOut}
            data-testid="checkout-button"
          >
            {checkingOut ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
