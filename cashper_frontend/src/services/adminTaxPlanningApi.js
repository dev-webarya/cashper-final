const API_BASE_URL = 'http://127.0.0.1:8000/api/admin/tax-planning';

// Helper function to get auth headers with better error handling
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
  
  if (!token) {
    console.warn('No authentication token found. User may need to login.');
  }
  
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Helper function to handle auth errors
const handleAuthError = (error, context = 'API Call') => {
  console.error(`${context} - Auth Error:`, error);
  
  // Check if it's a 401 unauthorized
  if (error?.status === 401 || error?.message?.includes('401')) {
    // Clear stored tokens
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
    
    // Redirect to login if available
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    throw new Error('Session expired. Please login again.');
  }
  
  throw error;
};

// ==================== TAX PLANNING STATISTICS ====================

/**
 * Get Tax Planning Statistics
 * @returns {Promise<Object>} Tax planning stats
 */
export const getTaxPlanningStats = async () => {
  try {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No authentication token available. Please login first.');
    }
    
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      
      // Handle specific status codes
      if (response.status === 401) {
        handleAuthError({ status: 401, message: error.detail }, 'getTaxPlanningStats');
      }
      
      throw new Error(error.detail || `Failed to fetch tax planning stats (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tax planning stats:', error.message);
    throw error;
  }
};

// ==================== TAX PLANNING APPLICATIONS ====================

/**
 * Get all tax planning applications with filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.type_filter - Filter by type (personal, business, all)
 * @param {string} params.status_filter - Filter by status
 * @param {string} params.search - Search query
 * @returns {Promise<Object>} Applications data with pagination
 */
export const getAllTaxPlanningApplications = async (params = {}) => {
  try {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No authentication token available. Please login first.');
    }
    
    const { page = 1, limit = 10, type_filter = 'all', status_filter = 'all', search = '' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type_filter && type_filter !== 'all') {
      queryParams.append('type_filter', type_filter);
    }
    
    if (status_filter && status_filter !== 'all') {
      queryParams.append('status_filter', status_filter);
    }
    
    if (search) {
      queryParams.append('search', search);
    }
    
    const response = await fetch(`${API_BASE_URL}/applications?${queryParams}`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      
      if (response.status === 401) {
        handleAuthError({ status: 401, message: error.detail }, 'getAllTaxPlanningApplications');
      }
      
      throw new Error(error.detail || `Failed to fetch applications (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching tax planning applications:', error.message);
    throw error;
  }
};

/**
 * Get detailed information about a specific application
 * @param {string} applicationId - Application ID
 * @param {string} applicationType - Type (personal or business)
 * @returns {Promise<Object>} Application details
 */
export const getTaxPlanningApplicationDetails = async (applicationId, applicationType) => {
  try {
    const queryParams = new URLSearchParams({
      application_type: applicationType
    });
    
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch application details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error;
  }
};

/**
 * Update application status
 * @param {string} applicationId - Application ID
 * @param {Object} data - Update data
 * @param {string} data.application_type - Type (personal or business)
 * @param {string} data.status - New status
 * @param {string} data.adminNotes - Admin notes (optional)
 * @param {string} data.scheduledDate - Scheduled date (optional)
 * @returns {Promise<Object>} Update result
 */
export const updateTaxPlanningApplicationStatus = async (applicationId, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update application status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

/**
 * Assign consultant to application
 * @param {string} applicationId - Application ID
 * @param {Object} data - Assignment data
 * @param {string} data.application_type - Type (personal or business)
 * @param {string} data.assignedTo - Consultant name
 * @param {string} data.adminNotes - Admin notes (optional)
 * @returns {Promise<Object>} Assignment result
 */
export const assignTaxPlanningConsultant = async (applicationId, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/assign`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to assign consultant');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error assigning consultant:', error);
    throw error;
  }
};

/**
 * Delete application
 * @param {string} applicationId - Application ID
 * @param {string} applicationType - Type (personal or business)
 * @returns {Promise<Object>} Delete result
 */
export const deleteTaxPlanningApplication = async (applicationId, applicationType) => {
  try {
    const queryParams = new URLSearchParams({
      application_type: applicationType
    });
    
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}?${queryParams}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete application');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

// ==================== TAX CONSULTATIONS ====================

/**
 * Get all tax consultation bookings
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.type_filter - Filter by type (personal, business, all)
 * @param {string} params.status_filter - Filter by status
 * @returns {Promise<Object>} Consultations data with pagination
 */
export const getAllTaxConsultations = async (params = {}) => {
  try {
    const { page = 1, limit = 10, type_filter = 'all', status_filter = 'all' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (type_filter && type_filter !== 'all') {
      queryParams.append('type_filter', type_filter);
    }
    
    if (status_filter && status_filter !== 'all') {
      queryParams.append('status_filter', status_filter);
    }
    
    const response = await fetch(`${API_BASE_URL}/consultations?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch consultations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching consultations:', error);
    throw error;
  }
};

// ==================== DOCUMENTS MANAGEMENT ====================

/**
 * Get all tax planning documents
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.doc_type_filter - Filter by document type
 * @param {string} params.status_filter - Filter by verification status
 * @returns {Promise<Object>} Documents data with pagination
 */
export const getTaxPlanningDocuments = async (params = {}) => {
  try {
    const { page = 1, limit = 10, doc_type_filter = 'all', status_filter = 'all' } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (doc_type_filter && doc_type_filter !== 'all') {
      queryParams.append('doc_type_filter', doc_type_filter);
    }
    
    if (status_filter && status_filter !== 'all') {
      queryParams.append('status_filter', status_filter);
    }
    
    const response = await fetch(`${API_BASE_URL}/documents?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
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
 * Download a document
 * @param {string} documentId - Document ID
 * @returns {Promise<Blob>} Document blob
 */
export const downloadTaxPlanningDocument = async (documentId) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/admin/documents/${documentId}/download`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to download document');
    }
    
    // Return blob for file download
    return await response.blob();
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};

/**
 * Update document verification status
 * @param {string} documentId - Document ID
 * @param {string} status - New status (pending, verified, rejected)
 * @returns {Promise<Object>} Update result
 */
export const updateDocumentStatus = async (documentId, status) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/admin/documents/${documentId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update document status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

// ==================== DATA EXPORT ====================

/**
 * Export tax planning data to CSV
 * @param {Object} params - Export parameters
 * @param {string} params.data_type - Type of data (applications, consultations, documents)
 * @param {string} params.type_filter - Filter by type (personal, business, all)
 * @param {string} params.status_filter - Filter by status
 * @returns {Promise<Blob>} CSV file as blob
 */
export const exportTaxPlanningDataToCSV = async (params = {}) => {
  try {
    const { data_type, type_filter = 'all', status_filter = 'all' } = params;
    
    if (!data_type) {
      throw new Error('data_type is required');
    }
    
    const queryParams = new URLSearchParams({
      data_type: data_type
    });
    
    if (type_filter && type_filter !== 'all') {
      queryParams.append('type_filter', type_filter);
    }
    
    if (status_filter && status_filter !== 'all') {
      queryParams.append('status_filter', status_filter);
    }
    
    const response = await fetch(`${API_BASE_URL}/export-csv?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to export data');
    }
    
    // Get the CSV blob
    const blob = await response.blob();
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `tax_planning_${data_type}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return blob;
  } catch (error) {
    console.error('Error exporting data to CSV:', error);
    throw error;
  }
};

/**
 * Export applications to CSV with current filters
 * @param {Object} filters - Current filter state
 * @returns {Promise<Blob>} CSV file
 */
export const exportApplicationsCSV = async (filters = {}) => {
  return exportTaxPlanningDataToCSV({
    data_type: 'applications',
    ...filters
  });
};

/**
 * Export consultations to CSV with current filters
 * @param {Object} filters - Current filter state
 * @returns {Promise<Blob>} CSV file
 */
export const exportConsultationsCSV = async (filters = {}) => {
  return exportTaxPlanningDataToCSV({
    data_type: 'consultations',
    ...filters
  });
};

/**
 * Export documents to CSV with current filters
 * @param {Object} filters - Current filter state
 * @returns {Promise<Blob>} CSV file
 */
export const exportDocumentsCSV = async (filters = {}) => {
  return exportTaxPlanningDataToCSV({
    data_type: 'documents',
    ...filters
  });
};

// Export all functions
export default {
  getTaxPlanningStats,
  getAllTaxPlanningApplications,
  getTaxPlanningApplicationDetails,
  updateTaxPlanningApplicationStatus,
  assignTaxPlanningConsultant,
  deleteTaxPlanningApplication,
  getAllTaxConsultations,
  getTaxPlanningDocuments,
  downloadTaxPlanningDocument,
  updateDocumentStatus,
  exportTaxPlanningDataToCSV,
  exportApplicationsCSV,
  exportConsultationsCSV,
  exportDocumentsCSV
};
