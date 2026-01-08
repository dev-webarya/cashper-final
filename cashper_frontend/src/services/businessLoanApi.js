// Business Loan API Service
import { getAuthToken } from './api';

const API_BASE_URL = 'http://127.0.0.1:8000/api/business-loan';

// Helper function to make API requests with optional authentication
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available (optional for these APIs)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Something went wrong');
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message };
  }
};

// ===================== GET IN TOUCH API =====================

/**
 * Submit GET IN TOUCH form (PUBLIC - Works with or without login)
 * @param {object} formData - { name, email, phone, loan_amount, message }
 * @returns {Promise<object>} Response with success/error
 */
export const submitGetInTouch = async (formData) => {
  return await makeRequest(`${API_BASE_URL}/get-in-touch`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};

/**
 * Get all GET IN TOUCH requests (ADMIN ONLY)
 * @returns {Promise<object>} Response with list of requests
 */
export const getAllGetInTouchRequests = async () => {
  return await makeRequest(`${API_BASE_URL}/get-in-touch`, {
    method: 'GET',
  });
};

/**
 * Get user's own GET IN TOUCH requests (USER - Requires login)
 * @returns {Promise<object>} Response with user's requests
 */
export const getMyGetInTouchRequests = async () => {
  return await makeRequest(`${API_BASE_URL}/get-in-touch/my-requests`, {
    method: 'GET',
  });
};

/**
 * Update GET IN TOUCH request status (ADMIN ONLY)
 * @param {string} requestId - Request ID
 * @param {string} status - New status (pending, contacted, resolved)
 * @returns {Promise<object>} Response with success/error
 */
export const updateGetInTouchStatus = async (requestId, status) => {
  return await makeRequest(`${API_BASE_URL}/get-in-touch/${requestId}/status?status=${status}`, {
    method: 'PATCH',
  });
};

// ===================== EMI CALCULATOR API =====================

/**
 * Calculate EMI for Business Loan (PUBLIC - No login required)
 * @param {object} calculatorData - { loan_amount, tenure_months, interest_rate }
 * @returns {Promise<object>} Response with EMI calculation
 */
export const calculateEMI = async (calculatorData) => {
  return await makeRequest(`${API_BASE_URL}/calculate-emi`, {
    method: 'POST',
    body: JSON.stringify(calculatorData),
  });
};

// ===================== ELIGIBILITY CRITERIA API =====================

/**
 * Get all eligibility criteria (PUBLIC)
 * @returns {Promise<object>} Response with list of criteria
 */
export const getEligibilityCriteria = async () => {
  return await makeRequest(`${API_BASE_URL}/eligibility-criteria`, {
    method: 'GET',
  });
};

/**
 * Get eligibility criterion by ID (PUBLIC)
 * @param {string} criteriaId - Criteria ID
 * @returns {Promise<object>} Response with criterion details
 */
export const getEligibilityCriterionById = async (criteriaId) => {
  return await makeRequest(`${API_BASE_URL}/eligibility-criteria/${criteriaId}`, {
    method: 'GET',
  });
};

/**
 * Create new eligibility criterion (ADMIN ONLY)
 * @param {object} criteriaData - { title, description, icon, order, is_active }
 * @returns {Promise<object>} Response with created criterion
 */
export const createEligibilityCriterion = async (criteriaData) => {
  return await makeRequest(`${API_BASE_URL}/eligibility-criteria`, {
    method: 'POST',
    body: JSON.stringify(criteriaData),
  });
};

/**
 * Update eligibility criterion (ADMIN ONLY)
 * @param {string} criteriaId - Criteria ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Response with updated criterion
 */
export const updateEligibilityCriterion = async (criteriaId, updateData) => {
  return await makeRequest(`${API_BASE_URL}/eligibility-criteria/${criteriaId}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
};

/**
 * Delete eligibility criterion (ADMIN ONLY)
 * @param {string} criteriaId - Criteria ID
 * @returns {Promise<object>} Response with success/error
 */
export const deleteEligibilityCriterion = async (criteriaId) => {
  return await makeRequest(`${API_BASE_URL}/eligibility-criteria/${criteriaId}`, {
    method: 'DELETE',
  });
};

// ===================== LOAN APPLICATION API =====================

/**
 * Submit Business Loan Application (PUBLIC - Works with or without login)
 * @param {object} applicationData - Full application data
 * @returns {Promise<object>} Response with application_id
 */
export const submitBusinessLoanApplication = async (applicationData) => {
  return await makeRequest(`${API_BASE_URL}/apply`, {
    method: 'POST',
    body: JSON.stringify(applicationData),
  });
};

/**
 * Get all loan applications (ADMIN ONLY)
 * @returns {Promise<object>} Response with list of applications
 */
export const getAllApplications = async () => {
  return await makeRequest(`${API_BASE_URL}/applications`, {
    method: 'GET',
  });
};

/**
 * Track loan application by ID (PUBLIC - No login required)
 * @param {string} applicationId - Application ID (e.g., BL-20251110-XXXXXX)
 * @returns {Promise<object>} Response with application details
 */
export const trackApplicationById = async (applicationId) => {
  return await makeRequest(`${API_BASE_URL}/applications/tracking/${applicationId}`, {
    method: 'GET',
  });
};

/**
 * Get user's own applications (USER - Requires login)
 * @returns {Promise<object>} Response with user's applications
 */
export const getMyApplications = async () => {
  return await makeRequest(`${API_BASE_URL}/applications/my-applications`, {
    method: 'GET',
  });
};

/**
 * Update loan application (ADMIN ONLY)
 * @param {string} applicationId - Application ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object>} Response with success/error
 */
export const updateApplication = async (applicationId, updateData) => {
  return await makeRequest(`${API_BASE_URL}/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
};

/**
 * Delete loan application (ADMIN ONLY)
 * @param {string} applicationId - Application ID
 * @returns {Promise<object>} Response with success/error
 */
export const deleteApplication = async (applicationId) => {
  return await makeRequest(`${API_BASE_URL}/applications/${applicationId}`, {
    method: 'DELETE',
  });
};

// Export all functions
export default {
  // GET IN TOUCH
  submitGetInTouch,
  getAllGetInTouchRequests,
  getMyGetInTouchRequests,
  updateGetInTouchStatus,
  
  // EMI CALCULATOR
  calculateEMI,
  
  // ELIGIBILITY CRITERIA
  getEligibilityCriteria,
  getEligibilityCriterionById,
  createEligibilityCriterion,
  updateEligibilityCriterion,
  deleteEligibilityCriterion,
  
  // LOAN APPLICATIONS
  submitBusinessLoanApplication,
  getAllApplications,
  trackApplicationById,
  getMyApplications,
  updateApplication,
  deleteApplication,
};
