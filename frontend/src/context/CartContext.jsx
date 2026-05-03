import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i.id === action.product.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      return [...state, { ...action.product, quantity: 1 }];
    }
    case 'UPDATE_QUANTITY':
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: Math.max(1, action.quantity) } : i
      );
    case 'REMOVE_ITEM':
      return state.filter((i) => i.id !== action.id);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

function loadCart() {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items
    .reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
    .toFixed(2);

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', product });
  const updateQuantity = (id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', id });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
