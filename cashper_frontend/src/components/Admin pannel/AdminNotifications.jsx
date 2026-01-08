import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Users
} from 'lucide-react';
import {
  createNotification,
  sendNotificationToAllUsers,
  getAllNotificationsAdmin,
  getAdminNotificationStats,
  updateNotification,
  deleteNotification
} from '../../services/notificationApi';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState({ type: '', priority: '', isActive: true });
  const [sendToAllUsers, setSendToAllUsers] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    link: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllNotificationsAdmin(filter);
      setNotifications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getAdminNotificationStats();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        link: formData.link || null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      };

      // If send to all users is checked, use the sendNotificationToAllUsers API
      if (sendToAllUsers) {
        await sendNotificationToAllUsers(notificationData);
        alert('Notification sent to all users successfully!');
      } else {
        // Otherwise, just create the notification
        await createNotification(notificationData);
        alert('Notification created successfully!');
      }
      
      // Reset form and close modal
      setFormData({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        link: '',
        expiresAt: ''
      });
      setSendToAllUsers(false);
      setShowCreateModal(false);
      
      // Refresh list
      fetchNotifications();
      fetchStats();
    } catch (err) {
      alert('Error creating notification: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        link: formData.link || null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      };

      await updateNotification(selectedNotification.id, updateData);
      
      setShowEditModal(false);
      setSelectedNotification(null);
      
      // Refresh list
      fetchNotifications();
      
      alert('Notification updated successfully!');
    } catch (err) {
      alert('Error updating notification: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await deleteNotification(notificationId, false); // Soft delete
      fetchNotifications();
      fetchStats();
      alert('Notification deleted successfully!');
    } catch (err) {
      alert('Error deleting notification: ' + err.message);
    }
  };

  const handleEditClick = (notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      link: notification.link || '',
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : ''
    });
    setShowEditModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
      case 'alert':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Bell size={32} /> Notification Management
          </h1>
          <p className="text-gray-600">Create and manage notifications for users</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Notification
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Total Notifications
            </h3>
            <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Active
            </h3>
            <p className="text-4xl font-bold text-green-500">{stats.active}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Inactive
            </h3>
            <p className="text-4xl font-bold text-gray-400">{stats.inactive}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
              By Type
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byType || {}).map(([type, count]) => (
                <span key={type} className="bg-gray-100 px-3 py-1 rounded-md text-sm text-gray-700 font-medium">
                  {type}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Filter size={16} /> Type:
          </label>
          <select 
            value={filter.type} 
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="alert">Alert</option>
            <option value="announcement">Announcement</option>
            <option value="update">Update</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Priority:</label>
          <select 
            value={filter.priority} 
            onChange={(e) => setFilter({...filter, priority: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Status:</label>
          <select 
            value={filter.isActive} 
            onChange={(e) => setFilter({...filter, isActive: e.target.value === 'true'})}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            Loading...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <Bell size={64} className="text-gray-300 mb-4" />
            <p>No notifications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Message</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Priority</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-4">{getTypeIcon(notification.type)}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900 max-w-[250px] truncate">
                      {notification.title}
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm max-w-[300px] truncate">
                      {notification.message.substring(0, 60)}
                      {notification.message.length > 60 && '...'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold uppercase ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        notification.priority === 'high' ? 'bg-yellow-100 text-yellow-700' :
                        notification.priority === 'normal' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {notification.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        notification.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {notification.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          onClick={() => handleEditClick(notification)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          onClick={() => handleDeleteNotification(notification.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5"
          onClick={() => {
            setShowCreateModal(false);
            setSendToAllUsers(false);
          }}
        >
          <div 
            className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Plus size={24} /> Create Notification
            </h2>
            <form onSubmit={handleCreateNotification}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder="Enter notification title"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  placeholder="Enter notification message"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="alert">Alert</option>
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="/path or https://example.com"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-5 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sendToAllUsers"
                  checked={sendToAllUsers}
                  onChange={(e) => setSendToAllUsers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="sendToAllUsers" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <Users size={18} />
                  Send to All Users
                </label>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSendToAllUsers(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <Send size={16} />
                  {loading ? 'Creating...' : 'Create Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNotification && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5"
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Edit size={24} /> Edit Notification
            </h2>
            <form onSubmit={handleUpdateNotification}>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  minLength={3}
                  maxLength={200}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="alert">Alert</option>
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <Edit size={16} />
                  {loading ? 'Updating...' : 'Update Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
