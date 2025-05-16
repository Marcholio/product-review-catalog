import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiHome, FiPackage, FiUsers, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { Card } from '../ui';
import ProductManagement from './ProductManagement';
import UserManagement from './UserManagement';
import ReviewManagement from './ReviewManagement';
import Settings from './Settings';

type Tab = 'dashboard' | 'products' | 'users' | 'reviews' | 'settings';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Redirect non-admin users
  if (!user || !user.isAdmin) {
    return <Navigate to="/" />;
  }

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UserManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Dashboard cards */}
              <Card variant="default" className="p-6">
                <div className="flex items-center mb-4">
                  <FiPackage className="mr-2 text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold">Products</h3>
                </div>
                <p className="text-3xl font-bold">123</p>
                <p className="text-sm text-gray-500 mt-1">Total products</p>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium bg-white"
                >
                  Manage products →
                </button>
              </Card>
              
              <Card variant="default" className="p-6">
                <div className="flex items-center mb-4">
                  <FiUsers className="mr-2 text-green-600" size={20} />
                  <h3 className="text-lg font-semibold">Users</h3>
                </div>
                <p className="text-3xl font-bold">45</p>
                <p className="text-sm text-gray-500 mt-1">Registered users</p>
                <button 
                  onClick={() => setActiveTab('users')}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium bg-white"
                >
                  Manage users →
                </button>
              </Card>
              
              <Card variant="default" className="p-6">
                <div className="flex items-center mb-4">
                  <FiMessageSquare className="mr-2 text-amber-600" size={20} />
                  <h3 className="text-lg font-semibold">Reviews</h3>
                </div>
                <p className="text-3xl font-bold">38</p>
                <p className="text-sm text-gray-500 mt-1">Pending reviews</p>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium bg-white"
                >
                  Moderate reviews →
                </button>
              </Card>
              
              <Card variant="default" className="p-6">
                <div className="flex items-center mb-4">
                  <FiSettings className="mr-2 text-gray-600" size={20} />
                  <h3 className="text-lg font-semibold">Settings</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Configure application settings and permissions</p>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium bg-white"
                >
                  Go to settings →
                </button>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left bg-white ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiHome className="mr-3" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left bg-white ${
                  activeTab === 'products' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiPackage className="mr-3" />
                Products
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left bg-white ${
                  activeTab === 'users' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiUsers className="mr-3" />
                Users
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left bg-white ${
                  activeTab === 'reviews' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiMessageSquare className="mr-3" />
                Reviews
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left bg-white ${
                  activeTab === 'settings' 
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiSettings className="mr-3" />
                Settings
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile navigation */}
      <div className="w-full md:hidden bg-white p-4 border-b border-gray-200 flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg mr-2 bg-white ${
            activeTab === 'dashboard' 
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiHome />
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg mr-2 bg-white ${
            activeTab === 'products' 
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiPackage />
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg mr-2 bg-white ${
            activeTab === 'users' 
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiUsers />
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg mr-2 bg-white ${
            activeTab === 'reviews' 
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiMessageSquare />
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg bg-white ${
            activeTab === 'settings' 
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiSettings />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;