import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Button, Card } from '../ui';
import { FiCheck, FiX, FiSearch, FiStar } from 'react-icons/fi';

interface Review {
  id: number;
  productId: number;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ReviewManagement: React.FC = () => {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewing, setIsViewing] = useState(false);

  useEffect(() => {
    // This is a placeholder. In a real app, we would fetch real reviews
    // from the backend using an admin API endpoint
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Normally we would do something like:
        // const response = await fetch(`${API_URL}/admin/reviews`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        
        // For now, using dummy data
        const dummyReviews: Review[] = [
          {
            id: 1,
            productId: 101,
            productName: 'Premium Headphones',
            userName: 'John Doe',
            rating: 4.5,
            comment: 'Great sound quality and comfortable to wear for long periods. I would recommend these to anyone looking for good quality headphones.',
            createdAt: '2023-04-15T10:30:00Z',
            status: 'pending'
          },
          {
            id: 2,
            productId: 102,
            productName: 'Wireless Keyboard',
            userName: 'Jane Smith',
            rating: 5.0,
            comment: 'Best keyboard I have ever used. The keys have a nice feel and the battery lasts for months.',
            createdAt: '2023-04-10T14:20:00Z',
            status: 'approved'
          },
          {
            id: 3,
            productId: 103,
            productName: 'Smart Watch',
            userName: 'Bob Johnson',
            rating: 2.0,
            comment: 'The battery life is terrible and the app keeps crashing. Not worth the money.',
            createdAt: '2023-04-05T09:45:00Z',
            status: 'rejected'
          },
          {
            id: 4,
            productId: 104,
            productName: 'Bluetooth Speaker',
            userName: 'Alice Williams',
            rating: 4.0,
            comment: 'Good sound for the size, but could use a bit more bass. Battery life is excellent.',
            createdAt: '2023-04-12T16:30:00Z',
            status: 'pending'
          },
          {
            id: 5,
            productId: 105,
            productName: 'Ergonomic Mouse',
            userName: 'Charlie Brown',
            rating: 3.5,
            comment: 'Took some time to get used to, but now my wrist pain is gone. A bit expensive though.',
            createdAt: '2023-04-08T11:20:00Z',
            status: 'pending'
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setReviews(dummyReviews);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [token]);

  // Filter reviews based on search query and status filter
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      review.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} className="text-amber-400 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FiStar key="half" className="text-amber-400 fill-amber-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return (
      <div className="flex">
        {stars}
        <span className="ml-1 text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Review Management</h2>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Review list */}
      <Card variant="default">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map(review => (
                  <tr key={review.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {review.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {review.productId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {review.status === 'pending' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {review.status === 'approved' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      )}
                      {review.status === 'rejected' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedReview(review);
                          setIsViewing(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 bg-white"
                      >
                        View
                      </button>
                      {review.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => {
                              // TODO: Implement approve functionality
                              console.log(`Approve review ${review.id}`);
                            }}
                            className="ml-3 text-green-600 hover:text-green-900 bg-white"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              // TODO: Implement reject functionality
                              console.log(`Reject review ${review.id}`);
                            }}
                            className="ml-3 text-red-600 hover:text-red-900 bg-white"
                          >
                            <FiX size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review detail modal */}
      {isViewing && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card variant="elevated" className="w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-2">
              Review for {selectedReview.productName}
            </h3>
            <div className="flex items-center mb-4">
              {renderStars(selectedReview.rating)}
              <span className="ml-4 text-sm text-gray-500">
                by {selectedReview.userName} on {formatDate(selectedReview.createdAt)}
              </span>
              <span className={`ml-4 px-2 text-xs font-semibold rounded-full ${
                selectedReview.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                selectedReview.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="text-gray-700">{selectedReview.comment}</p>
            </div>
            <div className="flex justify-end">
              {selectedReview.status === 'pending' && (
                <>
                  <Button 
                    variant="danger" 
                    leftIcon={<FiX />}
                    onClick={() => {
                      // TODO: Implement reject functionality
                      console.log(`Reject review ${selectedReview.id}`);
                      setIsViewing(false);
                    }}
                    className="mr-2"
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="primary" 
                    leftIcon={<FiCheck />}
                    onClick={() => {
                      // TODO: Implement approve functionality
                      console.log(`Approve review ${selectedReview.id}`);
                      setIsViewing(false);
                    }}
                    className="mr-2"
                  >
                    Approve
                  </Button>
                </>
              )}
              <Button 
                variant="secondary" 
                onClick={() => setIsViewing(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;