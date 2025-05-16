import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/Product';

// Cart item type with quantity
export interface CartItem {
  product: Product;
  quantity: number;
}

// Cart context type
export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Initialize cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
      // If there's an error, just start with an empty cart
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [items]);

  // Calculate derived values
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => {
    const price = typeof item.product.price === 'string' 
      ? parseFloat(item.product.price) 
      : item.product.price;
    return total + (price * item.quantity);
  }, 0);

  // Add an item to the cart
  const addItem = (product: Product, quantity = 1) => {
    setItems(prevItems => {
      // Check if the product is already in the cart
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // If it exists, update the quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Otherwise, add it as a new item
        return [...prevItems, { product, quantity }];
      }
    });
    
    // Open the cart when an item is added
    setIsCartOpen(true);
  };

  // Remove an item from the cart
  const removeItem = (productId: number) => {
    setItems(prevItems => 
      prevItems.filter(item => item.product.id !== productId)
    );
  };

  // Update the quantity of an item
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      removeItem(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Clear all items from the cart
  const clearCart = () => {
    setItems([]);
  };

  // Toggle cart visibility
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  // Open the cart
  const openCart = () => {
    setIsCartOpen(true);
  };

  // Close the cart
  const closeCart = () => {
    setIsCartOpen(false);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        isCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook for using the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};