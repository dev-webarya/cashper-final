// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Submit Loan Application
export const submitLoanApplication = async (loanType, formData, documents) => {
  try {
    const formDataToSend = new FormData();
    
    // Append form fields
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    // Append document files
    if (documents) {
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formDataToSend.append(key, documents[key]);
        }
      });
    }
    
    // Map loan type to correct endpoint - All use unified loans endpoint
    const endpointMap = {
      'personal-loan': `${API_BASE_URL}/loans/apply/personal-loan`,
      'home-loan': `${API_BASE_URL}/loans/apply/home-loan`,
      'business-loan': `${API_BASE_URL}/loans/apply/business-loan`
    };
    
    const endpoint = endpointMap[loanType] || `${API_BASE_URL}/loans/apply/${loanType}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formDataToSend,
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error submitting loan application:', error);
    throw error;
  }
};

// Get All Loan Applications (Admin)
export const getAllLoanApplications = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/loans/applications?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    throw error;
  }
};

// Get Single Loan Application
export const getLoanApplication = async (applicationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching loan application:', error);
    throw error;
  }
};

// Get Loan Application by Reference Number
export const getLoanApplicationByRef = async (referenceNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/applications/ref/${referenceNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching loan application:', error);
    throw error;
  }
};

// Update Loan Application Status (Admin)
export const updateLoanStatus = async (applicationId, status, adminNotes = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, adminNotes }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating loan status:', error);
    throw error;
  }
};

// Get Loan Statistics
export const getLoanStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/loans/stats/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching loan statistics:', error);
    throw error;
  }
};

// Get User's Loans (Dashboard)
export const getMyLoans = async (email, phone) => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    
    const response = await fetch(`${API_BASE_URL}/dashboard/my-loans?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching user loans:', error);
    throw error;
  }
};

// Get User Statistics (Dashboard)
export const getUserStatistics = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

// Authentication APIs
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};

// Health Check
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};

export default {
  submitLoanApplication,
  getAllLoanApplications,
  getLoanApplication,
  getLoanApplicationByRef,
  updateLoanStatus,
  getLoanStatistics,
  getMyLoans,
  getUserStatistics,
  registerUser,
  loginUser,
  forgotPassword,
  checkHealth,
};









