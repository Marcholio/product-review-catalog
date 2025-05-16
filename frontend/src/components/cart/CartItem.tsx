import React from 'react';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import type { CartItem as CartItemType } from '../../contexts/CartContext';
import ImageWithFallback from '../ImageWithFallback';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeItem, updateQuantity } = useCart();
  const { product, quantity } = item;

  const handleRemove = () => {
    removeItem(product.id);
  };

  const increaseQuantity = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      // If quantity would go below 1, remove the item
      removeItem(product.id);
    }
  };

  // Format price
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toFixed(2);
  };

  // Calculate item total
  const itemTotal = parseFloat(formatPrice(product.price)) * quantity;

  return (
    <div className="py-4 border-b border-gray-200">
      {/* Product top row - image, name, etc. */}
      <div className="flex items-start mb-3">
        {/* Product image */}
        <div className="w-16 h-16 flex-shrink-0 mr-3 overflow-hidden rounded-md">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            fallbackClassName="w-full h-full"
          />
        </div>

        {/* Product details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between w-full pr-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
            {/* Remove button - moved to top right */}
            <button
              onClick={handleRemove}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors bg-white"
              aria-label="Remove item"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">{product.category}</p>
          <p className="mt-1 text-sm font-medium text-blue-600">€{formatPrice(product.price)}</p>
        </div>
      </div>

      {/* Product bottom row - quantity and total */}
      <div className="flex items-center justify-between mt-2">
        {/* Quantity controls */}
        <div className="flex items-center">
          <div className="flex items-center h-8 rounded-md border border-gray-300 bg-white shadow-sm overflow-hidden">
            <button
              onClick={decreaseQuantity}
              className="w-7 h-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors border-r border-gray-300 bg-white"
              aria-label="Decrease quantity"
            >
              <div className="flex items-center justify-center">
                <span className="font-bold text-lg">-</span>
              </div>
            </button>
            <span className="w-7 text-center text-gray-700 font-medium bg-white">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="w-7 h-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors border-l border-gray-300 bg-white"
              aria-label="Increase quantity"
            >
              <div className="flex items-center justify-center">
                <span className="font-bold text-lg">+</span>
              </div>
            </button>
          </div>
        </div>

        {/* Item total */}
        <div className="text-sm font-medium text-gray-900">
          €{itemTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default CartItem;