import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { LoginForm, RegisterForm, BenefitsList } from './auth';
import { useAuth } from '../contexts/AuthContext';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !initializing) {
      navigate('/');
    }
  }, [user, initializing, navigate]);

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
  };

  const benefits = [
    "Personalized product recommendations",
    "Save products to your wishlist",
    "Write and read honest product reviews"
  ];

  // Show loading while checking auth state
  if (initializing) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Left Banner Section - Only visible on desktop */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-8 flex-col justify-center items-center">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center mb-8">
            <FiShoppingBag className="text-white h-12 w-12" />
            <h1 className="ml-3 text-4xl font-bold">Product Catalog</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-6">
            {isLogin ? 'Welcome Back!' : 'Join Our Community'}
          </h2>
          
          <p className="text-xl mb-8 text-blue-100">
            {isLogin
              ? 'Sign in to access your personalized product recommendations and reviews.'
              : 'Create an account to start exploring, reviewing, and saving your favorite products.'}
          </p>
          
          <BenefitsList 
            title="What you'll get:" 
            items={benefits} 
          />
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 md:p-10">
          {/* Mobile Logo - Only visible on mobile */}
          <div className="md:hidden flex items-center justify-center mb-6">
            <FiShoppingBag className="text-blue-600 h-8 w-8" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">Product Catalog</h1>
          </div>
          
          {isLogin ? (
            <LoginForm onSwitchToRegister={handleSwitchMode} />
          ) : (
            <RegisterForm onSwitchToLogin={handleSwitchMode} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;