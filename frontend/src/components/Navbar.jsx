import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" data-testid="navbar-brand">
          ShopDemo
        </Link>

        <div className="navbar-links">
          <Link to="/" data-testid="nav-home">
            Products
          </Link>

          {user && (
            <Link to="/orders" data-testid="nav-orders">
              Orders
            </Link>
          )}

          <Link to="/cart" className="cart-link" data-testid="nav-cart">
            Cart
            {totalItems > 0 && (
              <span className="cart-badge" data-testid="cart-badge">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="navbar-user" data-testid="navbar-user">
                {user.name || 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                data-testid="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" data-testid="nav-register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
