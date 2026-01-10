// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  GET_CURRENT_USER: `${API_BASE_URL}/api/auth/me`,
  VERIFY_EMAIL: (userId) => `${API_BASE_URL}/api/auth/verify-email/${userId}`,
  VERIFY_PHONE: (userId) => `${API_BASE_URL}/api/auth/verify-phone/${userId}`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,

  // Contact endpoints
  SUBMIT_CONTACT: `${API_BASE_URL}/api/contact/submit`,
  GET_FAQS: `${API_BASE_URL}/api/contact/faqs`,
  GET_ALL_SUBMISSIONS: `${API_BASE_URL}/api/contact/submissions`,
  GET_SUBMISSION_BY_ID: (submissionId) => `${API_BASE_URL}/api/contact/submissions/${submissionId}`,
  UPDATE_SUBMISSION_STATUS: (submissionId) => `${API_BASE_URL}/api/contact/submissions/${submissionId}/status`,
  MARK_SUBMISSION_READ: (submissionId) => `${API_BASE_URL}/api/contact/submissions/${submissionId}/read`,
  DELETE_SUBMISSION: (submissionId) => `${API_BASE_URL}/api/contact/submissions/${submissionId}`,
  GET_CONTACT_STATISTICS: `${API_BASE_URL}/api/contact/statistics`,

  // FAQ Management endpoints
  CREATE_FAQ: `${API_BASE_URL}/api/contact/faqs`,
  GET_ALL_FAQS_ADMIN: `${API_BASE_URL}/api/contact/faqs/all`,
  GET_FAQ_BY_ID: (faqId) => `${API_BASE_URL}/api/contact/faqs/${faqId}`,
  UPDATE_FAQ: (faqId) => `${API_BASE_URL}/api/contact/faqs/${faqId}`,
  DELETE_FAQ: (faqId) => `${API_BASE_URL}/api/contact/faqs/${faqId}`,
  UPDATE_FAQ_ORDER: (faqId) => `${API_BASE_URL}/api/contact/faqs/${faqId}/order`,

  // About endpoints
  GET_TESTIMONIALS: `${API_BASE_URL}/api/about/testimonials`,
  GET_ACHIEVEMENTS: `${API_BASE_URL}/api/about/achievements`,
  GET_STATS: `${API_BASE_URL}/api/about/stats`,
  GET_MILESTONES: `${API_BASE_URL}/api/about/milestones`,


  // About Management endpoints (Admin)
  CREATE_TESTIMONIAL: `${API_BASE_URL}/api/about/testimonials`,
  GET_ALL_TESTIMONIALS_ADMIN: `${API_BASE_URL}/api/about/testimonials/all`,
  GET_TESTIMONIAL_BY_ID: (testimonialId) => `${API_BASE_URL}/api/about/testimonials/${testimonialId}`,
  UPDATE_TESTIMONIAL: (testimonialId) => `${API_BASE_URL}/api/about/testimonials/${testimonialId}`,
  DELETE_TESTIMONIAL: (testimonialId) => `${API_BASE_URL}/api/about/testimonials/${testimonialId}`,
  UPDATE_TESTIMONIAL_ORDER: (testimonialId) => `${API_BASE_URL}/api/about/testimonials/${testimonialId}/order`,

  CREATE_ACHIEVEMENT: `${API_BASE_URL}/api/about/achievements`,
  UPDATE_ACHIEVEMENT: (achievementId) => `${API_BASE_URL}/api/about/achievements/${achievementId}`,
  DELETE_ACHIEVEMENT: (achievementId) => `${API_BASE_URL}/api/about/achievements/${achievementId}`,

  CREATE_STAT: `${API_BASE_URL}/api/about/stats`,
  UPDATE_STAT: (statId) => `${API_BASE_URL}/api/about/stats/${statId}`,
  DELETE_STAT: (statId) => `${API_BASE_URL}/api/about/stats/${statId}`,

  CREATE_MILESTONE: `${API_BASE_URL}/api/about/milestones`,
  UPDATE_MILESTONE: (milestoneId) => `${API_BASE_URL}/api/about/milestones/${milestoneId}`,
  DELETE_MILESTONE: (milestoneId) => `${API_BASE_URL}/api/about/milestones/${milestoneId}`,



  // Home endpoints (Testimonials & Blogs)
  GET_HOME_TESTIMONIALS: `${API_BASE_URL}/api/home/testimonials`,
  GET_BLOGS: `${API_BASE_URL}/api/home/blogs`,
  GET_BLOG_BY_ID: (blogId) => `${API_BASE_URL}/api/home/blogs/${blogId}`,
  GET_FEATURED_BLOGS: `${API_BASE_URL}/api/home/blogs/featured/list`,
  GET_POPULAR_BLOGS: `${API_BASE_URL}/api/home/blogs/popular/list`,

  // Home Management endpoints (Admin)
  CREATE_HOME_TESTIMONIAL: `${API_BASE_URL}/api/home/testimonials`,
  GET_ALL_HOME_TESTIMONIALS_ADMIN: `${API_BASE_URL}/api/home/testimonials/all`,
  UPDATE_HOME_TESTIMONIAL: (testimonialId) => `${API_BASE_URL}/api/home/testimonials/${testimonialId}`,
  DELETE_HOME_TESTIMONIAL: (testimonialId) => `${API_BASE_URL}/api/home/testimonials/${testimonialId}`,

  CREATE_BLOG: `${API_BASE_URL}/api/home/blogs`,
  GET_ALL_BLOGS_ADMIN: `${API_BASE_URL}/api/home/blogs/all/admin`,
  UPDATE_BLOG: (blogId) => `${API_BASE_URL}/api/home/blogs/${blogId}`,
  DELETE_BLOG: (blogId) => `${API_BASE_URL}/api/home/blogs/${blogId}`,

  // Image Upload endpoints (Admin)
  UPLOAD_TESTIMONIAL_IMAGE: `${API_BASE_URL}/api/home/upload/testimonial-image`,
  UPLOAD_BLOG_IMAGE: `${API_BASE_URL}/api/home/upload/blog-image`,
  DELETE_IMAGE: `${API_BASE_URL}/api/home/delete/image`,

  // Health check
  HEALTH: `${API_BASE_URL}/health`,

  // Financial Services endpoints
  GET_FINANCIAL_SERVICES: `${API_BASE_URL}/api/financial-services`,
  GET_FINANCIAL_SERVICE_BY_ID: (serviceId) => `${API_BASE_URL}/api/financial-services/${serviceId}`,
  GET_FINANCIAL_SERVICE_BY_CATEGORY: (category) => `${API_BASE_URL}/api/financial-services/category/${category}`,
  CREATE_FINANCIAL_SERVICE: `${API_BASE_URL}/api/financial-services`,
  UPDATE_FINANCIAL_SERVICE: (serviceId) => `${API_BASE_URL}/api/financial-services/${serviceId}`,
  DELETE_FINANCIAL_SERVICE: (serviceId) => `${API_BASE_URL}/api/financial-services/${serviceId}`,

  // Financial Products endpoints
  GET_FINANCIAL_PRODUCTS: `${API_BASE_URL}/api/financial-products`,
  GET_FINANCIAL_PRODUCT_BY_ID: (productId) => `${API_BASE_URL}/api/financial-products/${productId}`,
  GET_FINANCIAL_PRODUCTS_BY_TYPE: (productType) => `${API_BASE_URL}/api/financial-products/type/${productType}`,
  CREATE_FINANCIAL_PRODUCT: `${API_BASE_URL}/api/financial-products`,
  UPDATE_FINANCIAL_PRODUCT: (productId) => `${API_BASE_URL}/api/financial-products/${productId}`,
  DELETE_FINANCIAL_PRODUCT: (productId) => `${API_BASE_URL}/api/financial-products/${productId}`,
  INCREMENT_PRODUCT_VIEWS: (productId) => `${API_BASE_URL}/api/financial-products/${productId}/view`,
  GET_FINANCIAL_STATS: `${API_BASE_URL}/api/financial-stats`,
};

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token);
};

