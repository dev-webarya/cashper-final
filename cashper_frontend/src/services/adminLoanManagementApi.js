/**
 * Admin Loan Management API Service
 * Handles all admin loan management related API calls
 */

import { apiRequest, getAuthToken } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ADMIN_LOAN_MANAGEMENT_ENDPOINTS = {
  // Statistics
  GET_STATISTICS: `${API_BASE_URL}/api/admin/loan-management/statistics`,
  
  // CRUD Operations
  GET_ALL_APPLICATIONS: `${API_BASE_URL}/api/admin/loan-management/applications`,
  GET_APPLICATION_BY_ID: (id) => `${API_BASE_URL}/api/admin/loan-management/applications/${id}`,
  CREATE_APPLICATION: `${API_BASE_URL}/api/admin/loan-management/applications`,
  UPDATE_APPLICATION: (id) => `${API_BASE_URL}/api/admin/loan-management/applications/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE_URL}/api/admin/loan-management/applications/${id}/status`,
  DELETE_APPLICATION: (id) => `${API_BASE_URL}/api/admin/loan-management/applications/${id}`,
  
  // Bulk Operations
  BULK_DELETE: `${API_BASE_URL}/api/admin/loan-management/applications/bulk-delete`,
  
  // Export
  EXPORT_CSV: `${API_BASE_URL}/api/admin/loan-management/applications/export/csv`,
};

/**
 * Get loan statistics
 * @returns {Promise<object>} Statistics with counts by status
 */
export const getStatistics = async () => {
  try {
    const token = getAuthToken();
    const data = await apiRequest(ADMIN_LOAN_MANAGEMENT_ENDPOINTS.GET_STATISTICS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  } catch (error) {
    console.error('Get statistics error:', error);
    throw error;
  }
};

/**
 * Get all loan applications with filters and pagination
 * @param {object} params - Query parameters {status, loanType, search, page, limit}
 * @returns {Promise<object>} Paginated applications list
 */
export const getAllApplications = async (params = {}) => {
  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.loanType) queryParams.append('loan_type', params.loanType);
    if (params.search) queryParams.append('search', params.search);
    queryParams.append('page', params.page || 1);
    queryParams.append('limit', params.limit || 10);
    
    const url = `${ADMIN_LOAN_MANAGEMENT_ENDPOINTS.GET_ALL_APPLICATIONS}?${queryParams.toString()}`;
    
    const data = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  } catch (error) {
    console.error('Get applications error:', error);
    throw error;
  }
};

/**
 * Get a single application by ID
 * @param {string} applicationId - Application ID
 * @returns {Promise<object>} Application details
 */
export const getApplicationById = async (applicationId) => {
  try {
    const token = getAuthToken();
    const data = await apiRequest(
      ADMIN_LOAN_MANAGEMENT_ENDPOINTS.GET_APPLICATION_BY_ID(applicationId),
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return data;
  } catch (error) {
    console.error('Get application error:', error);
    throw error;
  }
};

/**
 * Create a new loan application
 * @param {object} applicationData - Application data
 * @returns {Promise<object>} Created application
 */
export const createApplication = async (applicationData) => {
  try {
    const token = getAuthToken();
    const data = await apiRequest(
      ADMIN_LOAN_MANAGEMENT_ENDPOINTS.CREATE_APPLICATION,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      }
    );
    return data;
  } catch (error) {
    console.error('Create application error:', error);
    throw error;
  }
};

/**
 * Update application details
 * @param {string} applicationId - Application ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Updated application
 */
export const updateApplication = async (applicationId, updateData) => {
  try {
    const token = getAuthToken();
    const data = await apiRequest(
      ADMIN_LOAN_MANAGEMENT_ENDPOINTS.UPDATE_APPLICATION(applicationId),
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      }
    );
    return data;
  } catch (error) {
    console.error('Update application error:', error);
    throw error;
  }
};

/**
 * Update application status
 * @param {string} applicationId - Application ID
 * @param {string} newStatus - New status (Pending, Under Review, Approved, Rejected, Disbursed)
 * @param {string} rejectionReason - Reason for rejection (if applicable)
 * @returns {Promise<object>} Update response
 */
export const updateStatus = async (applicationId, newStatus, rejectionReason = null) => {
  try {
    const token = getAuthToken();
    const statusData = {
      status: newStatus
    };
    
    if (newStatus === 'Rejected' && rejectionReason) {
      statusData.rejectionReason = rejectionReason;
    }
    
    const data = await apiRequest(
      ADMIN_LOAN_MANAGEMENT_ENDPOINTS.UPDATE_STATUS(applicationId),
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusData)
      }
    );
    return data;
  } catch (error) {
    console.error('Update status error:', error);
    throw error;
  }
};

/**
 * Delete an application
 * @param {string} applicationId - Application ID
 * @returns {Promise<object>} Delete response
 */
export const deleteApplication = async (applicationId) => {
  try {
    const token = getAuthToken();
    const data = await apiRequest(
      ADMIN_LOAN_MANAGEMENT_ENDPOINTS.DELETE_APPLICATION(applicationId),
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return data;
  } catch (error) {
    console.error('Delete application error:', error);
    throw error;
  }
};

/**
 * Bulk delete applications
 * @param {array} applicationIds - Array of application IDs
 * @returns {Promise<object>} Bulk delete response
 */
export const bulkDelete = async (applicationIds) => {
  try {
    const token = getAuthToken();
    const data = await apiRequest(
      ADMIN_LOAN_MANAGEMENT_ENDPOINTS.BULK_DELETE,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationIds)
      }
    );
    return data;
  } catch (error) {
    console.error('Bulk delete error:', error);
    throw error;
  }
};

/**
 * Export applications to CSV
 * @param {object} filters - Filter parameters {status, loanType}
 * @returns {Promise<object>} CSV data
 */
export const exportToCSV = async (filters = {}) => {
  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.loanType) queryParams.append('loan_type', filters.loanType);
    
    const url = `${ADMIN_LOAN_MANAGEMENT_ENDPOINTS.EXPORT_CSV}?${queryParams.toString()}`;
    
    const data = await apiRequest(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return data;
  } catch (error) {
    console.error('Export CSV error:', error);
    throw error;
  }
};

export default {
  getStatistics,
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateStatus,
  deleteApplication,
  bulkDelete,
  exportToCSV
};
