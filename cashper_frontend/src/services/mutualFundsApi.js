import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/mutual-funds';

// ===================== Contact/Inquiry APIs =====================

/**
 * Submit contact inquiry for mutual fund investment
 */
export const submitContactInquiry = async (inquiryData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/contact/submit`, {
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone,
      investmentAmount: parseFloat(inquiryData.investmentAmount),
      investmentGoal: inquiryData.investmentGoal
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting contact inquiry:', error);
    throw error.response?.data || error.message;
  }
};

// ===================== Calculator APIs =====================

/**
 * Calculate investment returns (Lumpsum or SIP)
 */
export const calculateInvestmentReturns = async (calculatorData) => {
  try {
    // Validate required fields
    if (!calculatorData.investmentType) {
      throw new Error('Investment type is required');
    }
    if (!calculatorData.returnRate) {
      throw new Error('Return rate is required (1-30%)');
    }
    if (!calculatorData.timePeriod) {
      throw new Error('Time period is required (1-50 years)');
    }

    const returnRate = parseFloat(calculatorData.returnRate);
    const timePeriod = parseInt(calculatorData.timePeriod);

    // Validate ranges
    if (returnRate < 1 || returnRate > 30) {
      throw new Error('Return rate must be between 1% and 30%');
    }
    if (timePeriod < 1 || timePeriod > 50) {
      throw new Error('Time period must be between 1 and 50 years');
    }

    const payload = {
      investmentType: calculatorData.investmentType.toLowerCase(),
      returnRate: returnRate,
      timePeriod: timePeriod,
      amount: null,
      sipAmount: null
    };

    // Add amount or sipAmount based on investment type
    if (calculatorData.investmentType.toLowerCase() === 'lumpsum') {
      const amount = parseFloat(calculatorData.amount);
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid investment amount (must be greater than 0)');
      }
      payload.amount = amount;
    } else if (calculatorData.investmentType.toLowerCase() === 'sip') {
      const sipAmount = parseFloat(calculatorData.sipAmount);
      if (!sipAmount || sipAmount <= 0) {
        throw new Error('Please enter a valid monthly SIP amount (must be greater than 0)');
      }
      payload.sipAmount = sipAmount;
    } else {
      throw new Error('Invalid investment type. Must be "lumpsum" or "sip"');
    }

    console.log('Sending calculator payload:', payload);
    
    const response = await axios.post(`${API_BASE_URL}/calculator/calculate`, payload);
    return response.data;
  } catch (error) {
    console.error('Error calculating investment returns:', error.response?.data || error.message);
    throw error.response?.data || { detail: error.message };
  }
};

// ===================== Application APIs =====================

/**
 * Submit mutual fund application WITH file uploads
 */
export const submitMutualFundApplication = async (applicationData) => {
  try {
    // Create FormData to handle file uploads
    const formData = new FormData();
    
    // Add personal information
    formData.append('name', applicationData.name);
    formData.append('email', applicationData.email);
    formData.append('phone', applicationData.phone);
    formData.append('age', parseInt(applicationData.age));
    formData.append('panNumber', applicationData.panNumber.toUpperCase());
    
    // Add investment details
    formData.append('investmentType', applicationData.investmentType);
    formData.append('investmentAmount', parseFloat(applicationData.investmentAmount));
    formData.append('investmentGoal', applicationData.investmentGoal);
    formData.append('riskProfile', applicationData.riskProfile);
    
    // Only append optional SIP fields if they have valid values
    if (applicationData.sipAmount && applicationData.sipAmount.toString().trim() !== '') {
      formData.append('sipAmount', parseFloat(applicationData.sipAmount));
    }
    if (applicationData.sipFrequency && applicationData.sipFrequency.toString().trim() !== '') {
      formData.append('sipFrequency', applicationData.sipFrequency);
    }
    
    // Add address & KYC
    formData.append('address', applicationData.address);
    formData.append('city', applicationData.city);
    formData.append('state', applicationData.state);
    formData.append('pincode', applicationData.pincode);
    
    // Add document files (if they exist as File objects)
    if (applicationData.documents?.pan instanceof File) {
      formData.append('pan_document', applicationData.documents.pan);
    }
    if (applicationData.documents?.aadhaar instanceof File) {
      formData.append('aadhaar_document', applicationData.documents.aadhaar);
    }
    if (applicationData.documents?.photo instanceof File) {
      formData.append('photo_document', applicationData.documents.photo);
    }
    if (applicationData.documents?.bankProof instanceof File) {
      formData.append('bank_proof_document', applicationData.documents.bankProof);
    }

    const token = localStorage.getItem('access_token');
    
    const response = await axios.post(`${API_BASE_URL}/application/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error.response?.data || error.message;
  }
};

// ===================== Admin APIs =====================

/**
 * Get all contact inquiries (Admin)
 */
export const getAllInquiries = async (skip = 0, limit = 100) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/contact/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all calculations (Admin)
 */
export const getAllCalculations = async (skip = 0, limit = 100) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/calculator/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching calculations:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get all applications (Admin)
 */
export const getAllApplications = async (skip = 0, limit = 100) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/application/all`, {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get statistics (Admin)
 */
export const getStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error.response?.data || error.message;
  }
};

export default {
  submitContactInquiry,
  calculateInvestmentReturns,
  submitMutualFundApplication,
  getAllInquiries,
  getAllCalculations,
  getAllApplications,
  getStatistics
};