// Helper function to remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

// Helper function to get stored user
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function to set stored user
export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse response first
    const data = await response.json().catch(() => ({}));

    // Handle different response statuses
    if (response.status === 401) {
      // Only remove token if it's truly expired (not just wrong credentials)
      // Check if this is a login/register request (which should not clear token)
      const isAuthRequest = url.includes('/login') || url.includes('/register');

      if (!isAuthRequest && token) {
        // Token is expired or invalid - clear it
        removeAuthToken();
        throw new Error('Session expired. Please login again.');
      } else {
        // Login failed - wrong credentials
        throw new Error(data.detail || 'Invalid credentials');
      }
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} Token and user data
 */
export const registerUser = async (userData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token and user data
    setAuthToken(data.access_token);
    setStoredUser(data.user);

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Token and user data
 */
export const loginUser = async (email, password) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token only - let the calling component handle user data storage
    // This allows for role-based customization (e.g., adding isAdmin flag)
    setAuthToken(data.access_token);
    // setStoredUser(data.user); // Commented out - handled by Login.jsx

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Admin login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<object>} Token and admin data
 */
export const adminLogin = async (email, password) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store token only - let the calling component handle user data storage
    setAuthToken(data.access_token);

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login with Google OAuth
 * @param {string} token - Google OAuth token
 * @returns {Promise<object>} Token and user data
 */
