import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    getProduct(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!token) {
      navigate('/login');
      return;
    }

    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setFeedback('Added to cart!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback(err.message);
      setTimeout(() => setFeedback(''), 3000);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="loading" data-testid="loading">Loading...</div>;
  if (error) return <div className="error" data-testid="error">{error}</div>;
  if (!product) return null;

  return (
    <div className="product-detail" data-testid="product-detail-page">
      <button className="btn btn-outline" onClick={() => navigate(-1)} data-testid="back-button">
        ← Back
      </button>

      <div className="product-detail-content">
        <div className="product-detail-image">
          <span>{product.name[0]}</span>
        </div>

        <div className="product-detail-info">
          <h1 data-testid="product-detail-name">{product.name}</h1>

          <p className="product-detail-description" data-testid="product-detail-description">
            {product.description}
          </p>

          <div className="product-detail-price" data-testid="product-detail-price">
            ${product.price.toFixed(2)}
          </div>

          <div className="product-detail-stock" data-testid="product-detail-stock">
            {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
          </div>

          {product.stock > 0 && (
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity</label>
              <div className="quantity-input-group">
                <button
                  className="btn btn-outline"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  data-testid="quantity-decrease"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))
                  }
                  className="quantity-input"
                  data-testid="quantity-input"
                />
                <button
                  className="btn btn-outline"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  data-testid="quantity-increase"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {feedback && (
            <div
              className={feedback.includes('!') ? 'success-message' : 'error-message'}
              data-testid="add-to-cart-feedback"
            >
              {feedback}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            data-testid="add-to-cart-button"
          >
            {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
