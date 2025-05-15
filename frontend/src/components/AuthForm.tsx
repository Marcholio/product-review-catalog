import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiMail, FiLock, FiUser, FiShoppingBag } from 'react-icons/fi';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (!isLogin && !name) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      console.error('Auth form error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="bg-blue-500/30 p-6 rounded-lg">
            <p className="text-lg font-medium mb-2">What you'll get:</p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Personalized product recommendations</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save products to your wishlist</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-blue-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Write and read honest product reviews</span>
              </li>
            </ul>
          </div>
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
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    placeholder="John Smith"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  placeholder={isLogin ? "Your password" : "Create a password"}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {isLogin ? "" : "Must be at least 6 characters long"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>{isLogin ? 'Sign in' : 'Create account'}</>
                )}
              </button>
            </div>

            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? 'New to Product Catalog?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {isLogin ? 'Create a new account' : 'Sign in to existing account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 