export const googleLogin = async (token) => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/api/auth/google-login`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    // Store token only - let the calling component handle user data storage
    // This allows for role-based customization (e.g., adding isAdmin flag)
    setAuthToken(data.access_token);
    // setStoredUser(data.user); // Commented out - handled by Login.jsx

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await apiRequest(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless
    removeAuthToken();
    // Dispatch custom logout event for other components to listen
    window.dispatchEvent(new Event('logout'));
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const user = await apiRequest(API_ENDPOINTS.GET_CURRENT_USER, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store'
    });

    // Update stored user data
    setStoredUser(user);

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {object} profileData - Profile data to update
 * @returns {Promise<object>} Updated user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Get token from localStorage using the correct key
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Create FormData for the backend (backend expects Form data)
    const formData = new FormData();

    // Append each field to FormData (only non-empty values)
    Object.keys(profileData).forEach(key => {
      const value = profileData[key];
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });

    // Make the request with FormData
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it automatically with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Failed to update profile' }));
      throw new Error(errorData.detail || 'Failed to update profile');
    }

    const data = await response.json();

    // Update stored user data
    setStoredUser(data);

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<object>} Success message
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const data = await apiRequest(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify user email
 * @param {string} userId - User ID
 * @returns {Promise<object>} Success message
 */
export const verifyEmail = async (userId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.VERIFY_EMAIL(userId), {
      method: 'POST',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify user phone
 * @param {string} userId - User ID
 * @returns {Promise<object>} Success message
 */
export const verifyPhone = async (userId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.VERIFY_PHONE(userId), {
      method: 'POST',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Forgot password - Send OTP to email
 * @param {string} email - User email
 * @returns {Promise<object>} Success message with OTP (dev only)
 */
export const forgotPassword = async (email) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset password using OTP
 * @param {string} email - User email
 * @param {string} otp - OTP received via email
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Success message
 */
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send OTP to mobile number for login
 * @param {string} phone - 10-digit mobile number
 * @returns {Promise<object>} Success message with OTP (dev only)
 */
export const sendOTP = async (phone) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify OTP and login user
 * @param {string} phone - 10-digit mobile number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<object>} Token and user data
 */
export const verifyOTP = async (phone, otp) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });

    // Store token and user data
    setAuthToken(data.access_token);
    setStoredUser(data.user);

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Check API health
 * @returns {Promise<object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getStoredUser();

  // If no token, definitely not authenticated
  if (!token || !user) {
    return false;
  }

  // Token exists - assume valid until backend says otherwise
  // Don't validate on frontend as it can cause false negatives
  return true;
};

// ===================== CONTACT API FUNCTIONS =====================

/**
 * Submit a contact form (PUBLIC - No authentication required)
 * @param {object} contactData - Contact form data (name, email, phone, subject, message)
 * @returns {Promise<object>} Submission response
 */
export const submitContactForm = async (contactData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.SUBMIT_CONTACT, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all FAQs (PUBLIC - No authentication required)
 * @param {string} category - Optional category filter (all, loans, insurance, investments, tax)
 * @returns {Promise<array>} List of FAQs
 */
export const getFAQs = async (category = null) => {
  try {
    const url = category ? `${API_ENDPOINTS.GET_FAQS}?category=${category}` : API_ENDPOINTS.GET_FAQS;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch FAQs');
    }

    return await response.json();
  } catch (error) {
    console.error('Get FAQs error:', error);
    throw error;
  }
};

/**
 * Get all contact submissions (ADMIN ONLY)
 * @param {object} params - Query parameters (skip, limit, status, is_read)
 * @returns {Promise<array>} List of submissions
 */
export const getAllSubmissions = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.is_read !== undefined) queryParams.append('is_read', params.is_read);

    const url = `${API_ENDPOINTS.GET_ALL_SUBMISSIONS}?${queryParams.toString()}`;
    const data = await apiRequest(url, { method: 'GET' });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific contact submission by ID (ADMIN ONLY)
 * @param {string} submissionId - Submission ID
 * @returns {Promise<object>} Submission details
 */
export const getSubmissionById = async (submissionId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.GET_SUBMISSION_BY_ID(submissionId), {
      method: 'GET',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update contact submission status (ADMIN ONLY)
 * @param {string} submissionId - Submission ID
 * @param {string} status - New status (pending, in_progress, resolved, closed)
 * @param {string} adminNotes - Optional admin notes
 * @returns {Promise<object>} Success message
 */
export const updateSubmissionStatus = async (submissionId, status, adminNotes = null) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_SUBMISSION_STATUS(submissionId), {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark submission as read (ADMIN ONLY)
 * @param {string} submissionId - Submission ID
 * @returns {Promise<object>} Success message
 */
export const markSubmissionAsRead = async (submissionId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.MARK_SUBMISSION_READ(submissionId), {
      method: 'PATCH',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a contact submission (ADMIN ONLY)
 * @param {string} submissionId - Submission ID
 * @returns {Promise<object>} Success message
 */
export const deleteSubmission = async (submissionId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_SUBMISSION(submissionId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get contact submission statistics (ADMIN ONLY)
 * @returns {Promise<object>} Statistics data
 */
export const getContactStatistics = async () => {
  try {
    const data = await apiRequest(API_ENDPOINTS.GET_CONTACT_STATISTICS, {
      method: 'GET',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// ===================== FAQ MANAGEMENT API FUNCTIONS (ADMIN ONLY) =====================

/**
 * Create a new FAQ (ADMIN ONLY)
 * @param {object} faqData - FAQ data (category, question, answer, highlight, isActive)
 * @returns {Promise<object>} Created FAQ
 */
export const createFAQ = async (faqData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.CREATE_FAQ, {
      method: 'POST',
      body: JSON.stringify(faqData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all FAQs including inactive ones (ADMIN ONLY)
 * @param {string} category - Optional category filter
 * @param {boolean} isActive - Optional active status filter
 * @returns {Promise<array>} List of FAQs
 */
export const getAllFAQsAdmin = async (category = null, isActive = null) => {
  try {
    const queryParams = new URLSearchParams();

    if (category) queryParams.append('category', category);
    if (isActive !== null) queryParams.append('is_active', isActive);

    const url = `${API_ENDPOINTS.GET_ALL_FAQS_ADMIN}?${queryParams.toString()}`;
    const data = await apiRequest(url, { method: 'GET' });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific FAQ by ID (ADMIN ONLY)
 * @param {string} faqId - FAQ ID
 * @returns {Promise<object>} FAQ details
 */
export const getFAQById = async (faqId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.GET_FAQ_BY_ID(faqId), {
      method: 'GET',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a FAQ (ADMIN ONLY)
 * @param {string} faqId - FAQ ID
 * @param {object} faqData - Updated FAQ data
 * @returns {Promise<object>} Updated FAQ
 */
export const updateFAQ = async (faqId, faqData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_FAQ(faqId), {
      method: 'PUT',
      body: JSON.stringify(faqData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a FAQ (ADMIN ONLY)
 * @param {string} faqId - FAQ ID
 * @returns {Promise<object>} Success message
 */
export const deleteFAQ = async (faqId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_FAQ(faqId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update FAQ display order (ADMIN ONLY)
 * @param {string} faqId - FAQ ID
 * @param {number} order - New order position
 * @returns {Promise<object>} Success message
 */
export const updateFAQOrder = async (faqId, order) => {
  try {
    const data = await apiRequest(`${API_ENDPOINTS.UPDATE_FAQ_ORDER(faqId)}?order=${order}`, {
      method: 'PATCH',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// ===================== ABOUT API FUNCTIONS (PUBLIC) =====================

/**
 * Get all testimonials (PUBLIC)
 * @returns {Promise<array>} List of testimonials
 */
export const getTestimonials = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_TESTIMONIALS);

    if (!response.ok) {
      throw new Error('Failed to fetch testimonials');
    }

    return await response.json();
  } catch (error) {
    console.error('Get testimonials error:', error);
    throw error;
  }
};

/**
 * Get all achievements (PUBLIC)
 * @returns {Promise<array>} List of achievements
 */
export const getAchievements = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_ACHIEVEMENTS);

    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }

    return await response.json();
  } catch (error) {
    console.error('Get achievements error:', error);
    throw error;
  }
};

/**
 * Get all stats (PUBLIC)
 * @returns {Promise<array>} List of stats
 */
export const getStats = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_STATS);

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return await response.json();
  } catch (error) {
    console.error('Get stats error:', error);
    throw error;
  }
};

/**
 * Get all milestones (PUBLIC)
 * @returns {Promise<array>} List of milestones
 */
export const getMilestones = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_MILESTONES);

    if (!response.ok) {
      throw new Error('Failed to fetch milestones');
    }

    return await response.json();
  } catch (error) {
    console.error('Get milestones error:', error);
    throw error;
  }
};

// ===================== ABOUT MANAGEMENT API FUNCTIONS (ADMIN ONLY) =====================

/**
 * Create a new testimonial (ADMIN ONLY)
 * @param {object} testimonialData - Testimonial data
 * @returns {Promise<object>} Created testimonial
 */
export const createTestimonial = async (testimonialData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.CREATE_TESTIMONIAL, {
      method: 'POST',
      body: JSON.stringify(testimonialData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a testimonial (ADMIN ONLY)
 * @param {string} testimonialId - Testimonial ID
 * @param {object} testimonialData - Updated testimonial data
 * @returns {Promise<object>} Updated testimonial
 */
export const updateTestimonial = async (testimonialId, testimonialData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_TESTIMONIAL(testimonialId), {
      method: 'PUT',
      body: JSON.stringify(testimonialData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a testimonial (ADMIN ONLY)
 * @param {string} testimonialId - Testimonial ID
 * @returns {Promise<object>} Success message
 */
export const deleteTestimonial = async (testimonialId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_TESTIMONIAL(testimonialId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new achievement (ADMIN ONLY)
 * @param {object} achievementData - Achievement data
 * @returns {Promise<object>} Created achievement
 */
export const createAchievement = async (achievementData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.CREATE_ACHIEVEMENT, {
      method: 'POST',
      body: JSON.stringify(achievementData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an achievement (ADMIN ONLY)
 * @param {string} achievementId - Achievement ID
 * @param {object} achievementData - Updated achievement data
 * @returns {Promise<object>} Updated achievement
 */
export const updateAchievement = async (achievementId, achievementData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_ACHIEVEMENT(achievementId), {
      method: 'PUT',
      body: JSON.stringify(achievementData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete an achievement (ADMIN ONLY)
 * @param {string} achievementId - Achievement ID
 * @returns {Promise<object>} Success message
 */
export const deleteAchievement = async (achievementId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_ACHIEVEMENT(achievementId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new stat (ADMIN ONLY)
 * @param {object} statData - Stat data
 * @returns {Promise<object>} Created stat
 */
export const createStat = async (statData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.CREATE_STAT, {
      method: 'POST',
      body: JSON.stringify(statData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a stat (ADMIN ONLY)
 * @param {string} statId - Stat ID
 * @param {object} statData - Updated stat data
 * @returns {Promise<object>} Updated stat
 */
export const updateStat = async (statId, statData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_STAT(statId), {
      method: 'PUT',
      body: JSON.stringify(statData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a stat (ADMIN ONLY)
 * @param {string} statId - Stat ID
 * @returns {Promise<object>} Success message
 */
export const deleteStat = async (statId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_STAT(statId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new milestone (ADMIN ONLY)
 * @param {object} milestoneData - Milestone data
 * @returns {Promise<object>} Created milestone
 */
export const createMilestone = async (milestoneData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.CREATE_MILESTONE, {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a milestone (ADMIN ONLY)
 * @param {string} milestoneId - Milestone ID
 * @param {object} milestoneData - Updated milestone data
 * @returns {Promise<object>} Updated milestone
 */
export const updateMilestone = async (milestoneId, milestoneData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_MILESTONE(milestoneId), {
      method: 'PUT',
      body: JSON.stringify(milestoneData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a milestone (ADMIN ONLY)
 * @param {string} milestoneId - Milestone ID
 * @returns {Promise<object>} Success message
 */
export const deleteMilestone = async (milestoneId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_MILESTONE(milestoneId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// ===================== HOME API FUNCTIONS (PUBLIC) =====================

/**
 * Get homepage testimonials (PUBLIC)
 * @returns {Promise<array>} List of testimonials for homepage
 */
export const getHomeTestimonials = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_HOME_TESTIMONIALS);

    if (!response.ok) {
      throw new Error('Failed to fetch home testimonials');
    }

    return await response.json();
  } catch (error) {
    console.error('Get home testimonials error:', error);
    throw error;
  }
};

/**
 * Get blog posts (PUBLIC)
 * @param {string} category - Optional category filter
 * @param {boolean} featured - Optional featured filter
 * @returns {Promise<array>} List of blog posts
 */
export const getBlogs = async (category = null, featured = null) => {
  try {
    let url = API_ENDPOINTS.GET_BLOGS;
    const params = new URLSearchParams();

    if (category) params.append('category', category);
    if (featured !== null) params.append('featured', featured);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }

    return await response.json();
  } catch (error) {
    console.error('Get blogs error:', error);
    throw error;
  }
};

/**
 * Get a blog post by ID (PUBLIC)
 * @param {string} blogId - Blog post ID
 * @returns {Promise<object>} Blog post details
 */
export const getBlogById = async (blogId) => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_BLOG_BY_ID(blogId));

    if (!response.ok) {
      throw new Error('Failed to fetch blog post');
    }

    return await response.json();
  } catch (error) {
    console.error('Get blog by ID error:', error);
    throw error;
  }
};

/**
 * Get featured blog posts (PUBLIC)
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<array>} List of featured blog posts
 */
export const getFeaturedBlogs = async (limit = 3) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.GET_FEATURED_BLOGS}?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to fetch featured blogs');
    }

    return await response.json();
  } catch (error) {
    console.error('Get featured blogs error:', error);
    throw error;
  }
};

/**
 * Get popular blog posts (PUBLIC)
 * @param {number} limit - Number of posts to fetch
 * @returns {Promise<array>} List of popular blog posts
 */
export const getPopularBlogs = async (limit = 5) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.GET_POPULAR_BLOGS}?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Failed to fetch popular blogs');
    }

    return await response.json();
  } catch (error) {
    console.error('Get popular blogs error:', error);
    throw error;
  }
};

// ===================== HOME MANAGEMENT API FUNCTIONS (ADMIN ONLY) =====================

/**
 * Create a new homepage testimonial (ADMIN ONLY)
 * @param {object} testimonialData - Testimonial data
 * @returns {Promise<object>} Created testimonial
 */
export const createHomeTestimonial = async (testimonialData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.CREATE_HOME_TESTIMONIAL, {
      method: 'POST',
      body: JSON.stringify(testimonialData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a homepage testimonial (ADMIN ONLY)
 * @param {string} testimonialId - Testimonial ID
 * @param {object} testimonialData - Updated testimonial data
 * @returns {Promise<object>} Updated testimonial
 */
export const updateHomeTestimonial = async (testimonialId, testimonialData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_HOME_TESTIMONIAL(testimonialId), {
      method: 'PUT',
      body: JSON.stringify(testimonialData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a homepage testimonial (ADMIN ONLY)
 * @param {string} testimonialId - Testimonial ID
 * @returns {Promise<object>} Success message
 */
export const deleteHomeTestimonial = async (testimonialId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_HOME_TESTIMONIAL(testimonialId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new blog post (ADMIN ONLY)
 * @param {object} blogData - Blog post data
 * @returns {Promise<object>} Created blog post
 */
export const createBlog = async (blogData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.CREATE_BLOG, {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a blog post (ADMIN ONLY)
 * @param {string} blogId - Blog post ID
 * @param {object} blogData - Updated blog post data
 * @returns {Promise<object>} Updated blog post
 */
export const updateBlog = async (blogId, blogData) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.UPDATE_BLOG(blogId), {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a blog post (ADMIN ONLY)
 * @param {string} blogId - Blog post ID
 * @returns {Promise<object>} Success message
 */
export const deleteBlog = async (blogId) => {
  try {
    const data = await apiRequest(API_ENDPOINTS.DELETE_BLOG(blogId), {
      method: 'DELETE',
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// ===================== IMAGE UPLOAD FUNCTIONS (ADMIN ONLY) =====================

/**
 * Upload testimonial image (ADMIN ONLY)
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<object>} Upload response with image_path
 */
export const uploadTestimonialImage = async (imageFile) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(API_ENDPOINTS.UPLOAD_TESTIMONIAL_IMAGE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload testimonial image error:', error);
    throw error;
  }
};

/**
 * Upload blog image (ADMIN ONLY)
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<object>} Upload response with image_path
 */
export const uploadBlogImage = async (imageFile) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(API_ENDPOINTS.UPLOAD_BLOG_IMAGE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload blog image error:', error);
    throw error;
  }
};

/**
 * Delete uploaded image (ADMIN ONLY)
 * @param {string} imagePath - Path to image to delete
 * @returns {Promise<object>} Delete response
 */
export const deleteUploadedImage = async (imagePath) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${API_ENDPOINTS.DELETE_IMAGE}?image_path=${encodeURIComponent(imagePath)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Delete image error:', error);
    throw error;
  }
};

// ===================== FINANCIAL SERVICES FUNCTIONS =====================

/**
 * Get all financial services (PUBLIC)
 * @param {object} params - Query parameters (active_only, skip, limit)
 * @returns {Promise<array>} List of financial services
 */
export const getFinancialServices = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.GET_FINANCIAL_SERVICES}?${queryParams}`
      : API_ENDPOINTS.GET_FINANCIAL_SERVICES;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch financial services');
    }

    return await response.json();
  } catch (error) {
    console.error('Get financial services error:', error);
    throw error;
  }
};

