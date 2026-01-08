const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No authentication token found. Please login.');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to handle API errors
const handleApiError = async (response) => {
  if (response.status === 401) {
    // Unauthorized - clear storage and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminProfile');
    window.location.href = '/login?redirect=/admin';
    throw new Error('Session expired. Please login again.');
  }
  
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
};

// User Management APIs
export const getAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getUsersDetailed = async (params = {}) => {
  if (!isAuthenticated()) {
    throw new Error('Not authenticated. Please login.');
  }
  
  const { page = 1, limit = 10, search = '', status_filter = 'all' } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) queryParams.append('search', search);
  if (status_filter && status_filter !== 'all') queryParams.append('status_filter', status_filter);
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/detailed?${queryParams}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  } catch (error) {
    console.error('getUsersDetailed error:', error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/details`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
};

export const suspendUser = async (userId, reason) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/suspend`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
};

export const unsuspendUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/unsuspend`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!response.ok) await handleApiError(response);
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

export const toggleUserActive = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/toggle-active`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to toggle user status');
  return response.json();
};

// Loan Management APIs
export const getAllLoans = async () => {
  const response = await fetch(`${API_BASE_URL}/loans`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch loans');
  return response.json();
};

export const getAllLoansDetailed = async () => {
  try {
    // Try authenticated endpoint first
    const response = await fetch(`${API_BASE_URL}/loans/all`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      return response.json();
    }
  } catch (err) {
    console.warn('Authenticated endpoint failed, trying public endpoint:', err);
  }
  
  // Fallback to public endpoint (no authentication required)
  try {
    const response = await fetch(`${API_BASE_URL}/loans/all/public`);
    if (!response.ok) throw new Error('Failed to fetch detailed loans');
    return response.json();
  } catch (err) {
    throw new Error('Failed to fetch detailed loans from both endpoints');
  }
};

export const getLoanStatus = async (loanId) => {
  const response = await fetch(`${API_BASE_URL}/loans/${loanId}/status`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch loan status');
  return response.json();
};

export const getLoanDetails = async (loanId, loanType = 'personal') => {
  const response = await fetch(`${API_BASE_URL}/loans/${loanId}/details?loan_type=${loanType}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch loan details');
  return response.json();
};

export const approveLoan = async (loanId, data = {}) => {
  const response = await fetch(`${API_BASE_URL}/loans/${loanId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to approve loan');
  return response.json();
};

export const rejectLoan = async (loanId, data) => {
  const response = await fetch(`${API_BASE_URL}/loans/${loanId}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to reject loan');
  return response.json();
};

// Dashboard APIs
export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
};

export const getDashboardActivities = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/activities`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
};

export const getPendingApprovals = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/pending-approvals`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch pending approvals');
  return response.json();
};

// Insurance Management APIs
export const getAllInsurance = async () => {
  const response = await fetch(`${API_BASE_URL}/insurance/all`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch insurance');
  return response.json();
};

export const getInsuranceClaims = async () => {
  const response = await fetch(`${API_BASE_URL}/insurance/claims`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch insurance claims');
  return response.json();
};

// Investment Management APIs
export const getAllInvestments = async () => {
  const response = await fetch(`${API_BASE_URL}/investments/all`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch investments');
  return response.json();
};

export const getSipPlans = async () => {
  const response = await fetch(`${API_BASE_URL}/investments/sip-plans`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch SIP plans');
  return response.json();
};

// Reports APIs
export const getRevenueReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/revenue`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch revenue reports');
  return response.json();
};

export const getLoanReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/loans`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch loan reports');
  return response.json();
};

export const getUserReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/users`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch user reports');
  return response.json();
};

// Settings APIs
export const getAdminSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
};

export const updateAdminSettings = async (settings) => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
};

// Profile APIs
export const getAdminProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

export const updateAdminProfile = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

// Export all APIs as a single object for convenience
const adminApi = {
  // Users
  getAllUsers,
  getUsersDetailed,
  getUserDetails,
  suspendUser,
  unsuspendUser,
  deleteUser,
  toggleUserActive,
  
  // Loans
  getAllLoans,
  getAllLoansDetailed,
  getLoanStatus,
  getLoanDetails,
  approveLoan,
  rejectLoan,
  
  // Dashboard
  getDashboardStats,
  getDashboardActivities,
  getPendingApprovals,
  
  // Insurance
  getAllInsurance,
  getInsuranceClaims,
  
  // Investments
  getAllInvestments,
  getSipPlans,
  
  // Reports
  getRevenueReports,
  getLoanReports,
  getUserReports,
  
  // Settings
  getAdminSettings,
  updateAdminSettings,
  
  // Profile
  getAdminProfile,
  updateAdminProfile
};

export default adminApi;
