/**
 * Centralized API Configuration
 * ==============================
 * Change VITE_API_URL in .env to switch between local/hosted API
 * 
 * Usage:
 *   import { API_BASE_URL, getAssetUrl } from '../config/api.config';
 *   
 *   // For API calls:
 *   fetch(`${API_BASE_URL}/api/endpoint`)
 *   
 *   // For static assets (images, uploads):
 *   src={getAssetUrl(data.profileImage)}
 */

// Base URL for API server (without /api suffix)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Full API endpoint (with /api suffix)
export const API_ENDPOINT = `${API_BASE_URL}/api`;

/**
 * Helper to construct full URLs for static assets (uploads, images, documents)
 * Handles paths that may or may not start with '/' and already absolute URLs
 * 
 * @param {string} path - The asset path (e.g., '/uploads/image.jpg' or 'uploads/image.jpg')
 * @returns {string} Full URL to the asset
 */
export const getAssetUrl = (path) => {
  if (!path) return '';
  // Already a full URL
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export default { API_BASE_URL, API_ENDPOINT, getAssetUrl };
