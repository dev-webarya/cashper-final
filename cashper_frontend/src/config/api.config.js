/**
 * Centralized API Configuration
 * ==============================
 * 
 * CONFIGURATION:
 * - Docker (same-origin): VITE_API_URL="" (empty) - uses relative URLs
 * - Local development: VITE_API_URL="http://localhost:8000" or leave unset
 * - Separate API domain: VITE_API_URL="https://api.your-domain.com"
 * 
 * USAGE:
 *   import { API_BASE_URL, getAssetUrl } from '../config/api.config';
 *   
 *   // For API calls:
 *   fetch(`${API_BASE_URL}/api/endpoint`)
 *   
 *   // For static assets (images, uploads):
 *   src={getAssetUrl(data.profileImage)}
 */

// Check if we're in a Docker/production environment (VITE_API_URL is explicitly set)
const envApiUrl = import.meta.env.VITE_API_URL;

// Base URL for API server (without /api suffix)
// - If VITE_API_URL is empty string "", use "" for same-origin (Docker)
// - If VITE_API_URL is undefined, default to localhost for local dev
// - If VITE_API_URL has a value, use that value
export const API_BASE_URL = envApiUrl !== undefined ? envApiUrl : 'http://localhost:8000';

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
