import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders } from '../api';
import { useAuth } from '../contexts/AuthContext';

function downloadReceipt(order) {
  const lines = [
    '========================================',
    '              SHOPDEMO RECEIPT          ',
    '========================================',
    `Order ID  : #${order.id}`,
    `Date      : ${new Date(order.created_at + 'Z').toLocaleString()}`,
    `Status    : ${order.status}`,
    '----------------------------------------',
    'ITEMS',
    '----------------------------------------',
    ...order.items.map((i) => `${i.name.padEnd(28)} x${i.quantity}  $${(i.price * i.quantity).toFixed(2)}`),
    '----------------------------------------',
    `TOTAL     : $${order.total.toFixed(2)}`,
    '========================================',
    'Thank you for your purchase!',
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-order-${order.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    getOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <div className="loading" data-testid="loading">Loading orders...</div>;
  if (error) return <div className="error" data-testid="error">{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-orders">
        <h2>No Orders Yet</h2>
        <p>You haven&apos;t placed any orders.</p>
        <Link to="/" className="btn btn-primary" data-testid="browse-products-button">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="orders-page">
      <div className="page-header">
        <h1>Order History</h1>
        <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="orders-list" data-testid="orders-list">
        {orders.map((order) => (
          <div
            key={order.id}
            className="order-card"
            data-testid="order-card"
            data-order-id={order.id}
          >
            <div className="order-header">
              <div>
                <span className="order-id" data-testid="order-id">
                  Order #{order.id}
                </span>
                <span className="order-date" data-testid="order-date">
                  {new Date(order.created_at + 'Z').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="order-header-right">
                <span
                  className={`order-status order-status-${order.status}`}
                  data-testid="order-status"
                >
                  {order.status}
                </span>
                <span className="order-total" data-testid="order-total">
                  ${order.total.toFixed(2)}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => downloadReceipt(order)}
                  data-testid="download-receipt-button"
                >
                  Download Receipt
                </button>
              </div>
            </div>

            <div className="order-items" data-testid="order-items">
              {order.items.map((item) => (
                <div
                  key={item.product_id}
                  className="order-item"
                  data-testid="order-item"
                >
                  <span data-testid="order-item-name">{item.name}</span>
                  <span className="order-item-qty">×{item.quantity}</span>
                  <span data-testid="order-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
