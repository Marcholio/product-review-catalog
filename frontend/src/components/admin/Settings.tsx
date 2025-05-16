import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Button, Card } from '../ui';
import { FiSave, FiLock, FiInfo } from 'react-icons/fi';

const Settings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    // Password Settings
    minimumPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiryDays: 90,
    preventPasswordReuse: true,
    passwordHistoryCount: 5,
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
          <div className="flex items-center mb-4">
            <FiLock className="mr-2 text-blue-600" />
            <h3 className="text-lg font-semibold">Password Security Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiInfo className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    These settings determine the password requirements for all users of the application.
                    Changes will apply to new passwords and password resets.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="minimumPasswordLength" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Password Length
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="minimumPasswordLength"
                  name="minimumPasswordLength"
                  value={settings.minimumPasswordLength}
                  onChange={handleInputChange}
                  min="6"
                  max="32"
                  className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                />
                <span className="ml-2 text-sm text-gray-500">characters</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireUppercase"
                  name="requireUppercase"
                  checked={settings.requireUppercase}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-900">
                  Require uppercase letters
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireLowercase"
                  name="requireLowercase"
                  checked={settings.requireLowercase}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireLowercase" className="ml-2 block text-sm text-gray-900">
                  Require lowercase letters
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireNumbers"
                  name="requireNumbers"
                  checked={settings.requireNumbers}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-900">
                  Require numbers
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireSpecialChars"
                  name="requireSpecialChars"
                  checked={settings.requireSpecialChars}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-900">
                  Require special characters
                </label>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div>
                <label htmlFor="passwordExpiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Expiry Period
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="passwordExpiryDays"
                    name="passwordExpiryDays"
                    value={settings.passwordExpiryDays}
                    onChange={handleInputChange}
                    min="0"
                    max="365"
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                  />
                  <span className="ml-2 text-sm text-gray-500">days (0 = never expires)</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="preventPasswordReuse"
                    name="preventPasswordReuse"
                    checked={settings.preventPasswordReuse}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="preventPasswordReuse" className="ml-2 block text-sm text-gray-900">
                    Prevent password reuse
                  </label>
                </div>
                
                {settings.preventPasswordReuse && (
                  <div className="mt-2 ml-6">
                    <label htmlFor="passwordHistoryCount" className="block text-sm text-gray-700 mb-1">
                      Remember previous passwords:
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="passwordHistoryCount"
                        name="passwordHistoryCount"
                        value={settings.passwordHistoryCount}
                        onChange={handleInputChange}
                        min="1"
                        max="24"
                        className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white text-gray-900"
                      />
                      <span className="ml-2 text-sm text-gray-500">most recent passwords</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  // Calculate password strength based on settings
                  const entropy = 
                    Math.log2(
                      Math.pow(26, settings.requireLowercase ? 1 : 0) * 
                      Math.pow(26, settings.requireUppercase ? 1 : 0) * 
                      Math.pow(10, settings.requireNumbers ? 1 : 0) * 
                      Math.pow(32, settings.requireSpecialChars ? 1 : 0)
                    ) * settings.minimumPasswordLength;
                    
                  let strength = "Weak";
                  if (entropy > 60) strength = "Strong";
                  else if (entropy > 40) strength = "Medium";
                  
                  alert(`Based on current settings, password strength: ${strength} (Entropy: ${entropy.toFixed(2)} bits)`);
                }}
              >
                Estimate Password Strength
              </Button>
              <span className="ml-2 text-sm text-gray-500">Tests the strength of passwords based on current settings</span>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default Settings;