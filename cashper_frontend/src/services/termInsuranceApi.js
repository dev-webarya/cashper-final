import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TERM_INSURANCE_BASE = `${API_BASE_URL}/api/term-insurance`;

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
 * Submit a term insurance contact inquiry
 * @param {Object} inquiryData - { name, email, phone, age, coverage }
 * @returns {Promise<Object>} Response with inquiry ID and confirmation message
 */
export const submitContactInquiry = async (inquiryData) => {
  try {
    const response = await api.post(`/api/term-insurance/contact/submit`, inquiryData);
    return response.data;
  } catch (error) {
    console.error('Error submitting term insurance inquiry:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all term insurance inquiries (Admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} List of inquiries
 */
export const getAllInquiries = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/api/term-insurance/contact/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching term insurance inquiries:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get a specific inquiry by ID
 * @param {string} inquiryId - The inquiry ID
 * @returns {Promise<Object>} Inquiry details
 */
export const getInquiryById = async (inquiryId) => {
  try {
    const response = await api.get(`/api/term-insurance/contact/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching term insurance inquiry:', error);
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
    const response = await api.patch(`/api/term-insurance/contact/${inquiryId}/status`, {
      status,
      remarks
    });
    return response.data;
  } catch (error) {
    console.error('Error updating term insurance inquiry status:', error);
    throw error.response?.data || error;
  }
};

// ==================== APPLICATION APIs ====================

/**
 * Submit a term insurance application
 * @param {Object} applicationData - Complete application data including personal info, coverage details, address
 * @param {Object} documents - Document files object { aadhar, pan, photo, incomeProof, medicalReports }
 * @returns {Promise<Object>} Response with application number and confirmation
 */
export const submitTermInsuranceApplication = async (applicationData, documents = {}) => {
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
    if (documents.incomeProof instanceof File) {
      formData.append('incomeProof', documents.incomeProof);
    }
    if (documents.medicalReports instanceof File) {
      formData.append('medicalReports', documents.medicalReports);
    }

    // Use post with explicit config to avoid Content-Type header conflict
    const response = await api.post(`/api/term-insurance/application/submit`, formData, {
      headers: {
        // Don't set Content-Type - let browser set it with boundary
        'Content-Type': undefined,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting term insurance application:', error);
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response?.data);
    }
    throw error.response?.data || error;
  }
};

/**
 * Get all term insurance applications (Admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} List of applications
 */
export const getAllApplications = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/api/term-insurance/application/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching term insurance applications:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get a specific application by ID
 * @param {string} applicationId - The application ID
 * @returns {Promise<Object>} Application details
 */
export const getApplicationById = async (applicationId) => {
  try {
    const response = await api.get(`/api/term-insurance/application/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching term insurance application:', error);
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
    const response = await api.get(`/api/term-insurance/application/number/${appNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching term insurance application by number:', error);
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
    const response = await api.patch(`/api/term-insurance/application/${applicationId}/status`, {
      status,
      remarks
    });
    return response.data;
  } catch (error) {
    console.error('Error updating term insurance application status:', error);
    throw error.response?.data || error;
  }
};

// ==================== STATISTICS API ====================

/**
 * Get term insurance statistics (Admin)
 * @returns {Promise<Object>} Statistics including inquiries and applications counts
 */
export const getStatistics = async () => {
  try {
    const response = await api.get(`/api/term-insurance/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching term insurance statistics:', error);
    throw error.response?.data || error;
  }
};

export default {
  submitContactInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  submitTermInsuranceApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByNumber,
  updateApplicationStatus,
  getStatistics
};
