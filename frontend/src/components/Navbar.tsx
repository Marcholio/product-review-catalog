import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FiShoppingBag, FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiShoppingCart, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full" id="onboarding-navbar">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)} id="onboarding-logo">
              <FiShoppingBag className="h-8 w-8 text-blue-600" strokeWidth={2} />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Product Catalog
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium
                ${isActivePath('/') 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
            >
              Products
            </Link>
            
            {/* Shopping Cart Button */}
            <button
              onClick={toggleCart}
              className="relative flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium bg-white"
              aria-label="Shopping Cart"
              id="shopping-cart-button"
            >
              <FiShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span style={{color: '#ffffff !important'}} className="absolute -top-1 -right-1 bg-blue-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
            
            {user ? (
              <>
                <Link
                  to="/wishlist"
                  className={`flex items-center space-x-1 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium
                    ${isActivePath('/wishlist') 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  id="onboarding-wishlist-nav"
                >
                  <FiHeart className="h-4 w-4" />
                  <span>Wishlist</span>
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-1 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium
                      ${isActivePath('/admin') 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
                  >
                    <FiSettings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <div className="relative ml-3">
                  <div className="flex items-center space-x-1 text-gray-700 border border-gray-200 rounded-full px-3 py-1.5">
                    <FiUser className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium truncate max-w-[100px]">
                      {user.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium bg-white"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                id="onboarding-auth-button"
              >
                <FiUser className="h-4 w-4" />
                <span>Login / Sign Up</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActivePath('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            
            {/* Mobile cart button */}
            <button
              onClick={() => {
                toggleCart();
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 bg-white"
            >
              <div className="relative">
                <FiShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span style={{color: '#ffffff !important'}} className="absolute -top-1 -right-1 bg-blue-600 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </button>
            
            {user && (
              <>
                <Link
                  to="/wishlist"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath('/wishlist') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiHeart className="h-4 w-4" />
                  <span>Wishlist</span>
                </Link>
                
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActivePath('/admin') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiSettings className="h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </>
            )}
            {user ? (
              <>
                <div className="px-3 py-2 rounded-md">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FiUser className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 bg-white"
                >
                  <FiLogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiUser className="h-4 w-4" />
                <span>Login / Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 