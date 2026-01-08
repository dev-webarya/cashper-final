// Notification API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Endpoints
const NOTIFICATION_ENDPOINTS = {
  // User endpoints
  GET_MY_NOTIFICATIONS: `${API_BASE_URL}/api/notifications/my-notifications`,
  GET_UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count`,
  GET_STATS: `${API_BASE_URL}/api/notifications/stats`,
  MARK_AS_READ: `${API_BASE_URL}/api/notifications/mark-read`,
  MARK_ALL_AS_READ: `${API_BASE_URL}/api/notifications/mark-all-read`,
  GET_BY_ID: (notificationId) => `${API_BASE_URL}/api/notifications/${notificationId}`,
  
  // Admin endpoints
  CREATE_NOTIFICATION: `${API_BASE_URL}/api/notifications/admin/create`,
  SEND_TO_ALL_USERS: `${API_BASE_URL}/api/notifications/admin/send-all`,
  GET_ALL_NOTIFICATIONS_ADMIN: `${API_BASE_URL}/api/notifications/admin/all`,
  GET_ADMIN_STATS: `${API_BASE_URL}/api/notifications/admin/stats`,
  UPDATE_NOTIFICATION: (notificationId) => `${API_BASE_URL}/api/notifications/admin/${notificationId}`,
  DELETE_NOTIFICATION: (notificationId) => `${API_BASE_URL}/api/notifications/admin/${notificationId}`,
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// ============= USER NOTIFICATION SERVICES =============

/**
 * Get user's notifications
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Number of records to skip
 * @param {number} params.limit - Number of records to return
 * @param {boolean} params.include_read - Include read notifications
 * @returns {Promise<Array>} List of notifications
 */
export const getMyNotifications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      skip: params.skip || 0,
      limit: params.limit || 50,
      include_read: params.include_read !== undefined ? params.include_read : true,
    });

    const response = await fetch(
      `${NOTIFICATION_ENDPOINTS.GET_MY_NOTIFICATIONS}?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @returns {Promise<Object>} Unread count object
 */
export const getUnreadCount = async () => {
  try {
    const response = await fetch(NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch unread count');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Get notification statistics for user
 * @returns {Promise<Object>} Statistics object
 */
export const getNotificationStats = async () => {
  try {
    const response = await fetch(NOTIFICATION_ENDPOINTS.GET_STATS, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    throw error;
  }
};

/**
 * Mark specific notifications as read
 * @param {Array<string>} notificationIds - Array of notification IDs
 * @returns {Promise<Object>} Success response
 */
export const markNotificationsAsRead = async (notificationIds) => {
  try {
    const response = await fetch(NOTIFICATION_ENDPOINTS.MARK_AS_READ, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notificationIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark notifications as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Success response
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch(NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to mark all notifications as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Notification object
 */
export const getNotificationById = async (notificationId) => {
  try {
    const response = await fetch(
      NOTIFICATION_ENDPOINTS.GET_BY_ID(notificationId),
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notification:', error);
    throw error;
  }
};

// ============= ADMIN NOTIFICATION SERVICES =============

/**
 * Create a new notification (Admin only)
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await fetch(NOTIFICATION_ENDPOINTS.CREATE_NOTIFICATION, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send notification to all users (Admin only)
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} Notification send result
 */
export const sendNotificationToAllUsers = async (notificationData) => {
  try {
    const response = await fetch(NOTIFICATION_ENDPOINTS.SEND_TO_ALL_USERS, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send notification to all users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification to all users:', error);
    throw error;
  }
};

/**
 * Get all notifications (Admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of all notifications
 */
export const getAllNotificationsAdmin = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      skip: params.skip || 0,
      limit: params.limit || 50,
    });

    if (params.type) queryParams.append('type', params.type);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const response = await fetch(
      `${NOTIFICATION_ENDPOINTS.GET_ALL_NOTIFICATIONS_ADMIN}?${queryParams}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    throw error;
  }
};

/**
 * Get admin notification statistics (Admin only)
 * @returns {Promise<Object>} Admin statistics
 */
export const getAdminNotificationStats = async () => {
  try {
    const response = await fetch(NOTIFICATION_ENDPOINTS.GET_ADMIN_STATS, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch admin statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    throw error;
  }
};

/**
 * Update notification (Admin only)
 * @param {string} notificationId - Notification ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated notification
 */
export const updateNotification = async (notificationId, updateData) => {
  try {
    const response = await fetch(
      NOTIFICATION_ENDPOINTS.UPDATE_NOTIFICATION(notificationId),
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

/**
 * Delete notification (Admin only)
 * @param {string} notificationId - Notification ID
 * @param {boolean} hardDelete - Permanently delete (true) or soft delete (false)
 * @returns {Promise<Object>} Success response
 */
export const deleteNotification = async (notificationId, hardDelete = false) => {
  try {
    const queryParams = new URLSearchParams({
      hard_delete: hardDelete,
    });

    const response = await fetch(
      `${NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION(notificationId)}?${queryParams}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Export all services
export default {
  // User services
  getMyNotifications,
  getUnreadCount,
  getNotificationStats,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  getNotificationById,
  
  // Admin services
  createNotification,
  sendNotificationToAllUsers,
  getAllNotificationsAdmin,
  getAdminNotificationStats,
  updateNotification,
  deleteNotification,
};
