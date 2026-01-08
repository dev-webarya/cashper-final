/**
 * Loan Management API Service
 * Handles all loan management related API calls
 */

import { apiRequest, getAuthToken } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LOAN_MANAGEMENT_ENDPOINTS = {
  GET_LOAN_SUMMARY: `${API_BASE_URL}/api/loan-management/summary`,
  GET_ACTIVE_LOANS: `${API_BASE_URL}/api/loan-management/loans`,
  GET_LOAN_DETAILS: (loanId) => `${API_BASE_URL}/api/loan-management/loans/${loanId}`,
  GET_LOAN_APPLICATIONS: `${API_BASE_URL}/api/loan-management/applications`,
  PAY_EMI: `${API_BASE_URL}/api/loan-management/pay-emi`,
  GET_PAYMENT_HISTORY: (loanId) => `${API_BASE_URL}/api/loan-management/payment-history/${loanId}`,
  GET_LOAN_STATEMENT: (loanId) => `${API_BASE_URL}/api/loan-management/statement/${loanId}`,
  CREATE_LOAN: `${API_BASE_URL}/api/loan-management/create-loan`,
  DELETE_LOAN: (loanId) => `${API_BASE_URL}/api/loan-management/loans/${loanId}`,
};

/**
 * Get loan summary statistics for the current user
 * @returns {Promise<object>} Loan summary with totals and counts
 */
export const getLoanSummary = async () => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.GET_LOAN_SUMMARY, {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Get loan summary error:', error);
    throw error;
  }
};

/**
 * Get all active loans for the current user
 * @returns {Promise<array>} List of active loans
 */
export const getActiveLoans = async () => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.GET_ACTIVE_LOANS, {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Get active loans error:', error);
    throw error;
  }
};

/**
 * Get detailed information about a specific loan
 * @param {string} loanId - Loan ID
 * @returns {Promise<object>} Loan details
 */
export const getLoanDetails = async (loanId) => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.GET_LOAN_DETAILS(loanId), {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Get loan details error:', error);
    throw error;
  }
};

/**
 * Get recent loan applications for the current user
 * @returns {Promise<array>} List of loan applications
 */
export const getLoanApplications = async () => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.GET_LOAN_APPLICATIONS, {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Get loan applications error:', error);
    throw error;
  }
};

/**
 * Process EMI payment for a loan
 * @param {object} paymentData - Payment data {loanId, paymentMethod, amount}
 * @returns {Promise<object>} Payment response
 */
export const payEMI = async (paymentData) => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.PAY_EMI, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data;
  } catch (error) {
    console.error('Pay EMI error:', error);
    throw error;
  }
};

/**
 * Get payment history for a specific loan
 * @param {string} loanId - Loan ID
 * @returns {Promise<array>} List of payments
 */
export const getPaymentHistory = async (loanId) => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.GET_PAYMENT_HISTORY(loanId), {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Get payment history error:', error);
    throw error;
  }
};

/**
 * Get loan statement with payment history
 * @param {string} loanId - Loan ID
 * @returns {Promise<object>} Loan statement
 */
export const getLoanStatement = async (loanId) => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.GET_LOAN_STATEMENT(loanId), {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Get loan statement error:', error);
    throw error;
  }
};

/**
 * Create a new loan (for testing/seeding purposes)
 * @param {object} loanData - Loan data {loanType, loanAmount, interestRate, tenureMonths}
 * @returns {Promise<object>} Created loan details
 */
export const createLoan = async (loanData) => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.CREATE_LOAN, {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
    return data;
  } catch (error) {
    console.error('Create loan error:', error);
    throw error;
  }
};

/**
 * Delete a loan (for testing purposes)
 * @param {string} loanId - Loan ID
 * @returns {Promise<object>} Delete response
 */
export const deleteLoan = async (loanId) => {
  try {
    const data = await apiRequest(LOAN_MANAGEMENT_ENDPOINTS.DELETE_LOAN(loanId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    console.error('Delete loan error:', error);
    throw error;
  }
};

export default {
  getLoanSummary,
  getActiveLoans,
  getLoanDetails,
  getLoanApplications,
  payEMI,
  getPaymentHistory,
  getLoanStatement,
  createLoan,
  deleteLoan,
};
