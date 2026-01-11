/**
 * Centralized API Configuration
 * 
 * This is the SINGLE SOURCE OF TRUTH for all API URLs.
 * To change the backend URL, modify VITE_API_URL in your environment
 * OR change the fallback value below.
 */

// Base URL for API requests (set via environment variable or fallback)
export const API_ROOT = import.meta.env.VITE_API_URL || '';

// Specific API endpoints
export const API_BASE_URL = `${API_ROOT}/api`;

// Service-specific endpoints
export const API_ENDPOINTS = {
    admin: `${API_ROOT}/api/admin`,
    auth: `${API_ROOT}/api/auth`,
    dashboard: `${API_ROOT}/api/dashboard`,
    loans: {
        personal: `${API_ROOT}/api/personal-loan`,
        home: `${API_ROOT}/api/home-loan`,
        business: `${API_ROOT}/api/business-loan`,
        shortTerm: `${API_ROOT}/api/short-term-loan`,
    },
    insurance: {
        health: `${API_ROOT}/api/health-insurance`,
        motor: `${API_ROOT}/api/motor-insurance`,
        term: `${API_ROOT}/api/term-insurance`,
    },
    investments: {
        sip: `${API_ROOT}/api/sip`,
        mutualFunds: `${API_ROOT}/api/mutual-funds`,
        management: `${API_ROOT}/api/investment-management`,
    },
    tax: {
        personal: `${API_ROOT}/api/personal-tax`,
        business: `${API_ROOT}/api/business-tax`,
    },
    services: {
        retail: `${API_ROOT}/api/retail-services`,
        business: `${API_ROOT}/api/business-services`,
        corporate: `${API_ROOT}/api/corporate-services`,
    },
    settings: `${API_ROOT}/api/settings`,
    notifications: `${API_ROOT}/api/notifications`,
    loanManagement: `${API_ROOT}/api/loan-management`,
};

// WebSocket URL (for real-time features)
export const getWebSocketUrl = () => {
    const baseUrl = API_ROOT || 'http://localhost:8000';
    return baseUrl.replace(/^http/, 'ws');
};

export const WS_ENDPOINTS = {
    adminDashboard: `${getWebSocketUrl()}/api/admin/ws/dashboard`,
};

export default {
    API_ROOT,
    API_BASE_URL,
    API_ENDPOINTS,
    getWebSocketUrl,
    WS_ENDPOINTS,
};
