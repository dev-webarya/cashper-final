import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Wallet, PieChart, Eye, CheckCircle, XCircle, Download, Search, Clock } from 'lucide-react';

const InvestmentManagement = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all'); // New state for investment type filter
  const [currentInvestmentPage, setCurrentInvestmentPage] = useState(1);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [modalDocuments, setModalDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [stats, setStats] = useState({
    totalAUM: '₹0',
    activeInvestors: 0,
    activeSIPs: 0,
    avgReturn: '+0%'
  });
  const [formData, setFormData] = useState({
    customer: '',
    email: '',
    phone: '',
    fundName: '',
    type: 'Mutual Funds',
    amount: '',
    totalInvested: '',
    returns: '',
    startDate: '',
    tenure: '',
    status: 'Pending',
    documents: []
  });
  const itemsPerPage = 6;

  // No mock data - all data comes from API

  useEffect(() => {
    fetchStats();
    fetchInvestments();
  }, []); // Only fetch once on mount

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/admin/investments/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStats({
          totalAUM: data.totalAUM || '₹0',
          activeInvestors: data.activeInvestors || 0,
          activeSIPs: data.totalInvestments || 0,
          avgReturn: data.avgReturn || '+0%'
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      // Fetch from both mutual funds and SIP APIs
      const [mutualFundsResponse, sipResponse] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/mutual-funds/application/all', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://127.0.0.1:8000/api/sip/application/all', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const mutualFundsData = await mutualFundsResponse.json();
      const sipData = await sipResponse.json();
      
      // Transform mutual funds data
      const mutualFundsApplications = (mutualFundsData.applications || mutualFundsData.data || []).map(app => ({
        id: app._id || app.id,
        customer: app.name || '',
        email: app.email || '',
        phone: app.phone || '',
        fundName: app.investmentType === 'sip' ? 'SIP Investment' : 'Mutual Fund',
        type: 'Mutual Funds',
        amount: app.investmentType === 'sip' ? `₹${app.sipAmount || 0}` : `₹${app.investmentAmount || 0}`,
        totalInvested: app.investmentType === 'sip' 
          ? `₹${(app.sipAmount * 12 * (app.tenure || 1) || 0).toLocaleString('en-IN')}` 
          : `₹${app.investmentAmount || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        returns: app.riskProfile === 'Low' ? '+8%' : app.riskProfile === 'Medium' ? '+10%' : '+12%',
        startDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        tenure: app.tenure ? `${app.tenure} Years` : 'N/A',
        status: app.status === 'submitted' ? 'Pending' : app.status || 'Pending',
        documents: app.documents || []
      }));

      // Transform SIP data
      const sipApplications = (sipData.applications || sipData.data || []).map(app => ({
        id: app._id || app.id,
        customer: app.name || '',
        email: app.email || '',
        phone: app.phone || '',
        fundName: 'SIP Investment',
        type: 'SIP',
        amount: `₹${app.sipAmount || 0}`,
        totalInvested: `₹${(app.sipAmount * 12 * (app.tenure || 1) || 0).toLocaleString('en-IN')}`,
        returns: '+10%',
        startDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        tenure: `${app.tenure || 0} Years`,
        status: app.status === 'submitted' ? 'Pending' : app.status || 'Pending',
        documents: app.documents || []
      }));

      // Combine both arrays
      const allInvestments = [...mutualFundsApplications, ...sipApplications];
      setInvestments(allInvestments);
      
    } catch (error) {
      console.error('Error fetching investments:', error);
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };



  // Filter investments (client-side filtering for better UX)
  const filteredInvestments = investments.filter(inv => {
    // Filter by type
    if (filterType !== 'all' && inv.type !== filterType) {
      return false;
    }
    // Filter by status
    if (filterStatus !== 'all' && inv.status !== filterStatus) {
      return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        inv.customer?.toLowerCase().includes(query) ||
        inv.email?.toLowerCase().includes(query) ||
        inv.fundName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Pagination for investments
  const totalInvestmentPages = Math.ceil(filteredInvestments.length / itemsPerPage);
  const startInvestmentIndex = (currentInvestmentPage - 1) * itemsPerPage;
  const paginatedInvestments = filteredInvestments.slice(startInvestmentIndex, startInvestmentIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-100 text-green-700 border-green-300',
      Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      Completed: 'bg-blue-100 text-blue-700 border-blue-300',
      Cancelled: 'bg-red-100 text-red-700 border-red-300'
    };
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.Active} flex items-center gap-1 w-fit`}>
        {status === 'Active' && <CheckCircle className="w-3 h-3" />}
        {status === 'Pending' && <Clock className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const viewInvestmentDetails = (investment) => {
    setSelectedInvestment(investment);
    setShowDetailsModal(true);
    // Fetch documents when opening modal
    fetchInvestmentDocuments(investment.id);
  };

  const fetchInvestmentDocuments = async (investmentId) => {
    setLoadingDocuments(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/admin/investments/${investmentId}/documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setModalDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents');
        setModalDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setModalDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleStatusUpdate = async (investmentId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/admin/investments/${investmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local state
        setInvestments(prevInv =>
          prevInv.map(inv =>
            inv.id === investmentId
              ? { ...inv, status: newStatus }
              : inv
          )
        );
        alert(data.message || `Investment status updated to ${newStatus}`);
        // Refresh data
        fetchInvestments();
        fetchStats();
      } else {
        alert(data.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files.map(f => ({
        name: f.name,
        size: f.size,
        file: f
      }))]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      
      // Create FormData to handle file uploads
      const formDataWithFiles = new FormData();
      
      // Add regular fields
      formDataWithFiles.append('customer', formData.customer);
      formDataWithFiles.append('email', formData.email);
      formDataWithFiles.append('phone', formData.phone);
      formDataWithFiles.append('fundName', formData.fundName);
      formDataWithFiles.append('type', formData.type);
      formDataWithFiles.append('amount', formData.amount.replace(/₹|,/g, '') || '0');
      formDataWithFiles.append('totalInvested', formData.totalInvested.replace(/₹|,/g, '') || '0');
      formDataWithFiles.append('returns', formData.returns);
      formDataWithFiles.append('startDate', formData.startDate);
      formDataWithFiles.append('tenure', formData.tenure);
      formDataWithFiles.append('status', formData.status);
      
      // Add files
      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach((doc, index) => {
          if (doc.file) {
            formDataWithFiles.append(`documents`, doc.file);
          }
        });
      }

      const response = await fetch('http://127.0.0.1:8000/api/admin/investments/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let the browser set it with boundary
        },
        body: formDataWithFiles
      });

      const data = await response.json();

      if (response.ok) {
        alert('Investment added successfully!');
        // Reset form
        setFormData({
          customer: '',
          email: '',
          phone: '',
          fundName: '',
          type: 'Mutual Funds',
          amount: '',
          totalInvested: '',
          returns: '',
          startDate: '',
          tenure: '',
          status: 'Pending',
          documents: []
        });
        setShowInvestmentForm(false);
        // Refresh data
        fetchInvestments();
        fetchStats();
      } else {
        alert(data.detail || 'Failed to add investment');
      }
    } catch (error) {
      console.error('Error adding investment:', error);
      alert('Error adding investment');
    }
  };

  const exportInvestmentData = () => {
    const headers = ['ID', 'Customer', 'Email', 'Phone', 'Type', 'Fund', 'Amount', 'Total Invested', 'Returns', 'Status', 'Start Date', 'Tenure'];
    const csvData = filteredInvestments.map(inv => [
      inv.id,
      inv.customer,
      inv.email,
      inv.phone,
      inv.type,
      inv.fundName,
      inv.amount,
      inv.totalInvested,
      inv.returns,
      inv.status,
      inv.startDate,
      inv.tenure
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investments_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  const downloadDocument = async (investmentId, documentName) => {
    try {
      if (!documentName) {
        alert('Document name is required');
        return;
      }
      const token = localStorage.getItem('access_token');
      
      // Extract just the filename if it's a full path
      let filename = documentName;
      if (documentName.includes('/')) {
        filename = documentName.split('/').pop();
      }
      // Use the mutual-funds document download endpoint
      const downloadUrl = `http://127.0.0.1:8000/api/mutual-funds/documents/download/${encodeURIComponent(filename)}`;
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Get the blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to download document: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document: ' + error.message);
    }
  };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Investment Management
          </h1>
          <p className="text-gray-600 mt-1">Manage Mutual Funds and SIP investments</p>
        </div>
        <button 
          onClick={exportInvestmentData}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Investment Type Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentInvestmentPage(1);
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">📋</span>
              <span className="text-sm sm:text-base">All Applications</span>
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {investments.length}
              </span>
            </button>
            <button
              onClick={() => {
                setFilterType('Mutual Funds');
                setCurrentInvestmentPage(1);
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all ${
                filterType === 'Mutual Funds'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">💰</span>
              <span className="text-sm sm:text-base">Mutual Funds</span>
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {investments.filter(inv => inv.type === 'Mutual Funds').length}
              </span>
            </button>
            <button
              onClick={() => {
                setFilterType('SIP');
                setCurrentInvestmentPage(1);
              }}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-all ${
                filterType === 'SIP'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">📈</span>
              <span className="text-sm sm:text-base">SIP</span>
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {investments.filter(inv => inv.type === 'SIP').length}
              </span>
            </button>
          </div>
          
          <button 
            onClick={() => setShowInvestmentForm(!showInvestmentForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md text-sm sm:text-base"
          >
            <span>➕</span>
            Add Investment
          </button>
        </div>
      </div>
      {/* Investment Form */}
      {showInvestmentForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Investment</h2>
            <button 
              onClick={() => setShowInvestmentForm(false)}
              className="text-gray-600 hover:text-red-600 text-2xl"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="customer"
                  placeholder="Customer Name *"
                  value={formData.customer}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
            {/* Investment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fundName"
                  placeholder="Fund Name *"
                  value={formData.fundName}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="SIP">SIP</option>
                </select>
                <input
                  type="text"
                  name="amount"
                  placeholder="Monthly Amount (₹) *"
                  value={formData.amount}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="text"
                  name="totalInvested"
                  placeholder="Total Invested (₹) *"
                  value={formData.totalInvested}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="text"
                  name="returns"
                  placeholder="Returns (e.g., +12.5%)"
                  value={formData.returns}
                  onChange={handleFormChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  required
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <input
                  type="text"
                  name="tenure"
                  placeholder="Tenure (e.g., 5 years)"
                  value={formData.tenure}
                  onChange={handleFormChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {/* Document Upload Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="docUpload"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="docUpload" className="flex items-center justify-center cursor-pointer">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PDF, JPG, PNG (max 5MB each)</p>
                  </div>
                </label>
              </div>
              {/* Uploaded Documents List */}
              {formData.documents && formData.documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Uploaded Files ({formData.documents.length})</h4>
                  <div className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 flex-1">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Form Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowInvestmentForm(false)}
                className="px-6 py-2.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold"
              >
                Add Investment
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search investor, email, fund..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentInvestmentPage(1);
              }}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentInvestmentPage(1);
            }}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      {/* Investment Portfolio - Flex Column Layout */}
      <div className="flex flex-col gap-6">
        {/* Recent Investments */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">Recent Investments</h2>
            <p className="text-sm text-gray-600">Showing {paginatedInvestments.length} of {filteredInvestments.length} investments</p>
          </div>
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {loading ? (
              <div className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600">Loading investments...</p>
                </div>
              </div>
            ) : paginatedInvestments.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Wallet className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">No investments found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {paginatedInvestments.map((investment) => (
                  <div key={investment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {investment.customer.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{investment.customer}</p>
                          <p className="text-xs text-gray-500">#{investment.id}</p>
                        </div>
                      </div>
                      <div>{getStatusBadge(investment.status)}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                      <div>
                        <p className="text-gray-500">Fund Name</p>
                        <p className="font-medium text-gray-900">{investment.fundName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Monthly Amount</p>
                        <p className="font-semibold text-gray-900">{investment.amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Invested</p>
                        <p className="font-semibold text-gray-900">{investment.totalInvested}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Returns</p>
                        <p className="font-semibold text-green-600">{investment.returns}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => viewInvestmentDetails(investment)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(investment.id, 'Active')}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        disabled={investment.status === 'Active'}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(investment.id, 'Cancelled')}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        disabled={investment.status === 'Cancelled'}
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
              <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fund Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount/Month</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Total Invested</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Returns</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                        <p className="text-gray-600">Loading investments...</p>
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvestments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Wallet className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-600 font-medium">No investments found</p>
                        <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvestments.map((investment) => (
                    <tr key={investment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm text-gray-700">#{investment.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {investment.customer.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{investment.customer}</p>
                            <p className="text-sm text-gray-600">{investment.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{investment.fundName}</p>
                        <p className="text-xs text-gray-500">{investment.type}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">{investment.amount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">{investment.totalInvested}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-green-600">{investment.returns}</span>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(investment.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => viewInvestmentDetails(investment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(investment.id, 'Active')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                            disabled={investment.status === 'Active'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(investment.id, 'Cancelled')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                            disabled={investment.status === 'Cancelled'}
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
          {/* Pagination for Investments */}
          {filteredInvestments.length > 0 && (
            <div className="px-3 sm:px-4 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Showing <span className="font-medium">{startInvestmentIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startInvestmentIndex + itemsPerPage, filteredInvestments.length)}</span> of{' '}
                  <span className="font-medium">{filteredInvestments.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentInvestmentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentInvestmentPage === 1}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  <div className="flex gap-1">
                    {[...Array(Math.min(totalInvestmentPages, 5))].map((_, index) => {
                      let pageNumber;
                      if (totalInvestmentPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentInvestmentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentInvestmentPage >= totalInvestmentPages - 2) {
                        pageNumber = totalInvestmentPages - 4 + index;
                      } else {
                        pageNumber = currentInvestmentPage - 2 + index;
                      }
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentInvestmentPage(pageNumber)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                            currentInvestmentPage === pageNumber
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentInvestmentPage(prev => Math.min(prev + 1, totalInvestmentPages))}
                    disabled={currentInvestmentPage === totalInvestmentPages}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Investment Details Modal */}
      {showDetailsModal && selectedInvestment && (
        <>
          {/* Backdrop overlay - transparent to show page behind */}
          <div 
            className="fixed inset-0 bg-transparent z-40 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            {/* Modal Container */}
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border-2 border-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold">Investment Details</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-60px)]">
                {/* Customer Information */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Name</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedInvestment.status)}</div>
                    </div>
                  </div>
                </div>
                {/* Investment Details */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Investment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600">Fund Name</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.fundName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Investment Type</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Monthly Amount</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Invested</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.totalInvested}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Returns</p>
                      <p className="font-semibold text-green-600 text-base">{selectedInvestment.returns}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Start Date</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tenure</p>
                      <p className="font-semibold text-sm text-gray-900">{selectedInvestment.tenure}</p>
                    </div>
                  </div>
                </div>
                {/* Documents */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Uploaded Documents
                  </h3>
                  {loadingDocuments ? (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Loading documents...</p>
                    </div>
                  ) : modalDocuments && modalDocuments.length > 0 ? (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="space-y-2">
                        {modalDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-900">{doc.name || doc.filename || 'Document'}</p>
                                <p className="text-xs text-gray-500">{doc.size || ''}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => downloadDocument(selectedInvestment.id, doc.filename || doc.name)}
                              className="text-blue-600 hover:text-blue-700 hover:underline text-xs font-medium transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-xs text-gray-500">No documents uploaded yet</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedInvestment.id, 'Active');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedInvestment.status === 'Active'}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      handleStatusUpdate(selectedInvestment.id, 'Cancelled');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedInvestment.status === 'Cancelled'}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvestmentManagement;
