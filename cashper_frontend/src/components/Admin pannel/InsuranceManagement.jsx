import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Download, Plus, Eye, Edit, Trash2, Phone, Mail, Calendar, AlertCircle, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const InsuranceManagement = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [policies, setPolicies] = useState([]);
  const [statistics, setStatistics] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    pendingPolicies: 0,
    expiredPolicies: 0,
    totalClaims: 0,
    premiumCollected: '₹0',
  });
  
  // Pagination states
  const [policiesCurrentPage, setPoliciesCurrentPage] = useState(1);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const itemsPerPage = 6;

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/insurance-management/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch policies with filters
  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      params.append('skip', (policiesCurrentPage - 1) * itemsPerPage);
      params.append('limit', itemsPerPage);

      const response = await fetch(`${API_BASE_URL}/admin/insurance-management/policies?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies);
        setTotalPolicies(data.total);
      } else {
        setError('Failed to fetch policies');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [filterType, filterStatus, searchTerm, policiesCurrentPage]);

  // Handler Functions
  const handleViewDetails = (policy) => {
    setSelectedPolicy(policy);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = async (policyId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/insurance-management/policies/${policyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: `Status updated to ${newStatus} by admin`
        })
      });

      if (response.ok) {
        alert(`Policy status updated to ${newStatus}`);
        // Refresh the policies list
        fetchPolicies();
        fetchStatistics();
      } else {
        alert('Failed to update policy status');
      }
    } catch (error) {
      console.error('Error updating policy status:', error);
      alert('Error updating policy status');
    }
  };

  const downloadDocument = async (policyId, documentPath) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Encode the document path for URL (handle slashes in path)
      const encodedPath = encodeURIComponent(documentPath);
      
      // Use the proper backend endpoint for document download
      // Endpoint: /admin/insurance-management/documents/download/{policy_id}/{document_path}
      const downloadUrl = `${API_BASE_URL}/admin/insurance-management/documents/download/${policyId}/${encodedPath}`;
      
      console.log('Downloading from:', downloadUrl);
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Extract filename from path
        const filename = documentPath.split('\\').pop().split('/').pop();
        a.href = url;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('File downloaded successfully');
      } else if (response.status === 404) {
        const error = await response.json().catch(() => ({}));
        console.error('Download error:', error);
        alert('Document not found on server. Please ensure the file has been uploaded correctly.');
      } else {
        const error = await response.text();
        console.error('Server error:', error);
        alert(`Failed to download document: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please check console for details.');
    }
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`${API_BASE_URL}/admin/insurance-management/policies/export/csv?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        const policies = data.policies;
        
        const headers = ['ID', 'Customer', 'Type', 'Premium', 'Coverage', 'Status', 'Start Date', 'End Date'];
        const csvData = [
          headers.join(','),
          ...policies.map(p => [
            p.id || p.policyId,
            p.customer,
            p.type,
            p.premium,
            p.coverage,
            p.status,
            p.startDate,
            p.endDate
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'insurance-policies.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export policies');
      }
    } catch (error) {
      console.error('Error exporting policies:', error);
      alert('Error exporting policies');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalPages = Math.ceil(totalPolicies / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Insurance Management</h1>
          <p className="text-gray-600 mt-1">Manage insurance policies and claims</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-lg transition-all duration-300"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by customer name, policy ID, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPoliciesCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPoliciesCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">Total Policies</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{statistics.totalPolicies.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">Active Policies</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{statistics.activePolicies.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold">Total Claims</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{statistics.totalClaims}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-semibold">Premium Collected</p>
              <p className="text-3xl font-bold text-indigo-900 mt-2">{statistics.premiumCollected}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'Term Insurance', 'Health Insurance', 'Motor Insurance'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setPoliciesCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 capitalize ${
                filterType === type
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Insurance Policies - Table Format */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Insurance Policies</h2>
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `Showing ${policies.length} of ${totalPolicies} policies`}
          </p>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && policies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No policies found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          </div>
        )}

        {/* Mobile Card View */}
        {!loading && policies.length > 0 && (
          <div className="block lg:hidden">
            <div className="divide-y divide-gray-200">
              {policies.map((policy) => (
                <div key={policy.id || policy.policyId} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {policy.customer.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{policy.customer}</p>
                        <p className="text-xs text-gray-500">#{policy.id || policy.policyId}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(policy.status)}`}>
                      {policy.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium text-gray-900">{policy.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Premium</p>
                      <p className="font-semibold text-gray-900">{policy.premium}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Coverage</p>
                      <p className="font-semibold text-gray-900">{policy.coverage}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valid Till</p>
                      <p className="font-medium text-gray-700">{policy.endDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => handleViewDetails(policy)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(policy.id || policy.policyId, 'Active')}
                      disabled={policy.status === 'Active'}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(policy.id || policy.policyId, 'Expired')}
                      disabled={policy.status === 'Expired'}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Table View */}
        {!loading && policies.length > 0 && (
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Premium</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Coverage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Valid Till</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {policies.map((policy) => (
                  <tr key={policy.id || policy.policyId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm text-gray-700">#{policy.id || policy.policyId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {policy.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{policy.customer}</p>
                          <p className="text-sm text-gray-600">{policy.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">{policy.type}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-gray-900">{policy.premium}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-gray-900">{policy.coverage}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">{policy.endDate}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(policy)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(policy.id || policy.policyId, 'Active')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                          disabled={policy.status === 'Active'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(policy.id || policy.policyId, 'Expired')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                          disabled={policy.status === 'Expired'}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls for Policies */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((policiesCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(policiesCurrentPage * itemsPerPage, totalPolicies)} of {totalPolicies} policies
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPoliciesCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={policiesCurrentPage === 1}
                className={`p-2 rounded-lg font-semibold transition-all duration-300 ${
                  policiesCurrentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transform hover:scale-105'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= policiesCurrentPage - 1 && pageNum <= policiesCurrentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPoliciesCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                          policiesCurrentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-110'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === policiesCurrentPage - 2 ||
                    pageNum === policiesCurrentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setPoliciesCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={policiesCurrentPage === totalPages}
                className={`p-2 rounded-lg font-semibold transition-all duration-300 ${
                  policiesCurrentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transform hover:scale-105'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy Details Modal */}
      {showDetailsModal && selectedPolicy && (
        <div 
          className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-500 w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center rounded-t-xl">
              <h2 className="text-2xl font-bold">Policy Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPolicy.status)}`}>
                      {selectedPolicy.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Policy Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Policy Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Policy ID</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.id || selectedPolicy.policyId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Insurance Type</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Premium</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.premium}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coverage</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.coverage}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nominee</p>
                    <p className="font-semibold text-gray-900">{selectedPolicy.nominee}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedPolicy.documents && selectedPolicy.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {selectedPolicy.documents.map((doc, index) => {
                        // Handle both string document paths and object documents
                        const docPath = typeof doc === 'string' ? doc : (doc.name || doc.filename || 'Unknown');
                        const docName = docPath.split('\\').pop().split('/').pop(); // Extract filename from path
                        return (
                          <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 break-all">{docName}</span>
                                <span className="text-xs text-gray-500 block">{docPath}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => downloadDocument(selectedPolicy.id || selectedPolicy.policyId, docPath)}
                              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ml-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {(!selectedPolicy.documents || selectedPolicy.documents.length === 0) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600">
                    <p>No documents uploaded for this policy</p>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedPolicy.id || selectedPolicy.policyId, 'Active');
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedPolicy.status === 'Active'}
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedPolicy.id || selectedPolicy.policyId, 'Expired');
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedPolicy.status === 'Expired'}
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceManagement;
