import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, Product, Topping } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
}

interface CartContextType extends CartState {
  addToCart: (product: Product, toppings: Topping[], size: string, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { index: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CALCULATE_TOTAL' };

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter((_, index) => index !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item, index) =>
          index === action.payload.index
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'CALCULATE_TOTAL':
      const total = state.items.reduce((sum, item) => {
        const basePrice = item.product.basePrice;
        const sizePrice = item.sizePrice || 0;
        const toppingsPrice = item.selectedToppings.reduce((tSum, topping) => tSum + topping.price, 0);
        return sum + (basePrice + sizePrice + toppingsPrice) * item.quantity;
      }, 0);
      return { ...state, total };
    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTAL' });
  }, [state.items]);

  const addToCart = (product: Product, toppings: Topping[], size: string, quantity = 1) => {
    // Find the size variation details
    const sizeVariation = product.sizeVariations.find(sv => sv.size === size);
    const sizeName = sizeVariation?.name || size;
    const sizePrice = sizeVariation?.price || 0;

    const cartItem: CartItem = {
      product,
      selectedToppings: toppings,
      size,
      sizeName,
      sizePrice,
      quantity,
    };
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
  };

  const removeFromCart = (index: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: index });
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};