/**
 * Get financial service by ID (PUBLIC)
 * @param {string} serviceId - Service ID
 * @returns {Promise<object>} Financial service
 */
export const getFinancialServiceById = async (serviceId) => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_FINANCIAL_SERVICE_BY_ID(serviceId));

    if (!response.ok) {
      throw new Error('Failed to fetch financial service');
    }

    return await response.json();
  } catch (error) {
    console.error('Get financial service error:', error);
    throw error;
  }
};

/**
 * Get financial service by category (PUBLIC)
 * @param {string} category - Category name (e.g., "Loans", "Insurance")
 * @returns {Promise<object>} Financial service
 */
export const getFinancialServiceByCategory = async (category) => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_FINANCIAL_SERVICE_BY_CATEGORY(category));

    if (!response.ok) {
      throw new Error('Failed to fetch financial service by category');
    }

    return await response.json();
  } catch (error) {
    console.error('Get financial service by category error:', error);
    throw error;
  }
};

/**
 * Create financial service (ADMIN ONLY)
 * @param {object} serviceData - Service data
 * @returns {Promise<object>} Created service
 */
export const createFinancialService = async (serviceData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(API_ENDPOINTS.CREATE_FINANCIAL_SERVICE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create financial service');
    }

    return await response.json();
  } catch (error) {
    console.error('Create financial service error:', error);
    throw error;
  }
};

