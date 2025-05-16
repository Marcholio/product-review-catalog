import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Button, Card } from '../ui';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import ImageWithFallback from '../ImageWithFallback';
import ProductForm from './ProductForm';
import type { Product as ProductType } from '../../types/Product';

const ProductManagement: React.FC = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products?limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Handle new response format with data field
      const productData = data.success && data.data 
        ? data.data.products 
        : data.products;
        
      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0 text-gray-900">Product Management</h2>
        <Button 
          variant="primary"
          leftIcon={<FiPlus />}
          onClick={() => {
            setSelectedProduct(null);
            setIsEditing(true);
          }}
        >
          Add New Product
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Product list */}
      <Card variant="default">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <ImageWithFallback
                            className="h-10 w-10 rounded-md object-cover"
                            fallbackClassName="h-10 w-10 rounded-md" 
                            src={product.imageUrl}
                            alt={product.name}
                            loading="eager"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      €{typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.rating} ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsEditing(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3 bg-white"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900 bg-white"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product edit/create form */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card variant="elevated" className="w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4">
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <ProductForm
              product={selectedProduct || undefined}
              onSubmit={handleSubmitProduct}
              onCancel={() => {
                setIsEditing(false);
                setError(null);
              }}
              isSubmitting={isSubmitting}
            />
          </Card>
        </div>
      )}
    </div>
  );
  
  // Function to handle product submission (create or update)
  async function handleSubmitProduct(productData: Omit<ProductType, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>) {
    if (!token) {
      setError('You must be logged in to perform this action');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = selectedProduct 
        ? `${API_URL}/products/${selectedProduct.id}`
        : `${API_URL}/products`;
      
      const method = selectedProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }
      
      // Refresh product list
      await fetchProducts();
      
      // Close the modal
      setIsEditing(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Function to handle product deletion
  async function handleDeleteProduct(product: ProductType) {
    if (!token) {
      setError('You must be logged in to perform this action');
      return;
    }
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      
      // Refresh product list
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      window.alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  }
};

export default ProductManagement;