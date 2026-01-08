import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/business-tax';

// ===================== PUBLIC ENDPOINTS =====================

/**
 * Book a free business tax consultation
 * @param {Object} bookingData - Consultation booking data
 * @returns {Promise} - API response
 */
export const bookBusinessTaxConsultation = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/consultation/book`, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Calculate business tax savings
 * @param {Object} calculationData - Tax calculation data
 * @returns {Promise} - API response with tax breakdown
 */
export const calculateBusinessTaxSavings = async (calculationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/calculator/calculate`, calculationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Submit business tax planning application
 * @param {Object} applicationData - Application form data
 * @returns {Promise} - API response
 */
export const submitBusinessTaxPlanningApplication = async (applicationData) => {
  try {
    console.log('Submitting business tax planning application:', applicationData);
    
    // Get authentication token
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token added to request');
    } else {
      console.warn('⚠️ No authentication token found');
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/application/submit`, 
      applicationData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Business Tax API Error:', error.response?.data || error.message);
    
    // Enhanced error handling
    let errorMessage = 'Failed to submit application';
    
    if (error.response?.data) {
      const data = error.response.data;
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (Array.isArray(data)) {
        errorMessage = data.map(e => `${e.field || e.loc}: ${e.msg || e.message}`).join(', ');
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

// ===================== ADMIN ENDPOINTS =====================

/**
 * Get all business tax consultations (ADMIN)
 * @param {Object} params - Query parameters (skip, limit, status)
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const getAllBusinessConsultations = async (params = {}, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/consultation/all`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get consultation by ID (ADMIN)
 * @param {string} consultationId - Consultation ID
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const getBusinessConsultationById = async (consultationId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/consultation/${consultationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update consultation status (ADMIN)
 * @param {string} consultationId - Consultation ID
 * @param {Object} statusData - Status update data
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const updateBusinessConsultationStatus = async (consultationId, statusData, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/consultation/${consultationId}/status`,
      statusData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete consultation (ADMIN)
 * @param {string} consultationId - Consultation ID
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const deleteBusinessConsultation = async (consultationId, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/consultation/${consultationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all business tax calculations (ADMIN)
 * @param {Object} params - Query parameters (skip, limit)
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const getAllBusinessTaxCalculations = async (params = {}, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/calculator/all`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get calculation by ID (ADMIN)
 * @param {string} calculationId - Calculation ID
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const getBusinessTaxCalculationById = async (calculationId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/calculator/${calculationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all business tax planning applications (ADMIN)
 * @param {Object} params - Query parameters (skip, limit, status, assigned_to)
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const getAllBusinessTaxApplications = async (params = {}, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/application/all`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get application by ID (ADMIN)
 * @param {string} applicationId - Application ID
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const getBusinessTaxApplicationById = async (applicationId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/application/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update application status (ADMIN)
 * @param {string} applicationId - Application ID
 * @param {Object} statusData - Status update data
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const updateBusinessTaxApplicationStatus = async (applicationId, statusData, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/application/${applicationId}/status`,
      statusData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Assign consultant to application (ADMIN)
 * @param {string} applicationId - Application ID
 * @param {Object} assignmentData - Assignment data
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const assignConsultantToBusinessApplication = async (applicationId, assignmentData, token) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/application/${applicationId}/assign`,
      assignmentData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete application (ADMIN)
 * @param {string} applicationId - Application ID
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response
 */
export const deleteBusinessTaxApplication = async (applicationId, token) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/application/${applicationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get business tax statistics (ADMIN)
 * @param {string} token - Admin authentication token
 * @returns {Promise} - API response with statistics
 */
export const getBusinessTaxStatistics = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