/**
 * Update financial service (ADMIN ONLY)
 * @param {string} serviceId - Service ID
 * @param {object} serviceData - Updated service data
 * @returns {Promise<object>} Updated service
 */
export const updateFinancialService = async (serviceId, serviceData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(API_ENDPOINTS.UPDATE_FINANCIAL_SERVICE(serviceId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update financial service');
    }

    return await response.json();
  } catch (error) {
    console.error('Update financial service error:', error);
    throw error;
  }
};

/**
 * Delete financial service (ADMIN ONLY)
 * @param {string} serviceId - Service ID
 * @returns {Promise<void>}
 */
export const deleteFinancialService = async (serviceId) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(API_ENDPOINTS.DELETE_FINANCIAL_SERVICE(serviceId), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete financial service');
    }
  } catch (error) {
    console.error('Delete financial service error:', error);
    throw error;
  }
};

// ===================== FINANCIAL PRODUCTS FUNCTIONS =====================

/**
 * Get all financial products (PUBLIC)
 * @param {object} params - Query parameters (active_only, product_type, featured_only, skip, limit)
 * @returns {Promise<array>} List of financial products
 */
export const getFinancialProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.GET_FINANCIAL_PRODUCTS}?${queryParams}`
      : API_ENDPOINTS.GET_FINANCIAL_PRODUCTS;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch financial products');
    }

    return await response.json();
  } catch (error) {
    console.error('Get financial products error:', error);
    throw error;
  }
};

/**
 * Get financial product by ID (PUBLIC)
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Financial product
 */
export const getFinancialProductById = async (productId) => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_FINANCIAL_PRODUCT_BY_ID(productId));

    if (!response.ok) {
      throw new Error('Failed to fetch financial product');
    }

    return await response.json();
  } catch (error) {
    console.error('Get financial product error:', error);
    throw error;
  }
};

/**
 * Get financial products by type (PUBLIC)
 * @param {string} productType - Product type (loan, insurance, investment, tax)
 * @param {boolean} activeOnly - Get only active products
 * @returns {Promise<array>} List of financial products
 */
export const getFinancialProductsByType = async (productType, activeOnly = true) => {
  try {
    const url = `${API_ENDPOINTS.GET_FINANCIAL_PRODUCTS_BY_TYPE(productType)}?active_only=${activeOnly}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch financial products by type');
    }

    return await response.json();
  } catch (error) {
    console.error('Get financial products by type error:', error);
    throw error;
  }
};

