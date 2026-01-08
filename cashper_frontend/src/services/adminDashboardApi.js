/**
 * Admin Dashboard API Service
 * Handles all API calls for admin dashboard with real-time data
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';

// ==================== DASHBOARD STATS ====================

/**
 * Fetch dashboard statistics (users, loans, insurance, revenue)
 * Returns real-time data from database
 */
export const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE_URL}/dashboard/stats?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Dashboard Stats API Response:', data);

    return {
      success: true,
      data: {
        totalUsers: data.totalUsers || data.total_users || 0,
        activeLoans: data.activeLoans || data.active_loans || '₹0Cr',
        insurancePolicies: data.insurancePolicies || data.insurance_policies || 0,
        totalRevenue: data.totalRevenue || data.total_revenue || '₹0Cr',
        totalUsersChange: data.totalUsersChange || data.user_growth || '+0%',
        activeLoansChange: data.activeLoansChange || data.loan_growth || '+0%',
        insurancePoliciesChange: data.insurancePoliciesChange || data.insurance_growth || '+0%',
        totalRevenueChange: data.totalRevenueChange || data.revenue_growth || '+0%',
        timestamp: data.timestamp || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// ==================== PERFORMANCE METRICS ====================

/**
 * Fetch admin performance metrics (logins, hours active, tasks, rating)
 * Returns real-time metrics calculated from actual data
 */
export const fetchPerformanceMetrics = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const timestamp = new Date().getTime();
    const response = await fetch(`${API_BASE_URL}/dashboard/performance-metrics?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Performance Metrics API Response:', data);

    return {
      success: true,
      data: {
        totalLogins: data.total_logins || 0,
        hoursActive: data.hours_active || 0,
        tasksCompleted: data.tasks_completed || 0,
        rating: data.rating || 0,
        ratingMax: data.rating_max || 5,
        approvalRate: data.approval_rate || 0,
        timestamp: data.timestamp || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Error fetching performance metrics:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// ==================== RECENT ACTIVITIES ====================

/**
 * Fetch recent activities/transactions
 */
export const fetchRecentActivities = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/dashboard/activities?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Recent Activities API Response:', data);

    return {
      success: true,
      data: {
        activities: data.activities || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 1
      }
    };
  } catch (error) {
    console.error('❌ Error fetching recent activities:', error);
    return {
      success: false,
      error: error.message,
      data: { activities: [], total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  }
};

// ==================== PENDING APPROVALS ====================

/**
 * Fetch pending approvals (loans, insurance, etc.)
 */
export const fetchPendingApprovals = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/dashboard/pending-approvals?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Pending Approvals API Response:', data);

    return {
      success: true,
      data: {
        approvals: data.pending_approvals || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 1
      }
    };
  } catch (error) {
    console.error('❌ Error fetching pending approvals:', error);
    return {
      success: false,
      error: error.message,
      data: { approvals: [], total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  }
};

// ==================== APPROVAL ACTIONS ====================

/**
 * Approve a pending loan/insurance
 */
export const approveApplication = async (applicationId, applicationType) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/loans/${applicationId}/approve`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Application Approved:', data);

    return {
      success: true,
      message: `${applicationType} approved successfully`,
      data
    };
  } catch (error) {
    console.error('❌ Error approving application:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to approve ${applicationType}`
    };
  }
};

/**
 * Reject a pending loan/insurance
 */
export const rejectApplication = async (applicationId, applicationType, reason = '') => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/loans/${applicationId}/reject`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Application Rejected:', data);

    return {
      success: true,
      message: `${applicationType} rejected successfully`,
      data
    };
  } catch (error) {
    console.error('❌ Error rejecting application:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to reject ${applicationType}`
    };
  }
};

/**
 * Get detailed information about an application
 */
export const getApplicationDetails = async (applicationId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/loans/${applicationId}/details`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Application Details:', data);

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Error fetching application details:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// ==================== BATCH OPERATIONS ====================

/**
 * Fetch all dashboard data at once
 */
export const fetchAllDashboardData = async () => {
  try {
    console.log('🔄 Fetching all dashboard data...');

    const [statsRes, metricsRes, activitiesRes, approvalsRes] = await Promise.all([
      fetchDashboardStats(),
      fetchPerformanceMetrics(),
      fetchRecentActivities(1, 10),
      fetchPendingApprovals(1, 10)
    ]);

    return {
      success: statsRes.success && metricsRes.success && activitiesRes.success && approvalsRes.success,
      data: {
        stats: statsRes.data,
        metrics: metricsRes.data,
        activities: activitiesRes.data,
        approvals: approvalsRes.data
      },
      errors: {
        stats: statsRes.error,
        metrics: metricsRes.error,
        activities: activitiesRes.error,
        approvals: approvalsRes.error
      }
    };
  } catch (error) {
    console.error('❌ Error fetching all dashboard data:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

export default {
  fetchDashboardStats,
  fetchPerformanceMetrics,
  fetchRecentActivities,
  fetchPendingApprovals,
  approveApplication,
  rejectApplication,
  getApplicationDetails,
  fetchAllDashboardData
};
