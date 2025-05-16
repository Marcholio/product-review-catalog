import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { Button, Card } from './ui';

const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Early return if cart is empty
  if (items.length === 0 && !isOrderComplete) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-xl font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-gray-500">Add some products to your cart before checking out.</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/')} variant="primary" leftIcon={<FiArrowLeft />}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If order is complete, show success message
  if (isOrderComplete) {
    return (
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FiCheck className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-xl font-medium text-gray-900">Thank you for your order!</h2>
          <p className="mt-2 text-base text-gray-500">
            Your order has been placed and will be processed soon.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/')} variant="primary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOrderComplete(true);
      clearCart();
    }, 1500);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Left column - Form */}
        <div className="md:w-2/3">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
          
          <form onSubmit={handleSubmit}>
            {/* Customer Information */}
            <Card variant="default" className="mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Shipping Information */}
            <Card variant="default" className="mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    >
                      <option value="">Select a country</option>
                      <option value="FI">Finland</option>
                      <option value="SE">Sweden</option>
                      <option value="NO">Norway</option>
                      <option value="DK">Denmark</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="UK">United Kingdom</option>
                      <option value="US">United States</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card variant="default" className="mb-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                      placeholder="MM/YY"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                      placeholder="XXX"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit button */}
            <div className="flex justify-between mt-8 mb-8">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/')}
                leftIcon={<FiArrowLeft />}
              >
                Continue Shopping
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Place Order
              </Button>
            </div>
          </form>
        </div>

        {/* Right column - Order Summary */}
        <div className="md:w-1/3 mt-8 md:mt-0">
          <Card variant="default">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart items */}
              <div className="border-b border-gray-200 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="py-3">
                    <div className="flex items-center">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="h-16 w-16 object-cover rounded-md mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          €{(typeof item.product.price === 'string' 
                            ? parseFloat(item.product.price) 
                            : item.product.price) * item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">€{totalPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className="text-sm font-medium text-gray-900">€0.00</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="text-sm font-medium text-gray-900">€{(totalPrice * 0.24).toFixed(2)}</p>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <p className="text-base font-medium text-gray-900">Total</p>
                    <p className="text-base font-medium text-gray-900">€{(totalPrice * 1.24).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;