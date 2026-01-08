// Personal Tax Planning API Functions
// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Personal Tax Planning API Endpoints
export const PERSONAL_TAX_ENDPOINTS = {
  // Public endpoints
  BOOK_CONSULTATION: `${API_BASE_URL}/api/personal-tax/consultation/book`,
  CALCULATE_TAX: `${API_BASE_URL}/api/personal-tax/calculator/calculate`,
  SUBMIT_APPLICATION: `${API_BASE_URL}/api/personal-tax/application/submit`,
  
  // Admin endpoints
  GET_ALL_CONSULTATIONS: `${API_BASE_URL}/api/personal-tax/consultation/all`,
  GET_CONSULTATION_BY_ID: (id) => `${API_BASE_URL}/api/personal-tax/consultation/${id}`,
  UPDATE_CONSULTATION_STATUS: (id) => `${API_BASE_URL}/api/personal-tax/consultation/${id}/status`,
  DELETE_CONSULTATION: (id) => `${API_BASE_URL}/api/personal-tax/consultation/${id}`,
  
  GET_ALL_CALCULATIONS: `${API_BASE_URL}/api/personal-tax/calculator/all`,
  GET_CALCULATION_BY_ID: (id) => `${API_BASE_URL}/api/personal-tax/calculator/${id}`,
  
  GET_ALL_APPLICATIONS: `${API_BASE_URL}/api/personal-tax/application/all`,
  GET_APPLICATION_BY_ID: (id) => `${API_BASE_URL}/api/personal-tax/application/${id}`,
  UPDATE_APPLICATION_STATUS: (id) => `${API_BASE_URL}/api/personal-tax/application/${id}/status`,
  ASSIGN_CONSULTANT: (id) => `${API_BASE_URL}/api/personal-tax/application/${id}/assign`,
  DELETE_APPLICATION: (id) => `${API_BASE_URL}/api/personal-tax/application/${id}`,
  
  GET_STATISTICS: `${API_BASE_URL}/api/personal-tax/statistics`,
};

// ===================== PUBLIC API FUNCTIONS =====================

/**
 * Book a free tax consultation (Hero Section Form)
 * @param {object} consultationData - Consultation booking data
 * @param {string} consultationData.name - Full name
 * @param {string} consultationData.email - Email address
 * @param {string} consultationData.phone - Phone number (10 digits)
 * @param {string} consultationData.income - Income range (below-5, 5-10, 10-20, 20-50, above-50)
 * @param {string} consultationData.taxRegime - Tax regime (old, new, not-sure)
 * @returns {Promise<object>} Booking confirmation
 */
export const bookTaxConsultation = async (consultationData) => {
  try {
    const response = await fetch(PERSONAL_TAX_ENDPOINTS.BOOK_CONSULTATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to book consultation');
    }

    return await response.json();
  } catch (error) {
    console.error('Book tax consultation error:', error);
    throw error;
  }
};

/**
 * Calculate tax savings (Tax Calculator Section)
 * @param {object} calculationData - Tax calculation data
 * @param {number} calculationData.grossIncome - Annual gross income
 * @param {number} calculationData.section80C - Section 80C investments (max 1.5L)
 * @param {number} calculationData.section80D - Section 80D health insurance (max 50K)
 * @param {number} calculationData.nps80CCD1B - NPS additional deduction (max 50K)
 * @param {number} calculationData.homeLoanInterest - Home loan interest (max 2L)
 * @param {string} calculationData.name - Optional name for follow-up
 * @param {string} calculationData.email - Optional email for follow-up
 * @param {string} calculationData.phone - Optional phone for follow-up
 * @returns {Promise<object>} Tax calculation results with savings
 */
export const calculateTaxSavings = async (calculationData) => {
  try {
    const response = await fetch(PERSONAL_TAX_ENDPOINTS.CALCULATE_TAX, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calculationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to calculate tax');
    }

    return await response.json();
  } catch (error) {
    console.error('Calculate tax savings error:', error);
    throw error;
  }
};

/**
 * Submit personal tax planning application (Main Application Form)
 * @param {object} applicationData - Tax planning application data
 * @param {string} applicationData.fullName - Full name
 * @param {string} applicationData.emailAddress - Email address
 * @param {string} applicationData.phoneNumber - Phone number (10 digits)
 * @param {string} applicationData.panNumber - PAN card number (ABCDE1234F format)
 * @param {string} applicationData.annualIncome - Annual income range
 * @param {string} applicationData.employmentType - Employment type
 * @param {string} applicationData.preferredTaxRegime - Preferred tax regime (optional)
 * @param {string} applicationData.additionalInfo - Additional information (optional)
 * @returns {Promise<object>} Application confirmation
 */
