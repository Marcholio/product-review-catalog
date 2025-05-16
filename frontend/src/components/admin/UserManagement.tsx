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
    // This is a placeholder. In a real app, we would fetch real users
    // from the backend using an admin API endpoint
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Normally we would do something like:
        // const response = await fetch(`${API_URL}/admin/users`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        
        // For now, using dummy data
        const dummyUsers: User[] = [
          {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            isAdmin: true,
            createdAt: '2023-01-01T00:00:00Z'
          },
          {
            id: 2,
            name: 'John Doe',
            email: 'john@example.com',
            isAdmin: false,
            createdAt: '2023-01-15T00:00:00Z'
          },
          {
            id: 3,
            name: 'Jane Smith',
            email: 'jane@example.com',
            isAdmin: false,
            createdAt: '2023-02-01T00:00:00Z'
          },
          {
            id: 4,
            name: 'Bob Johnson',
            email: 'bob@example.com',
            isAdmin: false,
            createdAt: '2023-03-10T00:00:00Z'
          },
          {
            id: 5,
            name: 'Manager User',
            email: 'manager@example.com',
            isAdmin: true,
            createdAt: '2023-01-05T00:00:00Z'
          }
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setUsers(dummyUsers);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    
    fetchUsers();
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
                              // TODO: Implement admin rights removal
                              console.log(`Remove admin rights from user ${user.id}`);
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
                              // TODO: Implement admin rights granting
                              console.log(`Grant admin rights to user ${user.id}`);
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
                            // TODO: Implement delete functionality
                            console.log(`Delete user ${user.id}`);
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