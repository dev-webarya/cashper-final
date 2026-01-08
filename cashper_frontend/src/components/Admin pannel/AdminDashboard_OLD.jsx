import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, TrendingDown, Users, IndianRupee, Shield, BarChart3, Activity, AlertCircle, ChevronLeft, ChevronRight, Eye, X, CheckCircle, Loader, Clock, CheckSquare, Star, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [approvalsPage, setApprovalsPage] = useState(1);
  const itemsPerPage = 4;

  // API State Management
  const [stats, setStats] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const API_BASE_URL = 'http://127.0.0.1:8000/api/admin';
  const WS_BASE_URL = 'ws://127.0.0.1:8000/api/admin';
  
  const wsRef = useRef(null);
  const connectionAttemptRef = useRef(0);
  const maxReconnectAttempts = 3;
  const reconnectIntervalRef = useRef(null);
  const fallbackIntervalRef = useRef(null);

  // ==================== HELPER FUNCTIONS ====================

  const getActivityIcon = (type) => {
    const icons = {
      user: Users,
      loan: IndianRupee,
      insurance: Shield,
      investment: TrendingUp,
      payment: Activity
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type) => {
    const colors = {
      user: 'text-blue-600',
      loan: 'text-green-600',
      insurance: 'text-emerald-600',
      investment: 'text-purple-600',
      payment: 'text-indigo-600'
    };
    return colors[type] || 'text-gray-600';
  };
  const getActivityBg = (type) => {
    const backgrounds = {
      user: 'bg-blue-50',
      loan: 'bg-green-50',
      insurance: 'bg-emerald-50',
      investment: 'bg-purple-50',
      payment: 'bg-indigo-50'
    };
    return backgrounds[type] || 'bg-gray-50';
  };
  // ==================== WEBSOCKET FUNCTIONS ====================
  const connectWebSocket = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      const wsUrl = `${WS_BASE_URL}/ws/dashboard`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        connectionAttemptRef.current = 0;
        setLoading(false);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📡 Real-time update:', data);
          
          if (data.type === 'dashboard_update') {
            // Update stats
            if (data.stats) {
              const statsData = [
                {
                  title: 'Total Users',
                  value: data.stats.totalUsers || '0',
                  change: data.stats.totalUsersChange || '+0%',
                  trend: (data.stats.totalUsersChange || '+0%').includes('-') ? 'down' : 'up',
                  icon: Users,
                  gradient: 'from-blue-600 to-blue-700',
                  bgColor: 'bg-blue-50',
                  textColor: 'text-blue-700'
                },
                {
                  title: 'Active Loans',
                  value: data.stats.activeLoans || '₹0',
                  change: data.stats.activeLoansChange || '+0%',
                  trend: (data.stats.activeLoansChange || '+0%').includes('-') ? 'down' : 'up',
                  icon: IndianRupee,
                  gradient: 'from-green-600 to-green-700',
                  bgColor: 'bg-green-50',
                  textColor: 'text-green-700'
                },
                {
                  title: 'Insurance Policies',
                  value: data.stats.insurancePolicies || '0',
                  change: data.stats.insurancePoliciesChange || '+0%',
                  trend: (data.stats.insurancePoliciesChange || '+0%').includes('-') ? 'down' : 'up',
                  icon: Shield,
                  gradient: 'from-emerald-600 to-teal-600',
                  bgColor: 'bg-emerald-50',
                  textColor: 'text-emerald-700'
                },
                {
                  title: 'Total Revenue',
                  value: data.stats.totalRevenue || '₹0',
                  change: data.stats.totalRevenueChange || '+0%',
                  trend: (data.stats.totalRevenueChange || '+0%').includes('-') ? 'down' : 'up',
                  icon: TrendingUp,
                  gradient: 'from-purple-600 to-pink-600',
                  bgColor: 'bg-purple-50',
                  textColor: 'text-purple-700'
                }
              ];
              setStats(statsData);
            }
            
            // Update performance metrics
            if (data.performance) {
              setPerformanceMetrics({
                totalLogins: data.performance.total_logins || 0,
                hoursActive: data.performance.hours_active || 0,
                tasksCompleted: data.performance.tasks_completed || 0,
                rating: data.performance.rating || 0,
                ratingMax: data.performance.rating_max || 5
              });
            }
            
            // Update activities
            if (data.activities) {
              const activitiesData = data.activities.map((activity) => ({
                id: activity.id,
                action: activity.action,
                user: activity.user,
                time: activity.time,
                amount: activity.amount,
                type: activity.type,
                icon: getActivityIcon(activity.type),
                color: getActivityColor(activity.type),
                bg: getActivityBg(activity.type)
              }));
              setRecentActivities(activitiesData);
            }
            
            // Update approvals
            if (data.approvals) {
              setPendingApprovals(data.approvals);
            }
            
            // Update timestamp
            const now = new Date();
            setLastUpdated(now.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            }));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket closed');
        setIsConnected(false);
        
        // Attempt reconnect
        if (connectionAttemptRef.current < maxReconnectAttempts) {
          connectionAttemptRef.current++;
          const delay = Math.pow(2, connectionAttemptRef.current) * 1000;
          console.log(`🔄 Reconnect attempt ${connectionAttemptRef.current}/${maxReconnectAttempts} in ${delay}ms`);
          
          reconnectIntervalRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          console.log('⚠️ Switching to polling fallback');
          setConnectionStatus('fallback');
          startFallbackPolling();
        }
      };
      
      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setConnectionStatus('fallback');
      startFallbackPolling();
    }
  }, []);

  const startFallbackPolling = useCallback(() => {
    console.log('📊 Starting fallback polling');
    setConnectionStatus('fallback');
    
    const poll = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const timestamp = Date.now();
        
        const [statsRes, perfRes, activitiesRes, approvalsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/stats?t=${timestamp}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache'
            }
          }),
          fetch(`${API_BASE_URL}/dashboard/performance-metrics?t=${timestamp}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache'
            }
          }),
          fetch(`${API_BASE_URL}/dashboard/activities`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/dashboard/pending-approvals`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (statsRes.ok && perfRes.ok && activitiesRes.ok && approvalsRes.ok) {
          const [statsData, perfData, activitiesData, approvalsData] = await Promise.all([
            statsRes.json(),
            perfRes.json(),
            activitiesRes.json(),
            approvalsRes.json()
          ]);
          
          console.log('✅ Fallback polling data received');
          
          // Update stats
          const statsArray = [
            {
              title: 'Total Users',
              value: statsData.totalUsers || '0',
              change: statsData.totalUsersChange || '+0%',
              trend: (statsData.totalUsersChange || '+0%').includes('-') ? 'down' : 'up',
              icon: Users,
              gradient: 'from-blue-600 to-blue-700',
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-700'
            },
            {
              title: 'Active Loans',
              value: statsData.activeLoans || '₹0',
              change: statsData.activeLoansChange || '+0%',
              trend: (statsData.activeLoansChange || '+0%').includes('-') ? 'down' : 'up',
              icon: IndianRupee,
              gradient: 'from-green-600 to-green-700',
              bgColor: 'bg-green-50',
              textColor: 'text-green-700'
            },
            {
              title: 'Insurance Policies',
              value: statsData.insurancePolicies || '0',
              change: statsData.insurancePoliciesChange || '+0%',
              trend: (statsData.insurancePoliciesChange || '+0%').includes('-') ? 'down' : 'up',
              icon: Shield,
              gradient: 'from-emerald-600 to-teal-600',
              bgColor: 'bg-emerald-50',
              textColor: 'text-emerald-700'
            },
            {
              title: 'Total Revenue',
              value: statsData.totalRevenue || '₹0',
              change: statsData.totalRevenueChange || '+0%',
              trend: (statsData.totalRevenueChange || '+0%').includes('-') ? 'down' : 'up',
              icon: TrendingUp,
              gradient: 'from-purple-600 to-pink-600',
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-700'
            }
          ];
          setStats(statsArray);
          
          // Update performance
          setPerformanceMetrics({
            totalLogins: perfData.total_logins || 0,
            hoursActive: perfData.hours_active || 0,
            tasksCompleted: perfData.tasks_completed || 0,
            rating: perfData.rating || 0,
            ratingMax: perfData.rating_max || 5
          });
          
          // Update activities
          if (activitiesData.activities) {
            const activities = activitiesData.activities.map((activity) => ({
              id: activity.id,
              action: activity.action,
              user: activity.user,
              time: activity.time,
              amount: activity.amount,
              type: activity.type,
              icon: getActivityIcon(activity.type),
              color: getActivityColor(activity.type),
              bg: getActivityBg(activity.type)
            }));
            setRecentActivities(activities);
          }
          
          // Update approvals
          if (approvalsData.pending_approvals) {
            setPendingApprovals(approvalsData.pending_approvals);
          }
          
          // Update timestamp
          const now = new Date();
          setLastUpdated(now.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          }));
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Fallback polling error:', err);
      }
    };
    
    poll();
    fallbackIntervalRef.current = setInterval(poll, 10000);
  }, []);

  // ==================== LIFECYCLE & HANDLERS ====================

  useEffect(() => {
    // Connect to WebSocket on mount
    connectWebSocket();
    
    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
    };
  }, [connectWebSocket]);

  const handleManualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send('refresh');
    }
  };

  const handleApprove = async (approval) => {
    if (window.confirm(`Approve ${approval.type} for ${approval.customer}?\nAmount: ${approval.amount}`)) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/loans/${approval.id}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'approved' })
        });
        
        if (!response.ok) throw new Error('Failed to approve');
        
        alert(`${approval.type} approved successfully for ${approval.customer}!`);
      } catch (err) {
        alert('Failed to approve. Please try again.');
        console.error('Error approving:', err);
      }
    }
  };

  const handleReject = async (approval) => {
    if (window.confirm(`Reject ${approval.type} for ${approval.customer}?`)) {
      const reason = prompt('Please enter rejection reason:');
      if (reason) {
        try {
          const token = localStorage.getItem('access_token');
          const response = await fetch(`${API_BASE_URL}/loans/${approval.id}/reject`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
          });
          
          if (!response.ok) throw new Error('Failed to reject');
          
          alert(`${approval.type} rejected for ${approval.customer}.\nReason: ${reason}`);
        } catch (err) {
          alert('Failed to reject. Please try again.');
          console.error('Error rejecting:', err);
        }
      }
    }
  };

  const handleViewApproval = (approval) => {
    alert(`Viewing Approval Details:\n\nType: ${approval.type}\nCustomer: ${approval.customer}\nAmount: ${approval.amount}\nPurpose: ${approval.purpose}\nDate: ${approval.date}\nUrgent: ${approval.urgent ? 'Yes' : 'No'}`);
  };

  const handleViewActivity = (activity) => {
    alert(`Viewing Activity:\n\nAction: ${activity.action}\nUser: ${activity.user}\nAmount: ${activity.amount}\nTime: ${activity.time}\nType: ${activity.type}`);
  };

  const handleDeleteActivity = (activity) => {
    if (window.confirm(`Are you sure you want to delete this activity?\n\n${activity.action} by ${activity.user}`)) {
      alert('Activity deleted successfully!');
    }
  };

  // Pagination calculations
  const totalActivitiesPages = Math.ceil(recentActivities.length / itemsPerPage);
  const totalApprovalsPages = Math.ceil(pendingApprovals.length / itemsPerPage);
  
  const paginatedActivities = recentActivities.slice(
    (activitiesPage - 1) * itemsPerPage,
    activitiesPage * itemsPerPage
  );
  
  const paginatedApprovals = pendingApprovals.slice(
    (approvalsPage - 1) * itemsPerPage,
    approvalsPage * itemsPerPage
  );

  const defaultStats = [
    {
      title: 'Total Users',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Users,
      gradient: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Active Loans',
      value: '₹0',
      change: '+0%',
      trend: 'up',
      icon: IndianRupee,
      gradient: 'from-green-600 to-green-700',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Insurance Policies',
      value: '0',
      change: '+0%',
      trend: 'up',
      icon: Shield,
      gradient: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: 'Total Revenue',
      value: '₹0',
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Welcome Banner with Connection Status */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl shadow-lg p-4 xs:p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-2">Admin Dashboard 👨‍💼</h2>
            <p className="text-xs xs:text-sm sm:text-base text-green-50">Real-time platform analytics and management</p>
            {lastUpdated && (
              <p className="text-xs text-green-100 mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Last update: {lastUpdated}
              </p>
            )}
            
            {/* Connection Status Indicator */}
            <div className="flex items-center mt-2 text-xs">
              {connectionStatus === 'connected' && (
                <div className="flex items-center text-green-100">
                  <Wifi className="w-3 h-3 mr-1" />
                  <span>Real-time (WebSocket)</span>
                </div>
              )}
              {connectionStatus === 'fallback' && (
                <div className="flex items-center text-yellow-100">
                  <WifiOff className="w-3 h-3 mr-1" />
                  <span>Polling mode (10s refresh)</span>
                </div>
              )}
              {connectionStatus === 'connecting' && (
                <div className="flex items-center text-blue-100">
                  <Loader className="w-3 h-3 mr-1 animate-spin" />
                  <span>Connecting...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleManualRefresh}
              className="px-3 xs:px-4 py-1.5 xs:py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-xs xs:text-sm font-medium hover:bg-white/30 transition-colors flex items-center space-x-1"
              title="Refresh metrics"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 xs:px-4 py-1.5 xs:py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-xs xs:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="today" className="text-gray-900">Today</option>
              <option value="week" className="text-gray-900">This Week</option>
              <option value="month" className="text-gray-900">This Month</option>
              <option value="year" className="text-gray-900">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admin Performance Metrics Cards */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
          {/* Total Logins Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-blue-600 transform hover:-translate-y-1">
            <div className="p-4 xs:p-5 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs xs:text-sm font-semibold text-blue-700 mb-1">Total Logins</p>
                  <p className="text-2xl xs:text-3xl lg:text-4xl font-bold text-blue-900">
                    {performanceMetrics.totalLogins.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 xs:p-3 rounded-lg bg-blue-600 shadow-lg">
                  <BarChart3 className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs text-blue-600">
                <Clock className="w-3.5 h-3.5 mr-1" />
                <span className="font-medium">Session tracking</span>
              </div>
            </div>
          </div>

          {/* Hours Active Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-green-600 transform hover:-translate-y-1">
            <div className="p-4 xs:p-5 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs xs:text-sm font-semibold text-green-700 mb-1">Hours Active</p>
                  <p className="text-2xl xs:text-3xl lg:text-4xl font-bold text-green-900">
                    {performanceMetrics.hoursActive.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 xs:p-3 rounded-lg bg-green-600 shadow-lg">
                  <Clock className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs text-green-600">
                <Activity className="w-3.5 h-3.5 mr-1" />
                <span className="font-medium">Time logged</span>
              </div>
            </div>
          </div>

          {/* Tasks Completed Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-purple-600 transform hover:-translate-y-1">
            <div className="p-4 xs:p-5 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs xs:text-sm font-semibold text-purple-700 mb-1">Tasks Completed</p>
                  <p className="text-2xl xs:text-3xl lg:text-4xl font-bold text-purple-900">
                    {performanceMetrics.tasksCompleted.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 xs:p-3 rounded-lg bg-purple-600 shadow-lg">
                  <CheckSquare className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs text-purple-600">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                <span className="font-medium">Total actions</span>
              </div>
            </div>
          </div>

          {/* Rating Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-orange-600 transform hover:-translate-y-1">
            <div className="p-4 xs:p-5 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs xs:text-sm font-semibold text-orange-700 mb-1">Rating</p>
                  <p className="text-2xl xs:text-3xl lg:text-4xl font-bold text-orange-900">
                    {performanceMetrics.rating}/{performanceMetrics.ratingMax}
                  </p>
                </div>
                <div className="p-2.5 xs:p-3 rounded-lg bg-orange-600 shadow-lg">
                  <Star className="w-5 h-5 xs:w-6 xs:h-6 text-white fill-white" />
                </div>
              </div>
              <div className="flex items-center text-xs text-orange-600">
                <Star className="w-3.5 h-3.5 mr-1 fill-orange-600" />
                <span className="font-medium">Performance score</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
        {(stats || defaultStats).map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="p-4 xs:p-5 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs xs:text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-2xl xs:text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2.5 xs:p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="w-5 h-5 xs:w-6 xs:h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-red-600 mr-1" />
                )}
                <span className={`text-xs xs:text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-2">vs last period</span>
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`}></div>
          </div>
        ))}
      </div>

      {/* Activities and Approvals */}
      <div className="flex flex-col gap-4 xs:gap-5 sm:gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 xs:p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900">Recent Activities</h3>
            <span className="px-2 xs:px-3 py-1 bg-blue-100 text-blue-700 text-xs xs:text-sm font-bold rounded-full">
              {recentActivities.length} Total
            </span>
          </div>
          
          <div className="space-y-3 xs:space-y-4 mb-4">
            {paginatedActivities.length > 0 ? paginatedActivities.map((activity) => (
              <div key={activity.id} className="flex flex-row items-center justify-between p-3 xs:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 gap-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-2 xs:p-2.5 rounded-lg ${activity.bg} flex-shrink-0`}>
                    <activity.icon className={`w-4 h-4 xs:w-5 xs:h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs xs:text-sm font-semibold text-gray-900 mb-0.5 truncate">{activity.action}</p>
                    <p className="text-xs text-gray-600 truncate mb-0.5">{activity.user}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] xs:text-xs text-gray-500">
                      <span>{activity.time}</span>
                      {activity.amount !== '-' && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-green-600">{activity.amount}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleViewActivity(activity)}
                    className="px-2.5 xs:px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity)}
                    className="px-2.5 xs:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activities</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalActivitiesPages > 1 && (
            <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <p className="text-xs xs:text-sm text-gray-600 order-2 xs:order-1">
                Showing {((activitiesPage - 1) * itemsPerPage) + 1} to {Math.min(activitiesPage * itemsPerPage, recentActivities.length)} of {recentActivities.length} activities
              </p>
              <div className="flex items-center space-x-2 order-1 xs:order-2">
                <button
                  onClick={() => setActivitiesPage(prev => Math.max(prev - 1, 1))}
                  disabled={activitiesPage === 1}
                  className="p-1.5 xs:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 text-gray-600" />
                </button>
                {[...Array(totalActivitiesPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActivitiesPage(index + 1)}
                    className={`px-2.5 xs:px-3 py-1 xs:py-1.5 text-xs xs:text-sm font-semibold rounded-lg transition-colors ${
                      activitiesPage === index + 1
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setActivitiesPage(prev => Math.min(prev + 1, totalActivitiesPages))}
                  disabled={activitiesPage === totalActivitiesPages}
                  className="p-1.5 xs:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 xs:p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900">Pending Approvals</h3>
            <span className="px-2 xs:px-3 py-1 bg-red-100 text-red-700 text-xs xs:text-sm font-bold rounded-full">
              {pendingApprovals.length} Pending
            </span>
          </div>
          
          <div className="space-y-3 xs:space-y-4 mb-4">
            {paginatedApprovals.length > 0 ? paginatedApprovals.map((item) => (
              <div
                key={item.id}
                className={`p-3 xs:p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                  item.urgent ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex flex-row items-center justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-xs xs:text-sm font-bold text-gray-900">{item.type}</span>
                      {item.urgent && (
                        <span className="flex items-center px-2 py-0.5 bg-red-500 text-white text-[10px] xs:text-xs font-bold rounded-full whitespace-nowrap">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs xs:text-sm text-gray-700 font-medium truncate mb-0.5">{item.customer}</p>
                    <p className="text-[10px] xs:text-xs text-gray-600 truncate">{item.purpose}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm xs:text-base font-bold text-gray-900 whitespace-nowrap">{item.amount}</p>
                    <p className="text-[10px] xs:text-xs text-gray-500 whitespace-nowrap">{item.date}</p>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleViewApproval(item)}
                    className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleApprove(item)}
                    className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 whitespace-nowrap"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(item)}
                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No pending approvals</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalApprovalsPages > 1 && (
            <div className="flex flex-col xs:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <p className="text-xs xs:text-sm text-gray-600 order-2 xs:order-1">
                Showing {((approvalsPage - 1) * itemsPerPage) + 1} to {Math.min(approvalsPage * itemsPerPage, pendingApprovals.length)} of {pendingApprovals.length} approvals
              </p>
              <div className="flex items-center space-x-2 order-1 xs:order-2">
                <button
                  onClick={() => setApprovalsPage(prev => Math.max(prev - 1, 1))}
                  disabled={approvalsPage === 1}
                  className="p-1.5 xs:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 text-gray-600" />
                </button>
                {[...Array(totalApprovalsPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setApprovalsPage(index + 1)}
                    className={`px-2.5 xs:px-3 py-1 xs:py-1.5 text-xs xs:text-sm font-semibold rounded-lg transition-colors ${
                      approvalsPage === index + 1
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setApprovalsPage(prev => Math.min(prev + 1, totalApprovalsPages))}
                  disabled={approvalsPage === totalApprovalsPages}
                  className="p-1.5 xs:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