export const submitTaxPlanningApplication = async (applicationData) => {
  try {
    console.log('Submitting tax planning application:', applicationData);
    
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
    
    const response = await fetch(PERSONAL_TAX_ENDPOINTS.SUBMIT_APPLICATION, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to submit application';
      try {
        const error = await response.json();
        console.error('Server error response:', error);
        
        // Handle different error response formats
        if (error.detail) {
          errorMessage = error.detail;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (Array.isArray(error)) {
          // Handle validation error arrays
          errorMessage = error.map(e => `${e.field || e.loc}: ${e.msg || e.message}`).join(', ');
        }
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Submit tax planning application error:', error);
    throw error;
  }
};

// ===================== ADMIN API FUNCTIONS =====================

/**
 * Get auth token from localStorage
 * @returns {string|null} Auth token
 */
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
const authenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Get all tax consultation bookings (ADMIN)
 * @param {object} params - Query parameters
 * @param {number} params.skip - Number of records to skip (pagination)
 * @param {number} params.limit - Maximum records to return
 * @param {string} params.status - Filter by status
 * @returns {Promise<array>} List of consultation bookings
 */
export const getAllConsultations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${PERSONAL_TAX_ENDPOINTS.GET_ALL_CONSULTATIONS}?${queryParams}`
      : PERSONAL_TAX_ENDPOINTS.GET_ALL_CONSULTATIONS;
    
    return await authenticatedRequest(url, { method: 'GET' });
  } catch (error) {
    throw error;
  }
};

/**
 * Get consultation booking by ID (ADMIN)
 * @param {string} consultationId - Consultation ID
 * @returns {Promise<object>} Consultation details
 */
export const getConsultationById = async (consultationId) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.GET_CONSULTATION_BY_ID(consultationId),
      { method: 'GET' }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Update consultation status (ADMIN)
 * @param {string} consultationId - Consultation ID
 * @param {object} statusData - Status update data
 * @param {string} statusData.status - New status (pending, scheduled, completed, cancelled)
 * @param {string} statusData.scheduledDate - Optional scheduled date
 * @param {string} statusData.adminNotes - Optional admin notes
 * @returns {Promise<object>} Update confirmation
 */
export const updateConsultationStatus = async (consultationId, statusData) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.UPDATE_CONSULTATION_STATUS(consultationId),
      {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Delete consultation booking (ADMIN)
 * @param {string} consultationId - Consultation ID
 * @returns {Promise<object>} Delete confirmation
 */
export const deleteConsultation = async (consultationId) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.DELETE_CONSULTATION(consultationId),
      { method: 'DELETE' }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get all tax calculations (ADMIN)
 * @param {object} params - Query parameters
 * @param {number} params.skip - Number of records to skip
 * @param {number} params.limit - Maximum records to return
 * @returns {Promise<array>} List of tax calculations
 */
export const getAllCalculations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${PERSONAL_TAX_ENDPOINTS.GET_ALL_CALCULATIONS}?${queryParams}`
      : PERSONAL_TAX_ENDPOINTS.GET_ALL_CALCULATIONS;
    
    return await authenticatedRequest(url, { method: 'GET' });
  } catch (error) {
    throw error;
  }
};

/**
 * Get calculation by ID (ADMIN)
 * @param {string} calculationId - Calculation ID
 * @returns {Promise<object>} Calculation details
 */
export const getCalculationById = async (calculationId) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.GET_CALCULATION_BY_ID(calculationId),
      { method: 'GET' }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get all tax planning applications (ADMIN)
 * @param {object} params - Query parameters
 * @param {number} params.skip - Number of records to skip
 * @param {number} params.limit - Maximum records to return
 * @param {string} params.status - Filter by status
 * @param {string} params.assigned_to - Filter by assigned consultant
 * @returns {Promise<array>} List of applications
 */
export const getAllApplications = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${PERSONAL_TAX_ENDPOINTS.GET_ALL_APPLICATIONS}?${queryParams}`
      : PERSONAL_TAX_ENDPOINTS.GET_ALL_APPLICATIONS;
    
    return await authenticatedRequest(url, { method: 'GET' });
  } catch (error) {
    throw error;
  }
};

/**
 * Get application by ID (ADMIN)
 * @param {string} applicationId - Application ID
 * @returns {Promise<object>} Application details
 */
export const getApplicationById = async (applicationId) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.GET_APPLICATION_BY_ID(applicationId),
      { method: 'GET' }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Update application status (ADMIN)
 * @param {string} applicationId - Application ID
 * @param {object} statusData - Status update data
 * @param {string} statusData.status - New status
 * @param {string} statusData.adminNotes - Optional admin notes
 * @returns {Promise<object>} Update confirmation
 */
export const updateApplicationStatus = async (applicationId, statusData) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.UPDATE_APPLICATION_STATUS(applicationId),
      {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Assign consultant to application (ADMIN)
 * @param {string} applicationId - Application ID
 * @param {object} assignmentData - Assignment data
 * @param {string} assignmentData.assignedTo - Consultant name
 * @param {string} assignmentData.adminNotes - Optional admin notes
 * @returns {Promise<object>} Assignment confirmation
 */
export const assignConsultant = async (applicationId, assignmentData) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.ASSIGN_CONSULTANT(applicationId),
      {
        method: 'PATCH',
        body: JSON.stringify(assignmentData),
      }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Delete application (ADMIN)
 * @param {string} applicationId - Application ID
 * @returns {Promise<object>} Delete confirmation
 */
export const deleteApplication = async (applicationId) => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.DELETE_APPLICATION(applicationId),
      { method: 'DELETE' }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Get personal tax planning statistics (ADMIN)
 * @returns {Promise<object>} Statistics for consultations, calculations, and applications
 */
export const getPersonalTaxStatistics = async () => {
  try {
    return await authenticatedRequest(
      PERSONAL_TAX_ENDPOINTS.GET_STATISTICS,
      { method: 'GET' }
    );
  } catch (error) {
    throw error;
  }
};

export default {
  // Public functions
  bookTaxConsultation,
  calculateTaxSavings,
  submitTaxPlanningApplication,
  
  // Admin functions
  getAllConsultations,
  getConsultationById,
  updateConsultationStatus,
  deleteConsultation,
  
  getAllCalculations,
  getCalculationById,
  
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  assignConsultant,
  deleteApplication,
  
  getPersonalTaxStatistics,
};
