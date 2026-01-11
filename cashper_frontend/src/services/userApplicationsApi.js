import { apiRequest, getAuthToken } from './api';

import { API_ENDPOINTS } from '../config/api';
const API_BASE_URL = API_ENDPOINTS.dashboard;

/**
 * Get all applications submitted by the current user across all categories
 * Includes: Loans, Insurance, Investments, Tax Planning
 */
export const getUserApplications = async () => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};
