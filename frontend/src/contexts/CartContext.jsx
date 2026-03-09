import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, removeFromCart, updateCartItem } from '../api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    try {
      const data = await getCart(token);
      setItems(data);
    } catch {
      setItems([]);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function addItem(productId, quantity = 1) {
    await addToCart(token, productId, quantity);
    await fetchCart();
  }

  async function removeItem(productId) {
    await removeFromCart(token, productId);
    await fetchCart();
  }

  async function updateItem(productId, quantity) {
    await updateCartItem(token, productId, quantity);
    await fetchCart();
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, fetchCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