/**
 * Create financial product (ADMIN ONLY)
 * @param {object} productData - Product data
 * @returns {Promise<object>} Created product
 */
export const createFinancialProduct = async (productData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(API_ENDPOINTS.CREATE_FINANCIAL_PRODUCT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create financial product');
    }

    return await response.json();
  } catch (error) {
    console.error('Create financial product error:', error);
    throw error;
  }
};

/**
 * Update financial product (ADMIN ONLY)
 * @param {string} productId - Product ID
 * @param {object} productData - Updated product data
 * @returns {Promise<object>} Updated product
 */
export const updateFinancialProduct = async (productId, productData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(API_ENDPOINTS.UPDATE_FINANCIAL_PRODUCT(productId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update financial product');
    }

    return await response.json();
  } catch (error) {
    console.error('Update financial product error:', error);
    throw error;
  }
};

/**
 * Delete financial product (ADMIN ONLY)
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export const deleteFinancialProduct = async (productId) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(API_ENDPOINTS.DELETE_FINANCIAL_PRODUCT(productId), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete financial product');
    }
  } catch (error) {
    console.error('Delete financial product error:', error);
    throw error;
  }
};

/**
 * Increment product views (PUBLIC)
 * @param {string} productId - Product ID
 * @returns {Promise<object>} Response message
 */
