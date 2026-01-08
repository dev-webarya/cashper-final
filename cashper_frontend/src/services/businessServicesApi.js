// Business Services API Integration
import { getAuthToken } from './api';

const API_BASE_URL = 'http://127.0.0.1:8000/api/business-services';

// Helper function to make API requests with authentication
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
  };

  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Add auth token if available
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
      // Check if this is a Pydantic validation error
      if (data.detail && Array.isArray(data.detail)) {
        // Parse Pydantic validation errors into field-level errors
        const fieldErrors = {};
        data.detail.forEach(error => {
          if (error.loc && error.loc.length > 1) {
            const fieldName = error.loc[1]; // loc is ['body', 'fieldName', ...]
            fieldErrors[fieldName] = error.msg;
          }
        });
        return { success: false, error: 'Validation failed', fieldErrors };
      }
      
      throw new Error(data.detail || 'Something went wrong');
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error.message, fieldErrors: {} };
  }
};

// ==================== COMPANY REGISTRATION ====================

/**
 * Submit Company Registration Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitCompanyRegistration = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields - convert camelCase to snake_case
  formDataObj.append('full_name', formData.fullName || '');
  formDataObj.append('email', formData.email || '');
  formDataObj.append('phone', formData.phone || '');
  formDataObj.append('pan_number', formData.panNumber || '');
  formDataObj.append('proposed_company_name', formData.proposedCompanyName || '');
  formDataObj.append('company_type', formData.companyType || '');
  formDataObj.append('number_of_directors', formData.numberOfDirectors || 0);
  formDataObj.append('registration_state', formData.registrationState || '');
  formDataObj.append('address', formData.address || '');
  formDataObj.append('city', formData.city || '');
  formDataObj.append('state', formData.state || '');
  formDataObj.append('pincode', formData.pincode || '');

  // Add files
  if (formData.directorPan) formDataObj.append('director_pan', formData.directorPan);
  if (formData.directorAadhaar) formDataObj.append('director_aadhaar', formData.directorAadhaar);
  if (formData.directorPhoto) formDataObj.append('director_photo', formData.directorPhoto);
  if (formData.addressProof) formDataObj.append('address_proof', formData.addressProof);
  if (formData.moaDraft) formDataObj.append('moa_draft', formData.moaDraft);
  if (formData.aoaDraft) formDataObj.append('aoa_draft', formData.aoaDraft);

  return await makeRequest(`${API_BASE_URL}/company-registration`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all Company Registration Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getCompanyRegistrations = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/company-registration${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== COMPANY COMPLIANCE ====================

/**
 * Submit Company Compliance Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitCompanyCompliance = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields - convert camelCase to snake_case
  formDataObj.append('full_name', formData.fullName || '');
  formDataObj.append('email', formData.email || '');
  formDataObj.append('phone', formData.phone || '');
  formDataObj.append('pan_number', formData.panNumber || '');
  formDataObj.append('company_name', formData.companyName || '');
  formDataObj.append('cin', formData.cin || '');
  formDataObj.append('compliance_type', formData.complianceType || '');
  formDataObj.append('registration_date', formData.registrationDate || '');
  formDataObj.append('address', formData.address || '');
  formDataObj.append('city', formData.city || '');
  formDataObj.append('state', formData.state || '');
  formDataObj.append('pincode', formData.pincode || '');

  // Add all 5 document files
  if (formData.cinCertificate) formDataObj.append('cin_certificate', formData.cinCertificate);
  if (formData.moa) formDataObj.append('moa', formData.moa);
  if (formData.aoa) formDataObj.append('aoa', formData.aoa);
  if (formData.directorPan) formDataObj.append('director_pan', formData.directorPan);
  if (formData.addressProof) formDataObj.append('address_proof', formData.addressProof);

  return await makeRequest(`${API_BASE_URL}/company-compliance`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all Company Compliance Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getCompanyCompliance = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/company-compliance${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== TAX AUDIT ====================

/**
 * Submit Tax Audit Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitTaxAudit = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields - convert camelCase to snake_case
  formDataObj.append('full_name', formData.fullName || '');
  formDataObj.append('email', formData.email || '');
  formDataObj.append('phone', formData.phone || '');
  formDataObj.append('pan_number', formData.panNumber || '');
  formDataObj.append('business_name', formData.businessName || '');
  formDataObj.append('turnover', formData.turnover || 0);
  formDataObj.append('audit_type', formData.auditType || '');
  formDataObj.append('financial_year', formData.financialYear || '');
  formDataObj.append('address', formData.address || '');
  formDataObj.append('city', formData.city || '');
  formDataObj.append('state', formData.state || '');
  formDataObj.append('pincode', formData.pincode || '');

  // Add files
  if (formData.panCard) formDataObj.append('pan_card', formData.panCard);
  if (formData.gstReturns) formDataObj.append('gst_returns', formData.gstReturns);
  if (formData.balanceSheet) formDataObj.append('balance_sheet', formData.balanceSheet);
  if (formData.profitLoss) formDataObj.append('profit_loss', formData.profitLoss);
  if (formData.bankStatements) formDataObj.append('bank_statements', formData.bankStatements);

  return await makeRequest(`${API_BASE_URL}/tax-audit`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all Tax Audit Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getTaxAudit = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/tax-audit${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== LEGAL ADVICE ====================

/**
 * Submit Legal Advice Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitLegalAdvice = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields
  Object.keys(formData).forEach(key => {
    if (!key.includes('File') && !key.includes('Document') && !key.includes('Attachment')) {
      formDataObj.append(key, formData[key]);
    }
  });

  // Add files
  Object.keys(formData).forEach(key => {
    if ((key.includes('File') || key.includes('Document') || key.includes('Attachment')) && formData[key]) {
      formDataObj.append(key, formData[key]);
    }
  });

  return await makeRequest(`${API_BASE_URL}/legal-advice`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all Legal Advice Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getLegalAdvice = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/legal-advice${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== PROVIDENT FUND SERVICES ====================

/**
 * Submit Provident Fund Services Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitProvidentFundServices = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields
  Object.keys(formData).forEach(key => {
    if (!key.includes('File') && !key.includes('Document') && !key.includes('Proof') && !key.includes('Statement')) {
      formDataObj.append(key, formData[key]);
    }
  });

  // Add files
  Object.keys(formData).forEach(key => {
    if ((key.includes('File') || key.includes('Document') || key.includes('Proof') || key.includes('Statement')) && formData[key]) {
      formDataObj.append(key, formData[key]);
    }
  });

  return await makeRequest(`${API_BASE_URL}/provident-fund-services`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all Provident Fund Services Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getProvidentFundServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/provident-fund-services${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== TDS SERVICES ====================

/**
 * Submit TDS Services Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitTDSServices = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields
  Object.keys(formData).forEach(key => {
    if (!key.includes('File') && !key.includes('Certificate') && !key.includes('Statement') && !key.includes('Document')) {
      formDataObj.append(key, formData[key]);
    }
  });

  // Add files
  Object.keys(formData).forEach(key => {
    if ((key.includes('File') || key.includes('Certificate') || key.includes('Statement') || key.includes('Document')) && formData[key]) {
      formDataObj.append(key, formData[key]);
    }
  });

  return await makeRequest(`${API_BASE_URL}/tds-services`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all TDS Services Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getTDSServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/tds-services${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== GST SERVICES ====================

/**
 * Submit GST Services Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitGSTServices = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields
  Object.keys(formData).forEach(key => {
    if (!key.includes('Certificate') && !key.includes('Invoices') && !key.includes('Statements') && !key.includes('Card')) {
      formDataObj.append(key, formData[key]);
    }
  });

  // Add files
  if (formData.gstCertificate) formDataObj.append('gstCertificate', formData.gstCertificate);
  if (formData.salesInvoices) formDataObj.append('salesInvoices', formData.salesInvoices);
  if (formData.purchaseInvoices) formDataObj.append('purchaseInvoices', formData.purchaseInvoices);
  if (formData.bankStatements) formDataObj.append('bankStatements', formData.bankStatements);
  if (formData.panCard) formDataObj.append('panCard', formData.panCard);

  return await makeRequest(`${API_BASE_URL}/gst-services`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all GST Services Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getGSTServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/gst-services${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== PAYROLL SERVICES ====================

/**
 * Submit Payroll Services Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitPayrollServices = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields
  Object.keys(formData).forEach(key => {
    if (!key.includes('File') && !key.includes('Document') && !key.includes('Template') && !key.includes('Record')) {
      formDataObj.append(key, formData[key]);
    }
  });

  // Add files
  Object.keys(formData).forEach(key => {
    if ((key.includes('File') || key.includes('Document') || key.includes('Template') || key.includes('Record')) && formData[key]) {
      formDataObj.append(key, formData[key]);
    }
  });

  return await makeRequest(`${API_BASE_URL}/payroll-services`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all Payroll Services Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getPayrollServices = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/payroll-services${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ==================== ACCOUNTING & BOOKKEEPING ====================

/**
 * Submit Accounting & Bookkeeping Application
 * @param {object} formData - Application data including documents
 * @returns {Promise<object>} Response with success/error
 */
export const submitAccountingBookkeeping = async (formData) => {
  const formDataObj = new FormData();
  
  // Add form fields
  Object.keys(formData).forEach(key => {
    if (!key.includes('Statement') && !key.includes('Invoice') && !key.includes('Record') && !key.includes('Document')) {
      formDataObj.append(key, formData[key]);
    }
  });

  // Add files
  Object.keys(formData).forEach(key => {
    if ((key.includes('Statement') || key.includes('Invoice') || key.includes('Record') || key.includes('Document')) && formData[key]) {
      formDataObj.append(key, formData[key]);
    }
  });

  return await makeRequest(`${API_BASE_URL}/accounting-bookkeeping`, {
    method: 'POST',
    body: formDataObj,
  });
};

/**
 * Get all Accounting & Bookkeeping Applications
 * @param {object} params - Query parameters (status, etc.)
 * @returns {Promise<object>} Response with list of applications
 */
export const getAccountingBookkeeping = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await makeRequest(`${API_BASE_URL}/accounting-bookkeeping${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};
