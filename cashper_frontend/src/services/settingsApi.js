import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/settings';

// Get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// ===================== GENERAL SETTINGS =====================

/**
 * Get all user settings
 */
export const getUserSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update all settings
 */
export const updateSettings = async (settingsData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/`, settingsData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error.response?.data || error;
  }
};

// ===================== NOTIFICATION PREFERENCES =====================

/**
 * Update notification preferences
 * @param {Object} preferences - { email: boolean, sms: boolean, push: boolean }
 */
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications`,
      preferences,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error.response?.data || error;
  }
};

// ===================== THEME SETTINGS =====================

/**
 * Update theme preference
 * @param {string} theme - 'light' or 'dark'
 */
export const updateTheme = async (theme) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/theme`,
      { theme },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error.response?.data || error;
  }
};

// ===================== TWO-FACTOR AUTHENTICATION =====================

/**
 * Setup 2FA - Get QR code and backup codes
 */
export const setup2FA = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/2fa/setup`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    throw error.response?.data || error;
  }
};

/**
 * Enable 2FA after scanning QR code
 * @param {string} verificationCode - 6-digit code from authenticator app
 */
export const enable2FA = async (verificationCode) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/2fa/enable`,
      { verificationCode },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    throw error.response?.data || error;
  }
};

/**
 * Disable 2FA
 */
export const disable2FA = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/2fa/disable`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    throw error.response?.data || error;
  }
};

// ===================== LOGIN HISTORY =====================

/**
 * Get login history
 * @param {number} limit - Number of records to fetch (default: 10)
 */
export const getLoginHistory = async (limit = 10) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/login-history?limit=${limit}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching login history:', error);
    throw error.response?.data || error;
  }
};

/**
 * Logout specific session
 * @param {string} sessionId - Session ID to logout
 */
export const logoutSession = async (sessionId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/logout-session`,
      { sessionId },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error logging out session:', error);
    throw error.response?.data || error;
  }
};

/**
 * Logout all sessions except current
 */
export const logoutAllSessions = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/logout-all-sessions`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error logging out all sessions:', error);
    throw error.response?.data || error;
  }
};

// ===================== PASSWORD =====================

/**
 * Change user password
 * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/auth/change-password',
      {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error.response?.data || error;
  }
};

// ===================== DATA DOWNLOAD =====================

/**
 * Request data download
 * @param {Object} options - { includeDocuments, includeTransactions, includeApplications }
 */
export const requestDataDownload = async (options = {}) => {
  try {
    const requestData = {
      includeDocuments: options.includeDocuments ?? true,
      includeTransactions: options.includeTransactions ?? true,
      includeApplications: options.includeApplications ?? true
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/download-data`,
      requestData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error requesting data download:', error);
    throw error.response?.data || error;
  }
};

// ===================== ACCOUNT DELETION =====================

/**
 * Request account deletion
 * @param {Object} data - { confirmation: 'DELETE', password, reason }
 */
export const requestAccountDeletion = async (data) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/delete-account`,
      data,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    throw error.response?.data || error;
  }
};

/**
 * Cancel account deletion
 */
export const cancelAccountDeletion = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cancel-deletion`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error cancelling account deletion:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get account deletion status
 */
export const getDeletionStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/deletion-status`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching deletion status:', error);
    throw error.response?.data || error;
  }
};

// Export all functions as a single object as well for convenience
const settingsApi = {
  // General settings
  getUserSettings,
  updateSettings,
  
  // Password
  changePassword,
  
  // Notifications
  updateNotificationPreferences,
  
  // Theme
  updateTheme,
  
  // 2FA
  setup2FA,
  enable2FA,
  disable2FA,
  
  // Login history
  getLoginHistory,
  logoutSession,
  logoutAllSessions,
  
  // Data download
  requestDataDownload,
  
  // Account deletion
  requestAccountDeletion,
  cancelAccountDeletion,
  getDeletionStatus
};

export default settingsApi;
