import React, { useState, useEffect } from 'react';
import { FormInput, Button } from '../ui';
import type { Product as ProductType } from '../../types/Product';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const FormTextarea: React.FC<FormTextareaProps> = ({ 
  label, 
  error, 
  helper, 
  className = '', 
  ...props 
}) => {
  const baseTextareaStyles = "appearance-none block w-full border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out";
  const errorStyles = error ? "border-red-300 focus:ring-red-500" : "border-gray-300";
  const disabledStyles = props.disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : "";
  
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          className={`${baseTextareaStyles} ${errorStyles} ${disabledStyles} py-3 px-4`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helper ? (
        <p className="mt-1 text-xs text-gray-500">{helper}</p>
      ) : null}
    </div>
  );
};

interface ProductFormProps {
  product?: ProductType;
  onSubmit: (product: Omit<ProductType, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  product, 
  onSubmit, 
  onCancel,
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const { token } = useAuth();
  
  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(`${API_URL}/products/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        const categoryData = data.success && data.data ? data.data : data;
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Set initial form data if product is provided (edit mode)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: typeof product.price === 'number' 
          ? product.price.toString() 
          : product.price || '',
        imageUrl: product.imageUrl || '',
        category: product.category || ''
      });
    }
  }, [product]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        category: formData.category
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Name"
        id="name"
        name="name"
        placeholder="Enter product name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={isSubmitting}
        required
      />
      
      <FormTextarea
        label="Description"
        id="description"
        name="description"
        placeholder="Enter product description"
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        disabled={isSubmitting}
        rows={4}
        required
      />
      
      <FormInput
        label="Price (€)"
        id="price"
        name="price"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={formData.price}
        onChange={handleChange}
        error={errors.price}
        disabled={isSubmitting}
        required
      />
      
      <FormInput
        label="Image URL"
        id="imageUrl"
        name="imageUrl"
        placeholder="https://example.com/image.jpg"
        value={formData.imageUrl}
        onChange={handleChange}
        error={errors.imageUrl}
        disabled={isSubmitting}
        required
      />
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <div className="relative">
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`appearance-none block w-full border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-lg py-3 px-4 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${isSubmitting ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
            disabled={isSubmitting}
            required
          >
            <option value="">Select a category</option>
            {/* Custom category option */}
            {formData.category && !categories.includes(formData.category) && (
              <option value={formData.category}>{formData.category} (Custom)</option>
            )}
            {/* Existing categories */}
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
        {loadingCategories && (
          <p className="mt-1 text-xs text-gray-500">Loading categories...</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          You can select an existing category or type a new one
        </p>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="w-24"
          disabled={isSubmitting}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          className="w-24"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving
            </span>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;