import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
import { Button, Card } from '../ui';
import { FiEdit2, FiTrash2, FiSearch, FiUser, FiUserCheck, FiUserX } from 'react-icons/fi';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        
        // Handle response format with data field
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.error('Unexpected response format:', data);
          setUsers([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const toggleAdminStatus = async (userId: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-admin`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user admin status');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update users list with the new admin status
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isAdmin: data.data.isAdmin } 
            : user
        ));
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      alert('Failed to update user admin status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted user from the list
        setUsers(users.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">User Management</h2>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          />
        </div>
      </div>

      {/* User list */}
      <Card variant="default">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                          <FiUser className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditing(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3 bg-white"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      {user.isAdmin ? (
                        <button 
                          onClick={() => {
                            // Handle removing admin rights
                            if (window.confirm(`Are you sure you want to remove admin rights from ${user.name}?`)) {
                              toggleAdminStatus(user.id);
                            }
                          }}
                          className="text-amber-600 hover:text-amber-900 mr-3 bg-white"
                          title="Remove admin rights"
                        >
                          <FiUserX size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            // Handle granting admin rights
                            if (window.confirm(`Are you sure you want to grant admin rights to ${user.name}?`)) {
                              toggleAdminStatus(user.id);
                            }
                          }}
                          className="text-green-600 hover:text-green-900 mr-3 bg-white"
                          title="Grant admin rights"
                        >
                          <FiUserCheck size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          // Handle delete confirmation
                          if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
                            deleteUser(user.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 bg-white"
                        title="Delete user"
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

      {/* User edit form would go here */}
      {isEditing && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card variant="elevated" className="w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4">
              Edit User: {selectedUser.name}
            </h3>
            <p className="mb-4 text-gray-700">
              This is a placeholder for the user edit form. In a real implementation, 
              this would contain a form to edit user details.
            </p>
            <div className="flex justify-end mt-6">
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  // TODO: Implement save functionality
                  setIsEditing(false);
                }}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement;