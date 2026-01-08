import React, { useState, useEffect } from 'react';
import { Calculator, FileText, TrendingUp, Eye, CheckCircle, XCircle, Clock, Filter, Search, Download, AlertCircle } from 'lucide-react';

// Helper function to format date properly
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    return dateString;
  }
};

// Helper function to format income range with labels
const formatIncomeRange = (incomeRange) => {
  if (!incomeRange) return 'N/A';
  
  const incomeLabels = {
    // Personal Tax Ranges
    'below-5': '₹0 - ₹5 Lakhs',
    '5-10': '₹5-10 Lakhs',
    '10-20': '₹10-20 Lakhs',
    '20-50': '₹20-50 Lakhs',
    'above-50': '₹50+ Lakhs',
    // Business Tax Ranges
    'below-20': 'Below ₹20 Lakhs',
    '20-1cr': '₹20 Lakhs - ₹1 Cr',
    '1-5cr': '₹1-5 Cr',
    '5-10cr': '₹5-10 Cr',
    '10-50cr': '₹10-50 Cr',
    'above-50cr': '₹50+ Cr'
  };
  
  return incomeLabels[incomeRange] || incomeRange;
};

// Helper function to calculate expected savings based on income range
const calculateExpectedSavings = (incomeRange, type) => {
  if (!incomeRange) return '₹0 - ₹0';
  
  const incomeRangeMap = {
    // Personal Tax Ranges
    'below-5': { min: 0, max: 500000 },
    '5-10': { min: 500000, max: 1000000 },
    '10-20': { min: 1000000, max: 2000000 },
    '20-50': { min: 2000000, max: 5000000 },
    'above-50': { min: 5000000, max: 10000000 },
    // Business Tax Ranges
    'below-20': { min: 0, max: 2000000 },
    '20-1cr': { min: 2000000, max: 10000000 },
    '1-5cr': { min: 10000000, max: 50000000 },
    '5-10cr': { min: 50000000, max: 100000000 },
    '10-50cr': { min: 100000000, max: 500000000 },
    'above-50cr': { min: 500000000, max: 1000000000 }
  };
  
  const range = incomeRangeMap[incomeRange];
  if (!range) return '₹0 - ₹0';
  
  // Calculate savings (typically 15-30% depending on tax regime and deductions)
  const minSavings = Math.round(range.min * 0.15); // 15% savings
  const maxSavings = Math.round(range.max * 0.30); // 30% savings
  
  return `₹${minSavings.toLocaleString('en-IN')} - ₹${maxSavings.toLocaleString('en-IN')}`;
};

const TaxPlanningManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [taxApplications, setTaxApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlanType, setFilterPlanType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPage = 10;

  // No static mock data - all data comes from API calls

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch from both personal and business tax endpoints
      const [personalResponse, businessResponse] = await Promise.all([
        fetch('http://localhost:8000/api/personal-tax/application/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/business-tax/application/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let allApplications = [];

      // Process personal tax applications
      if (personalResponse.ok) {
        const personalData = await personalResponse.json();
        const personalApps = (personalData || []).map(app => ({
          ...app,
          // Map API field names to component field names
          applicantName: app.applicantName || app.fullName || 'N/A',
          email: app.email || app.emailAddress || 'N/A',
          phone: app.phone || app.phoneNumber || 'N/A',
          planType: 'Personal Tax Planning',
          id: app._id || app.id,
          _id: app._id,
          appliedDate: app.appliedDate || app.createdAt || new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          // Add Annual Income and Expected Savings
          annualIncome: app.annualIncome || 'N/A',
          expectedSavings: app.expectedSavings || calculateExpectedSavings(app.annualIncome, 'personal')
        }));
        allApplications = [...allApplications, ...personalApps];
      }

      // Process business tax applications
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        const businessApps = (businessData || []).map(app => ({
          ...app,
          // Map API field names to component field names
          applicantName: app.applicantName || app.ownerName || 'N/A',
          email: app.email || app.businessEmail || 'N/A',
          phone: app.phone || app.contactNumber || 'N/A',
          planType: 'Business Tax Strategy',
          id: app._id || app.id,
          _id: app._id,
          appliedDate: app.appliedDate || app.createdAt || new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          // Add Annual Income (turnoverRange) and Expected Savings
          annualIncome: app.turnoverRange || 'N/A',
          expectedSavings: app.expectedSavings || calculateExpectedSavings(app.turnoverRange, 'business')
        }));
        allApplications = [...allApplications, ...businessApps];
      }
      setTaxApplications(allApplications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tax applications:', error);
      setTaxApplications([]);
      setLoading(false);
    }
  };
  // Stats calculations
  const stats = {
    totalApplications: taxApplications.length,
    pending: taxApplications.filter(app => app.status === 'pending').length,
    underReview: taxApplications.filter(app => app.status === 'under_review').length,
    approved: taxApplications.filter(app => app.status === 'approved').length,
    rejected: taxApplications.filter(app => app.status === 'rejected').length,
    personalTax: taxApplications.filter(app => app.planType === 'Personal Tax Planning').length,
    businessTax: taxApplications.filter(app => app.planType === 'Business Tax Strategy').length,
    totalExpectedSavings: taxApplications.reduce((sum, app) => sum + (app.expectedSavings || 0), 0)
  };
  // Filter applications
  const filteredApplications = taxApplications.filter(application => {
    const matchesSearch = 
      (application?.applicantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (application?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (application?.planType || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || application?.status === filterStatus;
    const matchesPlanType = filterPlanType === 'all' || application?.planType === filterPlanType;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'personal' && application?.planType === 'Personal Tax Planning') ||
      (activeTab === 'business' && application?.planType === 'Business Tax Strategy');
    
    return matchesSearch && matchesStatus && matchesPlanType && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      under_review: 'bg-blue-100 text-blue-700 border-blue-300',
      approved: 'bg-green-100 text-green-700 border-green-300',
      rejected: 'bg-red-100 text-red-700 border-red-300'
    };
    
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      under_review: <AlertCircle className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]} flex items-center gap-1 w-fit`}>
        {icons[status]} {status.toUpperCase().replace('_', ' ')}
      </span>
    );
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Find the application to determine its type
      const application = taxApplications.find(app => app.id === applicationId || app._id === applicationId);
      
      // Determine the correct endpoint based on planType
      let endpoint = 'personal-tax';
      if (application?.planType === 'Business Tax Strategy') {
        endpoint = 'business-tax';
      }
      
      const response = await fetch(`http://localhost:8000/api/${endpoint}/application/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setTaxApplications(prevApps =>
          prevApps.map(app =>
            app.id === applicationId || app._id === applicationId
              ? { ...app, status: newStatus }
              : app
          )
        );
        alert(data.message || `Application status updated to ${newStatus}`);
        // Refresh data to ensure latest state
        fetchApplications();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const exportData = () => {
    // Convert applications to CSV
    const headers = ['ID', 'Applicant Name', 'Email', 'Phone', 'Plan Type', 'Annual Income', 'Status', 'Applied Date'];
    const csvData = filteredApplications.map(app => [
      app.id,
      app.applicantName,
      app.email,
      app.phone,
      app.planType,
      app.annualIncome,
      app.status,
      app.appliedDate
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax_applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const downloadDocument = async (applicationId, documentName) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Try to download from backend first
      try {
        const response = await fetch(`http://localhost:8000/uploads/documents/${documentName}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = documentName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.log('Backend download failed, using mock data');
      }
      
      // Fallback: Create a mock document for demonstration
      const content = `Tax Planning Application Document\n\nApplication ID: ${applicationId}\nDocument: ${documentName}\nDate: ${new Date().toLocaleDateString()}\n\nThis is a placeholder document for demonstration purposes.\nIn production, this would be the actual uploaded document.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = windo
      w.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-green-600" />
            Tax Planning Management
          </h1>
          <p className="text-gray-600 mt-1">View and manage tax planning applications</p>
        </div>
        <button 
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-semibold text-blue-700">Total Applications</p>
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.totalApplications}</p>
          <div className="mt-2 sm:mt-3 flex gap-2 sm:gap-4 text-xs">
            <span className="text-blue-600">👤 Personal: {stats.personalTax}</span>
            <span className="text-blue-600">🏢 Business: {stats.businessTax}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-semibold text-yellow-700">Pending</p>
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-900">{stats.pending}</p>
          <p className="text-xs text-yellow-600 mt-2">Awaiting review</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 sm:p-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-semibold text-indigo-700">Under Review</p>
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-900">{stats.underReview}</p>
          <p className="text-xs text-indigo-600 mt-2">Being processed</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm font-semibold text-green-700">Approved</p>
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.approved}</p>
          <p className="text-xs text-green-600 mt-2">Successfully approved</p>
        </div>
      </div>

      {/* Plan Type Tabs */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All Applications', icon: '📋' },
            { id: 'personal', label: 'Personal Tax Planning', icon: '👤' },
            { id: 'business', label: 'Business Tax Strategy', icon: '🏢' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-1 sm:gap-2 ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <span className="text-sm sm:text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applicant, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterPlanType}
            onChange={(e) => {
              setFilterPlanType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Plans</option>
            <option value="Personal Tax Planning">Personal Tax</option>
            <option value="Business Tax Strategy">Business Tax</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden">
          {loading ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600">Loading applications...</p>
              </div>
            </div>
          ) : paginatedApplications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No applications found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedApplications.map((application) => (
                <div key={application.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">
                          {application.planType === 'Personal Tax Planning' ? '👤' : '🏢'}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{application.applicantName}</p>
                          <p className="text-xs text-gray-500">#{application.id}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{application.email}</p>
                      <p className="text-xs text-gray-500 mb-2">{application.phone}</p>
                      <div className="mb-2">{getStatusBadge(application.status)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-gray-500">Plan Type</p>
                      <p className="font-medium text-gray-900">{application.planType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Annual Income</p>
                      <p className="font-semibold text-gray-900">{formatIncomeRange(application.annualIncome)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expected Savings</p>
                      <p className="font-semibold text-green-600">{application.expectedSavings}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Applied Date</p>
                      <p className="font-medium text-gray-700">{formatDate(application.appliedDate)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => viewApplicationDetails(application)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(application.id, 'approved')}
                      disabled={application.status === 'approved'}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      disabled={application.status === 'rejected'}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Applicant Details</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Plan Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Annual Income</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Expected Savings</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Applied Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Calculator className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-gray-600">Loading applications...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedApplications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-600 font-medium">No applications found</p>
                      <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm text-gray-700">#{application.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{application.applicantName}</p>
                        <p className="text-sm text-gray-600">{application.email}</p>
                        <p className="text-xs text-gray-500">{application.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {application.planType === 'Personal Tax Planning' ? '👤' : '🏢'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{application.planType}</p>
                          <p className="text-xs text-gray-500">
                            {application.planType === 'Personal Tax Planning' 
                              ? application.taxRegime 
                              : application.businessType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatIncomeRange(application.annualIncome)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-green-600">
                        {application.expectedSavings}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{formatDate(application.appliedDate)}</span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => viewApplicationDetails(application)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(application.id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                          disabled={application.status === 'approved'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                          disabled={application.status === 'rejected'}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredApplications.length > 0 && (
          <div className="px-3 sm:px-4 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredApplications.length)}</span> of{' '}
                <span className="font-medium">{filteredApplications.length}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNumber
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div 
          className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-green-500 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center rounded-t-xl">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Applicant Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">{selectedApplication.planType === 'Personal Tax Planning' ? '👤' : '🏢'}</span>
                  Applicant Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{selectedApplication.applicantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applied Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedApplication.appliedDate)}</p>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Plan Type</p>
                    <p className="font-semibold text-gray-900">{selectedApplication.planType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Income</p>
                    <p className="font-semibold text-gray-900">{formatIncomeRange(selectedApplication.annualIncome)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected Savings</p>
                    <p className="font-semibold text-green-600">{selectedApplication.expectedSavings}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{doc}</span>
                        </div>
                        <button 
                          onClick={() => downloadDocument(selectedApplication.id, doc)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Remarks</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedApplication.remarks}</p>
                </div>
              </div>

              {/* Rejection Reason if any */}
              {selectedApplication.rejectionReason && (
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Rejection Reason</h3>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-red-700">{selectedApplication.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, 'under_review');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Move to Review
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, 'approved');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, 'rejected');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
              {selectedApplication.status === 'under_review' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, 'approved');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, 'rejected');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxPlanningManagement;
