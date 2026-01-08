import { apiRequest, getAuthToken } from './api';

const API_BASE_URL = 'http://localhost:8000/api/investment-management';

/**
 * Get portfolio summary including total invested, current value, and returns
 */
export const getPortfolioSummary = async () => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/portfolio/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    throw error;
  }
};

/**
 * Get all active investments for the user
 */
export const getActiveInvestments = async () => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/investments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
};

/**
 * Get details of a specific investment
 * @param {string} investmentId - ID of the investment
 */
export const getInvestmentDetails = async (investmentId) => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/investments/${investmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching investment details:', error);
    throw error;
  }
};

/**
 * Add more investment to an existing fund
 * @param {string} investmentId - ID of the investment
 * @param {number} amount - Amount to invest (min: 500, max: 10000000)
 */
export const investMore = async (investmentId, amount) => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/invest-more`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investmentId,
        amount
      })
    });
    return response;
  } catch (error) {
    console.error('Error processing investment:', error);
    throw error;
  }
};

/**
 * Process redemption request for an investment
 * @param {string} investmentId - ID of the investment
 * @param {number} amount - Amount to redeem
 */
export const redeemInvestment = async (investmentId, amount) => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/redeem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        investmentId,
        amount
      })
    });
    return response;
  } catch (error) {
    console.error('Error processing redemption:', error);
    throw error;
  }
};

/**
 * Get recent investment transactions
 */
export const getRecentTransactions = async () => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Export all transactions for download
 */
export const exportTransactions = async () => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/transactions/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw error;
  }
};
