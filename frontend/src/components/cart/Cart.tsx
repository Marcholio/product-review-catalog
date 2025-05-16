import React from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import CartItem from './CartItem';
import { Button } from '../ui';

interface CartProps {
  // No specific props needed, all state is managed by CartContext
}

export const Cart: React.FC<CartProps> = () => {
  const { items, totalPrice, itemCount, isCartOpen, closeCart, clearCart } = useCart();
  
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />
      
      {/* Cart panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-md sm:max-w-lg">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
            {/* Cart header */}
            <div className="px-4 py-6 bg-gray-50 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiShoppingCart className="mr-2 text-blue-600" />
                  Shopping Cart
                  {itemCount > 0 && (
                    <span className="ml-2 text-sm text-gray-600">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  )}
                </h2>
                <button
                  onClick={closeCart}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none bg-transparent"
                  aria-label="Close cart"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Cart content */}
            <div className="flex-1 px-4 py-6 sm:px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <FiShoppingCart size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center mb-4">Your cart is empty</p>
                  <Button 
                    variant="primary" 
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cart items */}
                  <div className="space-y-4 pr-1">
                    {items.map(item => (
                      <CartItem key={item.product.id} item={item} />
                    ))}
                  </div>
                  
                  {/* Cart actions */}
                  <div className="mt-6">
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center bg-white px-2 py-1 rounded-md"
                    >
                      <FiX size={16} className="mr-1" />
                      Clear cart
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Cart footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                {/* Order summary */}
                <div className="mb-4">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-1">
                    <p>Subtotal</p>
                    <p>€{totalPrice.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                </div>
                
                {/* Checkout button */}
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={closeCart}
                  >
                    Checkout
                  </Link>
                </div>
                
                {/* Continue shopping button */}
                <div className="mt-2 flex justify-center text-sm text-gray-500">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium bg-white"
                    onClick={closeCart}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;