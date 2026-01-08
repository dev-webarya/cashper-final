import axios from 'axios';
import { getAuthToken } from './api';

const API_BASE_URL = 'http://localhost:8000/api/sip';

// ===================== Contact/Inquiry APIs =====================

/**
 * Submit contact inquiry for SIP investment
 */
export const submitContactInquiry = async (inquiryData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/contact/submit`, {
      fullName: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone,
      investmentAmount: parseFloat(inquiryData.investmentAmount),
      duration: inquiryData.duration,
      message: inquiryData.message || ''
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting contact inquiry:', error);
    throw error.response?.data || error.message;
  }
};

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
 * Get inquiry by ID
 */
export const getInquiryById = async (inquiryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/contact/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update inquiry status (Admin)
 */
export const updateInquiryStatus = async (inquiryId, status, notes = null) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/contact/${inquiryId}/status`, null, {
      params: { status, notes }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error.response?.data || error.message;
  }
};

// ===================== Calculator APIs =====================

/**
 * Calculate SIP returns
 */
export const calculateSIPReturns = async (calculatorData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/calculator/calculate`, {
      monthlyInvestment: parseFloat(calculatorData.monthlyInvestment),
      expectedReturn: parseFloat(calculatorData.expectedReturn),
      timePeriod: parseInt(calculatorData.timePeriod)
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating SIP returns:', error);
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

// ===================== Application APIs =====================

/**
 * Upload document for SIP application
 */
export const uploadSIPDocument = async (file, documentType) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login to upload documents');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Submit SIP application
 */
export const submitSIPApplication = async (applicationData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login to submit application');
    }

    // Upload documents first and get their paths
    let panDoc = null;
    let aadhaarDoc = null;
    let photoDoc = null;
    let bankProofDoc = null;

    // Upload PAN document
    if (applicationData.documents?.pan instanceof File) {
      const panUpload = await uploadSIPDocument(applicationData.documents.pan, 'PAN Card');
      panDoc = panUpload.filePath;
    }

    // Upload Aadhaar document
    if (applicationData.documents?.aadhaar instanceof File) {
      const aadhaarUpload = await uploadSIPDocument(applicationData.documents.aadhaar, 'Aadhaar Card');
      aadhaarDoc = aadhaarUpload.filePath;
    }

    // Upload Photo
    if (applicationData.documents?.photo instanceof File) {
      const photoUpload = await uploadSIPDocument(applicationData.documents.photo, 'Photograph');
      photoDoc = photoUpload.filePath;
    }

    // Upload Bank Proof
    if (applicationData.documents?.bankProof instanceof File) {
      const bankProofUpload = await uploadSIPDocument(applicationData.documents.bankProof, 'Bank Proof');
      bankProofDoc = bankProofUpload.filePath;
    }

    const response = await axios.post(`${API_BASE_URL}/application/submit`, {
      // Personal Information
      name: applicationData.name,
      email: applicationData.email,
      phone: applicationData.phone,
      age: parseInt(applicationData.age),
      panNumber: applicationData.panNumber.toUpperCase(),
      
      // SIP Details
      sipAmount: parseFloat(applicationData.sipAmount),
      sipFrequency: applicationData.sipFrequency,
      tenure: parseInt(applicationData.tenure),
      investmentGoal: applicationData.investmentGoal,
      riskProfile: applicationData.riskProfile,
      
      // Address & KYC
      address: applicationData.address,
      city: applicationData.city,
      state: applicationData.state,
      pincode: applicationData.pincode,
      
      // Document paths (uploaded file paths)
      panDocument: panDoc,
      aadhaarDocument: aadhaarDoc,
      photoDocument: photoDoc,
      bankProofDocument: bankProofDoc
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
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
 * Get application by ID
 */
export const getApplicationById = async (applicationId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/application/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get application by application number
 */
export const getApplicationByNumber = async (appNumber) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/application/number/${appNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Update application status (Admin)
 */
export const updateApplicationStatus = async (applicationId, newStatus, reviewedBy = null, remarks = null) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/application/${applicationId}/status`, null, {
      params: { new_status: newStatus, reviewed_by: reviewedBy, remarks }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error);
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
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  calculateSIPReturns,
  getAllCalculations,
  uploadSIPDocument,
  submitSIPApplication,
  getAllApplications,
  getApplicationById,
  getApplicationByNumber,
  updateApplicationStatus,
  getStatistics
};
