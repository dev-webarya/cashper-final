import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MOTOR_INSURANCE_BASE = `${API_BASE_URL}/api/motor-insurance`;

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
 * Submit a motor insurance contact inquiry
 * @param {Object} inquiryData - { name, email, phone, age, vehicleType, registrationNumber }
 * @returns {Promise<Object>} Response with inquiry ID and confirmation message
 */
export const submitContactInquiry = async (inquiryData) => {
  try {
    const response = await api.post(`/api/motor-insurance/contact/submit`, inquiryData);
    return response.data;
  } catch (error) {
    console.error('Error submitting motor insurance inquiry:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all motor insurance inquiries (Admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} List of inquiries
 */
export const getAllInquiries = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/api/motor-insurance/contact/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching motor insurance inquiries:', error);
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
    const response = await api.get(`/api/motor-insurance/contact/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching motor insurance inquiry:', error);
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
    const response = await api.patch(`/api/motor-insurance/contact/${inquiryId}/status`, {
      status,
      remarks
    });
    return response.data;
  } catch (error) {
    console.error('Error updating motor insurance inquiry status:', error);
    throw error.response?.data || error;
  }
};

// ==================== APPLICATION APIs ====================

/**
 * Submit a motor insurance application
 * @param {Object} applicationData - Complete application data including personal info, vehicle details, address
 * @param {Object} documents - Document files object { rc, dl, vehiclePhotos, previousPolicy, addressProof }
 * @returns {Promise<Object>} Response with application number and confirmation
 */
export const submitMotorInsuranceApplication = async (applicationData, documents = {}) => {
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
    if (documents.rc instanceof File) {
      formData.append('rc', documents.rc);
    }
    if (documents.dl instanceof File) {
      formData.append('dl', documents.dl);
    }
    if (documents.vehiclePhotos instanceof File) {
      formData.append('vehiclePhotos', documents.vehiclePhotos);
    }
    if (documents.previousPolicy instanceof File) {
      formData.append('previousPolicy', documents.previousPolicy);
    }
    if (documents.addressProof instanceof File) {
      formData.append('addressProof', documents.addressProof);
    }

    // Use post with explicit config to avoid Content-Type header conflict
    const response = await api.post(`/api/motor-insurance/application/submit`, formData, {
      headers: {
        // Don't set Content-Type - let browser set it with boundary
        'Content-Type': undefined,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting motor insurance application:', error);
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response?.data);
    }
    throw error.response?.data || error;
  }
};

/**
 * Get all motor insurance applications (Admin)
 * @param {number} skip - Number of records to skip
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} List of applications
 */
export const getAllApplications = async (skip = 0, limit = 100) => {
  try {
    const response = await api.get(`/api/motor-insurance/application/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching motor insurance applications:', error);
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
    const response = await api.get(`/api/motor-insurance/application/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching motor insurance application:', error);
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
    const response = await api.get(`/api/motor-insurance/application/number/${appNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching motor insurance application by number:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update application status (Admin)
 * @param {string} applicationId - The application ID
 * @param {string} status - New status (submitted, under_review, documents_pending, inspection_pending, approved, rejected, policy_issued)
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>} Update confirmation
 */
export const updateApplicationStatus = async (applicationId, status, remarks = null) => {
  try {
    const response = await api.patch(`/api/motor-insurance/application/${applicationId}/status`, {
      status,
      remarks
    });
    return response.data;
  } catch (error) {
    console.error('Error updating motor insurance application status:', error);
    throw error.response?.data || error;
  }
};

// ==================== STATISTICS API ====================

/**
 * Get motor insurance statistics (Admin)
 * @returns {Promise<Object>} Statistics including inquiries and applications counts
 */
export const getStatistics = async () => {
  try {
    const response = await api.get(`/api/motor-insurance/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching motor insurance statistics:', error);
    throw error.response?.data || error;
  }
};

export default {
  submitContactInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  submitMotorInsuranceApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByNumber,
  updateApplicationStatus,
  getStatistics
};
