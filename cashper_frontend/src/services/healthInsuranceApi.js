import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const HEALTH_INSURANCE_BASE = `${API_BASE_URL}/api/health-insurance`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== INQUIRY (CONTACT FORM) APIs ====================

/**
 * Submit a health insurance contact inquiry
 * @param {Object} inquiryData - { name, email, phone, age, familySize, coverageAmount }
 * @returns {Promise<Object>} Response with inquiry ID and confirmation message
 */
export const submitContactInquiry = async (inquiryData) => {
  try {
    const response = await api.post(`/api/health-insurance/contact/submit`, inquiryData);
    return response.data;
  } catch (error) {
    console.error('Error submitting health insurance inquiry:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all health insurance inquiries (Admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} List of inquiries
 */
export const getAllInquiries = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/api/health-insurance/contact/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching health insurance inquiries:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get a specific health insurance inquiry by ID
 * @param {string} inquiryId - The inquiry ID
 * @returns {Promise<Object>} Inquiry details
 */
export const getInquiryById = async (inquiryId) => {
  try {
    const response = await api.get(`/api/health-insurance/contact/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health insurance inquiry:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update inquiry status (Admin)
 * @param {string} inquiryId - The inquiry ID
 * @param {string} status - New status (pending, contacted, converted, closed)
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>} Update confirmation
 */
export const updateInquiryStatus = async (inquiryId, status, remarks = null) => {
  try {
    const response = await api.patch(`/api/health-insurance/contact/${inquiryId}/status`, {
      status,
      remarks
    });
    return response.data;
  } catch (error) {
    console.error('Error updating health insurance inquiry status:', error);
    throw error.response?.data || error;
  }
};

// ==================== APPLICATION APIs ====================

/**
 * Submit a health insurance application
 * @param {Object} applicationData - Complete application data including personal info, policy details, address
 * @param {Object} documents - Document files object { aadhar, pan, photo, medicalReports, addressProof }
 * @returns {Promise<Object>} Response with application number and confirmation
 */
export const submitHealthInsuranceApplication = async (applicationData, documents = {}) => {
  try {
    // Create FormData for multipart submission
    const formData = new FormData();
    
    // Add application data fields
    Object.keys(applicationData).forEach(key => {
      if (applicationData[key] !== null && applicationData[key] !== undefined) {
        formData.append(key, applicationData[key]);
      }
    });
    
    // Add document files
    if (documents.aadhar instanceof File) {
      formData.append('aadhar', documents.aadhar);
    }
    if (documents.pan instanceof File) {
      formData.append('pan', documents.pan);
    }
    if (documents.photo instanceof File) {
      formData.append('photo', documents.photo);
    }
    if (documents.medicalReports instanceof File) {
      formData.append('medicalReports', documents.medicalReports);
    }
    if (documents.addressProof instanceof File) {
      formData.append('addressProof', documents.addressProof);
    }

    // Use post with explicit config to avoid Content-Type header conflict
    const response = await api.post(`/api/health-insurance/application/submit`, formData, {
      headers: {
        // Don't set Content-Type - let browser set it with boundary
        'Content-Type': undefined,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting health insurance application:', error);
    // Log detailed error info for 422 validation errors
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response?.data);
    }
    throw error.response?.data || error;
  }
};

/**
 * Get all health insurance applications (Admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} List of applications
 */
export const getAllApplications = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/api/health-insurance/application/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching health insurance applications:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get a specific health insurance application by ID
 * @param {string} applicationId - The application ID
 * @returns {Promise<Object>} Application details
 */
export const getApplicationById = async (applicationId) => {
  try {
    const response = await api.get(`/api/health-insurance/application/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health insurance application:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get application by application number (for tracking)
 * @param {string} appNumber - The application number
 * @returns {Promise<Object>} Application details
 */
export const getApplicationByNumber = async (appNumber) => {
  try {
    const response = await api.get(`/api/health-insurance/application/number/${appNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health insurance application by number:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update application status (Admin)
 * @param {string} applicationId - The application ID
 * @param {string} status - New status (submitted, under_review, documents_pending, medical_pending, approved, rejected, policy_issued)
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>} Update confirmation
 */
export const updateApplicationStatus = async (applicationId, status, remarks = null) => {
  try {
    const response = await api.patch(`/api/health-insurance/application/${applicationId}/status`, {
      status,
      remarks
    });
    return response.data;
  } catch (error) {
    console.error('Error updating health insurance application status:', error);
    throw error.response?.data || error;
  }
};

// ==================== STATISTICS API ====================

/**
 * Get health insurance statistics (Admin)
 * @returns {Promise<Object>} Statistics including inquiries and applications counts
 */
export const getStatistics = async () => {
  try {
    const response = await api.get(`/api/health-insurance/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health insurance statistics:', error);
    throw error.response?.data || error;
  }
};

export default {
  submitContactInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  submitHealthInsuranceApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByNumber,
  updateApplicationStatus,
  getStatistics
};
