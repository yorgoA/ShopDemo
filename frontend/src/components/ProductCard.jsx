import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function ProductCard({ product }) {
  const { token } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleAddToCart() {
    if (!token) {
      navigate('/login');
      return;
    }

    setAdding(true);
    try {
      await addItem(product.id);
      setFeedback('Added!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (err) {
      setFeedback(err.message);
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="product-card" data-testid="product-card" data-product-id={product.id}>
      <div className="product-image-placeholder">
        <span>{product.name[0]}</span>
      </div>

      <div className="product-info">
        <Link to={`/product/${product.id}`} data-testid="product-name-link">
          <h3 className="product-name" data-testid="product-name">
            {product.name}
          </h3>
        </Link>

        <p className="product-description" data-testid="product-description">
          {product.description}
        </p>

        <div className="product-footer">
          <span className="product-price" data-testid="product-price">
            ${product.price.toFixed(2)}
          </span>
          <span className="product-stock" data-testid="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          data-testid="add-to-cart-button"
        >
          {adding ? 'Adding...' : feedback || (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
        </button>
      </div>
    </div>
  );
}
