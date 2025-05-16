import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WishlistItem } from '../types/WishlistType';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

const Wishlist = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch(`${API_URL}/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }
        
        const responseData = await response.json();
        
        // Handle new response format with data field
        const data = responseData.success && responseData.data
          ? responseData.data
          : responseData;
          
        setWishlistItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/wishlist/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      setWishlistItems(items => items.filter(item => item.productId !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen w-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 w-full">{error}</div>;
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <button
          onClick={() => navigate('/')}
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back to Products
        </button>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Your wishlist is empty. Start adding some products!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={item.Product.imageUrl}
                alt={item.Product.name}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => navigate(`/products/${item.productId}`)}
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{item.Product.name}</h2>
                <p className="text-gray-600 mb-2">{item.Product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    ${typeof item.Product.price === 'number' 
                      ? item.Product.price.toFixed(2) 
                      : Number(item.Product.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist; 