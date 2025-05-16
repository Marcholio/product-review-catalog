import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Button, Card } from '../ui';
import { FiSave, FiRefreshCw } from 'react-icons/fi';

const Settings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    enableUserRegistration: true,
    productReviewsRequireApproval: true,
    maxUploadSizeMB: 5,
    defaultProductSortOrder: 'newest',
    autoDeleteInactiveAccounts: false,
    inactiveAccountMonths: 12,
  });
  
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSaveSuccess(false);
      
      // TODO: In a real application, we would save the settings to the backend
      // const response = await fetch(`${API_URL}/admin/settings`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(settings)
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to save settings');
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Application Settings</h2>
        <Button 
          variant="primary" 
          leftIcon={<FiSave />}
          onClick={handleSave}
          isLoading={loading}
          disabled={loading}
        >
          Save Settings
        </Button>
      </div>

      {saveSuccess && (
        <div className="mb-6 bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Settings saved successfully.</span>
        </div>
      )}

      <Card variant="default" className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableUserRegistration"
                name="enableUserRegistration"
                checked={settings.enableUserRegistration}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableUserRegistration" className="ml-2 block text-sm text-gray-900">
                Enable user registration
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoDeleteInactiveAccounts"
                name="autoDeleteInactiveAccounts"
                checked={settings.autoDeleteInactiveAccounts}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoDeleteInactiveAccounts" className="ml-2 block text-sm text-gray-900">
                Automatically delete inactive accounts
              </label>
            </div>
            
            {settings.autoDeleteInactiveAccounts && (
              <div className="ml-6">
                <label htmlFor="inactiveAccountMonths" className="block text-sm text-gray-700 mb-1">
                  Delete accounts inactive for (months):
                </label>
                <input
                  type="number"
                  id="inactiveAccountMonths"
                  name="inactiveAccountMonths"
                  value={settings.inactiveAccountMonths}
                  onChange={handleInputChange}
                  min="1"
                  max="36"
                  className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card variant="default" className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Product & Review Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="productReviewsRequireApproval"
                name="productReviewsRequireApproval"
                checked={settings.productReviewsRequireApproval}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="productReviewsRequireApproval" className="ml-2 block text-sm text-gray-900">
                Require approval for product reviews
              </label>
            </div>
            
            <div>
              <label htmlFor="defaultProductSortOrder" className="block text-sm text-gray-700 mb-1">
                Default product sort order:
              </label>
              <select
                id="defaultProductSortOrder"
                name="defaultProductSortOrder"
                value={settings.defaultProductSortOrder}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="maxUploadSizeMB" className="block text-sm text-gray-700 mb-1">
                Maximum upload size (MB):
              </label>
              <input
                type="number"
                id="maxUploadSizeMB"
                name="maxUploadSizeMB"
                value={settings.maxUploadSizeMB}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card variant="default" className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Maintenance</h3>
          <div className="space-y-4">
            <Button 
              variant="secondary" 
              leftIcon={<FiRefreshCw />}
              onClick={() => {
                // TODO: Implement cache clearing
                console.log('Clearing application cache');
                alert('Application cache cleared successfully.');
              }}
            >
              Clear Application Cache
            </Button>
            <div>
              <p className="text-sm text-gray-500 mt-2">
                Last cache cleared: Never
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;