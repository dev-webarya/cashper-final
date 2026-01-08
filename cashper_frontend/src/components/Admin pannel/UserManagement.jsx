import React, { useState, useEffect } from 'react';
import { getUsersDetailed, getUserDetails, suspendUser, unsuspendUser, deleteUser, toggleUserActive } from '../../services/adminApi';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users when component mounts or filters change
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filterStatus, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUsersDetailed({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status_filter: filterStatus
      });

      setUsers(response.users || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
        totalPages: response.totalPages || 1
      });

      // Get total stats from response (real-time data from backend)
      if (response.totalStats) {
        setStats({
          total: response.totalStats.total || 0,
          active: response.totalStats.active || 0,
          inactive: response.totalStats.inactive || 0,
          suspended: response.totalStats.suspended || 0
        });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    try {
      setActionLoading(true);
      const response = await getUserDetails(user.id);
      setSelectedUser(response.user);
      setShowUserModal(true);
    } catch (err) {
      console.error('Error fetching user details:', err);
      alert('Failed to fetch user details: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    const action = currentStatus === 'Suspended' ? 'unsuspend' : 'suspend';
    const reason = action === 'suspend' ? prompt('Enter reason for suspension:') : null;
    
    if (action === 'suspend' && !reason) return;

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      setActionLoading(true);
      if (action === 'suspend') {
        await suspendUser(userId, reason);
      } else {
        await unsuspendUser(userId);
      }
      alert(`User ${action}ed successfully`);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error(`Error ${action}ing user:`, err);
      alert(`Failed to ${action} user: ` + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      await deleteUser(userId);
      alert('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      setActionLoading(true);
      await toggleUserActive(userId);
      alert('User status updated successfully');
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page on search
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setPagination({ ...pagination, page: 1 }); // Reset to first page on filter
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg sm:rounded-xl shadow-lg p-4 xs:p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Admin Dashboard 👨‍💼</h2>
            <p className="text-xs xs:text-sm sm:text-base text-green-50 mb-2">Monitor and manage your platform analytics</p>
            
            {/* Real-time status and timestamp */}
            <div className="flex flex-col xs:flex-row gap-3 text-xs sm:text-sm">
              <div className="flex items-center text-green-100">
                <svg className="w-3 h-3 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate">Updated: Nov 22, 12:28:18 AM</span>
              </div>
              
              <div className="flex items-center text-green-100">
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.251a.75.75 0 0 1 .75.75v1.488a.75.75 0 0 1-1.5 0v-1.488a.75.75 0 0 1 .75-.75ZM15.75 9.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM13.678 14.25a.75.75 0 0 1 .75.75v1.488a.75.75 0 0 1-1.5 0v-1.488a.75.75 0 0 1 .75-.75ZM10.5 14.25a.75.75 0 0 1 .75.75v1.488a.75.75 0 0 1-1.5 0v-1.488a.75.75 0 0 1 .75-.75Z" />
                </svg>
                <span>Real-time</span>
              </div>
            </div>
          </div>
          

        </div>
      </div>

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchUsers}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all registered users and their accounts</p>
        </div>
        <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2 justify-center text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs sm:text-sm font-semibold">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">{stats.total.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-xs sm:text-sm font-semibold">Active Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1 sm:mt-2">{stats.active.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-xs sm:text-sm font-semibold">Inactive Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-1 sm:mt-2">{stats.inactive.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-xs sm:text-sm font-semibold">Suspended</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-1 sm:mt-2">{stats.suspended.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'inactive', 'suspended'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 capitalize active:scale-95 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Join Date</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] xs:text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No users found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search term</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{user.name}</p>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500 md:hidden truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                    <p className="text-xs sm:text-sm text-gray-900 truncate">{user.email}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{user.phone}</p>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">{user.joinDate}</td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs font-semibold whitespace-nowrap ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' :
                      user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        disabled={actionLoading}
                        className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSuspendUser(user.id, user.status)}
                        disabled={actionLoading}
                        className={`p-1.5 sm:p-2 bg-gradient-to-r ${user.status === 'Suspended' ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'} text-white rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={user.status === 'Suspended' ? 'Unsuspend User' : 'Suspend User'}
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={actionLoading}
                        className="hidden sm:block p-1.5 sm:p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete User"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )))
            }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold">{pagination.total}</span> users
            </p>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold text-xs sm:text-sm">
                {pagination.page}
              </span>
              <span className="hidden xs:inline text-gray-600 text-xs sm:text-sm">of {pagination.totalPages}</span>
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-md w-full max-h-[60vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0">
              <h3 className="text-sm sm:text-base font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors active:scale-95"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex flex-col xs:flex-row items-center xs:items-start space-y-3 xs:space-y-0 xs:space-x-4 text-center xs:text-left">
                {selectedUser.profileImage ? (
                  <img 
                    src={selectedUser.profileImage} 
                    alt={selectedUser.fullName || selectedUser.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-green-500 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold flex-shrink-0">
                    {selectedUser.fullName?.charAt(0) || selectedUser.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-lg font-bold text-gray-900 truncate">{selectedUser.fullName || selectedUser.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedUser.email}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedUser.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg">
                  <p className="text-blue-600 text-xs font-semibold">Join Date</p>
                  <p className="text-sm sm:text-base font-bold text-blue-900 mt-0.5">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : selectedUser.joinDate || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-3 rounded-lg">
                  <p className="text-green-600 text-xs font-semibold">Status</p>
                  <p className="text-sm sm:text-base font-bold text-green-900 mt-0.5">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-2 sm:p-3 rounded-lg">
                  <p className="text-indigo-600 text-xs font-semibold">Email Verified</p>
                  <p className="text-sm sm:text-base font-bold text-indigo-900 mt-0.5">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-3 rounded-lg">
                  <p className="text-purple-600 text-xs font-semibold">Phone Verified</p>
                  <p className="text-sm sm:text-base font-bold text-purple-900 mt-0.5">{selectedUser.isPhoneVerified ? 'Yes' : 'No'}</p>
                </div>
              </div>
              {selectedUser.panCard && (
                <div className="border-t pt-3 sm:pt-4">
                  <h5 className="font-semibold text-gray-700 mb-2">Additional Information</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {selectedUser.panCard && <p><span className="font-medium">PAN Card:</span> {selectedUser.panCard}</p>}
                    {selectedUser.aadharCard && <p><span className="font-medium">Aadhar Card:</span> {selectedUser.aadharCard}</p>}
                    {selectedUser.city && <p><span className="font-medium">City:</span> {selectedUser.city}</p>}
                    {selectedUser.state && <p><span className="font-medium">State:</span> {selectedUser.state}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
