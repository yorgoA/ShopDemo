import { useState, useEffect } from 'react';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading" data-testid="loading">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" data-testid="error">
        {error}
      </div>
    );
  }

  return (
    <div data-testid="home-page">
      <div className="page-header">
        <h1>Products</h1>
        <p>{products.length} items available</p>
      </div>

      <div className="product-grid" data-testid="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