export const incrementProductViews = async (productId) => {
  try {
    const response = await fetch(API_ENDPOINTS.INCREMENT_PRODUCT_VIEWS(productId), {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to increment product views');
    }

    return await response.json();
  } catch (error) {
    console.error('Increment product views error:', error);
    throw error;
  }
};

/**
 * Get financial statistics (PUBLIC)
 * @returns {Promise<object>} Financial statistics
 */
export const getFinancialStatistics = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.GET_FINANCIAL_STATS);

    if (!response.ok) {
      throw new Error('Failed to fetch financial statistics');
    }

    return await response.json();
  } catch (error) {
    console.error('Get financial statistics error:', error);
    throw error;
  }
};

export default {
  registerUser,
  loginUser,
  adminLogin,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  verifyPhone,
  checkHealth,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getStoredUser,
  setStoredUser,
  // Contact functions
  submitContactForm,
  getFAQs,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  markSubmissionAsRead,
  deleteSubmission,
  getContactStatistics,
  // FAQ Management functions
  createFAQ,
  getAllFAQsAdmin,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  updateFAQOrder,
  // About functions (PUBLIC)
  getTestimonials,
  getAchievements,
  getStats,
  getMilestones,

  // About Management functions (ADMIN)
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  createStat,
  updateStat,
  deleteStat,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  // Home functions (PUBLIC)
  getHomeTestimonials,
  getBlogs,
  getBlogById,
  getFeaturedBlogs,
  getPopularBlogs,
  // Home Management functions (ADMIN)
  createHomeTestimonial,
  updateHomeTestimonial,
  deleteHomeTestimonial,
  createBlog,
  updateBlog,
  deleteBlog,
  // Image Upload functions (ADMIN)
  uploadTestimonialImage,
  uploadBlogImage,
  deleteUploadedImage,
  // Financial Services functions (PUBLIC)
  getFinancialServices,
  getFinancialServiceById,
  getFinancialServiceByCategory,
  // Financial Services Management functions (ADMIN)
  createFinancialService,
  updateFinancialService,
  deleteFinancialService,
  // Financial Products functions (PUBLIC)
  getFinancialProducts,
  getFinancialProductById,
  getFinancialProductsByType,
  incrementProductViews,
  getFinancialStatistics,
  // Financial Products Management functions (ADMIN)
  createFinancialProduct,
  updateFinancialProduct,
  deleteFinancialProduct,
};

