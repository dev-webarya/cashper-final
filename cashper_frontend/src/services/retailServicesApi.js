// Retail Services API
// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Helper function to handle file upload
const createFormDataWithFiles = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

// ITR Filing Service
export const submitITRFilingApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/itr-filing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit ITR filing application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting ITR filing application:', error);
    throw error;
  }
};

// ITR Revision Service
export const submitITRRevisionApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/itr-revision`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit ITR revision application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting ITR revision application:', error);
    throw error;
  }
};

// ITR Notice Reply Service
export const submitITRNoticeReplyApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/itr-notice-reply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit ITR notice reply application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting ITR notice reply application:', error);
    throw error;
  }
};

// Individual PAN Service
export const submitIndividualPANApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/individual-pan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit Individual PAN application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting Individual PAN application:', error);
    throw error;
  }
};

// HUF PAN Service
export const submitHUFPANApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/huf-pan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit HUF PAN application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting HUF PAN application:', error);
    throw error;
  }
};

// PF Withdrawal Service
export const submitPFWithdrawalApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/pf-withdrawal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit PF withdrawal application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting PF withdrawal application:', error);
    throw error;
  }
};

// Document Update Service
export const submitDocumentUpdateApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/document-update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit document update application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting document update application:', error);
    throw error;
  }
};

// Trading/Demat Account Service
export const submitTradingDematApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/trading-demat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit trading/demat application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting trading/demat application:', error);
    throw error;
  }
};

// Bank Account Service
export const submitBankAccountApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/bank-account`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit bank account application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting bank account application:', error);
    throw error;
  }
};

// Financial Planning Service
export const submitFinancialPlanningApplication = async (applicationData) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = createFormDataWithFiles(applicationData);
    
    const response = await fetch(`${API_BASE_URL}/api/retail-services/financial-planning`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to submit financial planning application');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting financial planning application:', error);
    throw error;
  }
};

// Get User's Retail Service Applications
export const getUserRetailApplications = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/retail-services/applications`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch retail service applications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching retail applications:', error);
    throw error;
  }
};

// Get Application by ID
export const getRetailApplicationById = async (applicationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/retail-services/applications/${applicationId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch application details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error;
  }
};

export default {
  submitITRFilingApplication,
  submitITRRevisionApplication,
  submitITRNoticeReplyApplication,
  submitIndividualPANApplication,
  submitHUFPANApplication,
  submitPFWithdrawalApplication,
  submitDocumentUpdateApplication,
  submitTradingDematApplication,
  submitBankAccountApplication,
  submitFinancialPlanningApplication,
  getUserRetailApplications,
  getRetailApplicationById
};
