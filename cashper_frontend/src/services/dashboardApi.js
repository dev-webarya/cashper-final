// Dashboard API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

/**
 * Get dashboard statistics for current user
 * @returns {Promise<Object>} Dashboard stats including loans, insurance, investments, etc.
 */
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    console.log('📡 API Call - getDashboardStats');
    console.log('🔑 Token exists:', !!token);
    console.log('🌐 API URL:', `${API_BASE_URL}/api/dashboard/stats`);
    
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    console.log('📊 Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      throw new Error(error.detail || 'Failed to fetch dashboard statistics');
    }

    const data = await response.json();
    console.log('✅ Dashboard stats data:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get user quick info for dashboard header
 * @returns {Promise<Object>} User information
 */
export const getUserQuickInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/user-info`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch user information');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

/**
 * Submit a support request
 * @param {Object} requestData - Support request data
 * @returns {Promise<Object>} Created support ticket
 */
export const submitSupportRequest = async (requestData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/support`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit support request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting support request:', error);
    throw error;
  }
};

/**
 * Get user's support tickets
 * @returns {Promise<Array>} List of support tickets
 */
export const getMySupportTickets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/support`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch support tickets');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
};

/**
 * Upload a document
 * @param {File} file - File to upload
 * @param {string} documentType - Type of document
 * @param {string} category - Document category
 * @returns {Promise<Object>} Uploaded document info
 */
export const uploadDocument = async (file, documentType = 'General Document', category = 'general') => {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('category', category);

    const response = await fetch(`${API_BASE_URL}/api/dashboard/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

/**
 * Get user's uploaded documents
 * @returns {Promise<Object>} List of documents with total count
 */
export const getMyDocuments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/documents`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch documents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} documentId - Document ID to delete
 * @returns {Promise<Object>} Delete response
 */
export const deleteDocument = async (documentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/documents/${documentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// ==================== INSURANCE MANAGEMENT APIs ====================

/**
 * Get insurance summary for current user
 * @returns {Promise<Object>} Insurance summary with counts and totals
 */
export const getInsuranceSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/insurance/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch insurance summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching insurance summary:', error);
    throw error;
  }
};

/**
 * Get all insurance policies for current user
 * @returns {Promise<Array>} List of insurance policies
 */
export const getInsurancePolicies = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/insurance/policies`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch insurance policies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    throw error;
  }
};

/**
 * Get insurance claim history for current user
 * @returns {Promise<Array>} List of insurance claims
 */
export const getInsuranceClaims = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/insurance/claims`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch insurance claims');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching insurance claims:', error);
    throw error;
  }
};

// ==================== LOAN MANAGEMENT APIs ====================

/**
 * Get all loans for current user
 * @returns {Promise<Object>} Loans data with statistics
 */
export const getUserLoans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/loans`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch loans');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching loans:', error);
    throw error;
  }
};

/**
 * Get loan details by ID
 * @param {string} loanId - Loan ID
 * @returns {Promise<Object>} Loan details
 */
export const getLoanDetails = async (loanId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/loans/${loanId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch loan details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching loan details:', error);
    throw error;
  }
};

// ==================== INSURANCE MANAGEMENT APIs ====================

/**
 * Get all insurance policies for current user
 * @returns {Promise<Object>} Insurance policies data
 */
export const getUserInsurance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/insurance`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch insurance policies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    throw error;
  }
};

/**
 * Get all user insurance applications (Health, Motor, Term)
 * @returns {Promise<Array>} List of insurance applications
 */
export const getUserInsuranceApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/insurance/applications`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch insurance applications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching insurance applications:', error);
    throw error;
  }
};

// ==================== INVESTMENT MANAGEMENT APIs ====================

/**
 * Get all investments for current user
 * @returns {Promise<Object>} Investments data with portfolio summary
 */
export const getUserInvestments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/investments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch investments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

/**
 * Get financial growth trend data with time period filter
 * @param {string} period - Time period: 3months, 6months, 12months, all
 * @returns {Promise<Object>} Financial growth trend data with chart data
 */
export const getFinancialGrowthTrend = async (period = '6months') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/financial-growth-trend?period=${period}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch financial growth trend');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching financial growth trend:', error);
    throw error;
  }
};

/**
 * Get application status overview across all services
 * @returns {Promise<Object>} Application status distribution and breakdown
 */
export const getApplicationStatusOverview = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/application-status-overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch application status overview');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching application status overview:', error);
    throw error;
  }
};

/**
 * Get recent activities across all services
 * @param {number} limit - Maximum number of activities to return (default: 10)
 * @returns {Promise<Object>} Recent activities list
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/recent-activities?limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch recent activities');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// ==================== SPECIFIC INSURANCE APIs ====================

/**
 * Get Health Insurance statistics for current user
 * @returns {Promise<Object>} Health insurance statistics
 */
export const getHealthInsuranceStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health-insurance/statistics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch health insurance statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching health insurance statistics:', error);
    throw error;
  }
};

/**
 * Get all Health Insurance applications for current user
 * @returns {Promise<Array>} List of health insurance applications
 */
export const getHealthInsuranceApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health-insurance/application/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch health insurance applications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching health insurance applications:', error);
    throw error;
  }
};

/**
 * Get Motor Insurance statistics for current user
 * @returns {Promise<Object>} Motor insurance statistics
 */
export const getMotorInsuranceStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/motor-insurance/statistics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch motor insurance statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching motor insurance statistics:', error);
    throw error;
  }
};

/**
 * Get all Motor Insurance applications for current user
 * @returns {Promise<Array>} List of motor insurance applications
 */
export const getMotorInsuranceApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/motor-insurance/application/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch motor insurance applications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching motor insurance applications:', error);
    throw error;
  }
};

/**
 * Get Term Insurance statistics for current user
 * @returns {Promise<Object>} Term insurance statistics
 */
export const getTermInsuranceStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/term-insurance/statistics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch term insurance statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching term insurance statistics:', error);
    throw error;
  }
};

/**
 * Get all Term Insurance applications for current user
 * @returns {Promise<Array>} List of term insurance applications
 */
export const getTermInsuranceApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/term-insurance/application/all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch term insurance applications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching term insurance applications:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getUserQuickInfo,
  submitSupportRequest,
  getMySupportTickets,
  uploadDocument,
  getMyDocuments,
  deleteDocument,
  getInsuranceSummary,
  getInsurancePolicies,
  getInsuranceClaims,
  getUserLoans,
  getLoanDetails,
  getUserInsurance,
  getUserInsuranceApplications,
  getUserInvestments,
  getFinancialGrowthTrend,
  getApplicationStatusOverview,
  getRecentActivities,
  getHealthInsuranceStats,
  getHealthInsuranceApplications,
  getMotorInsuranceStats,
  getMotorInsuranceApplications,
  getTermInsuranceStats,
  getTermInsuranceApplications,
};
