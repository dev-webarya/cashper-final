import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, DollarSign, Calendar, User, Phone, Mail, TrendingUp, FileText, ChevronLeft, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import { getStatistics, getAllApplications, updateStatus, deleteApplication } from '../../services/adminLoanManagementApi';

const LoanManagement = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLoanType, setFilterLoanType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // New state for API data and loading
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLoans, setTotalLoans] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Document viewer modal states
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentList, setDocumentList] = useState([]);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [viewerLoanId, setViewerLoanId] = useState(null);

  // API Endpoints
  const API_ENDPOINTS = {
    shortTerm: {
      applications: 'http://127.0.0.1:8000/api/short-term-loan/applications',
      documents: 'http://127.0.0.1:8000/api/short-term-loan/upload-document'
    },
    home: {
      applications: 'http://127.0.0.1:8000/api/home-loan/applications',
      documents: 'http://127.0.0.1:8000/api/home-loan/upload-document'
    },
    business: {
      applications: 'http://127.0.0.1:8000/api/business-loan/applications',
      documents: 'http://127.0.0.1:8000/api/business-loan/upload-document'
    },
    personal: {
      applications: 'http://127.0.0.1:8000/api/personal-loan/applications',
      documents: 'http://127.0.0.1:8000/api/personal-loan/upload-document'
    }
  };
  
  const [statistics, setStatistics] = useState({
    totalPending: 0,
    totalUnderReview: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalDisbursed: 0,
    homeLoanCount: 0,
    personalLoanCount: 0,
    businessLoanCount: 0,
    shortTermLoanCount: 0
  });

  // Load document image with authentication
  useEffect(() => {
    if (!selectedDocument || !isImage(selectedDocument)) {
      setImageDataUrl(null);
      return;
    }

    const loadDocumentImage = async () => {
      try {
        setImageLoading(true);
        const token = localStorage.getItem('access_token');
        const fileName = selectedDocument.split('/').pop();
        const url = `http://localhost:8000/api/admin/loan-management/download-document/documents/${fileName}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const blob = await response.blob();
          const dataUrl = URL.createObjectURL(blob);
          setImageDataUrl(dataUrl);
        } else {
          console.error('Failed to load image:', response.status);
          setImageDataUrl(null);
        }
      } catch (error) {
        console.error('Error loading document image:', error);
        setImageDataUrl(null);
      } finally {
        setImageLoading(false);
      }
    };

    loadDocumentImage();

    // Cleanup
    return () => {
      if (imageDataUrl && imageDataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageDataUrl);
      }
    };
  }, [selectedDocument]);

  // Fetch all loan applications from admin endpoint
  const fetchAllLoanApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Build query params for filtering
      let queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        // Add timestamp to prevent caching
        _t: new Date().getTime().toString()
      });
      
      if (filterStatus && filterStatus !== 'all') {
        queryParams.append('status', filterStatus);
      }
      
      if (filterLoanType && filterLoanType !== 'all') {
        queryParams.append('loan_type', filterLoanType);
      }
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      const response = await fetch(`http://127.0.0.1:8000/api/admin/loan-management/applications?${queryParams}`, {
        headers,
        // Force fresh data - no caching
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch loans: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate data - ensure we're getting expected admin applications, not short-term loans
      let allLoans = data.applications || [];
      
      // Filter out any short-term loans that might have been mixed in
      // (Sudha Yadav with massive amounts are typically short-term)
      allLoans = allLoans.filter(loan => {
        // Check if this looks like a legit admin loan (has required fields from admin collection)
        const hasAdminFields = loan.customer && loan.email && (loan.type || loan.loan_type);
        // Filter out suspicious entries with extreme loan amounts without proper structure
        const isSuspicious = loan.loanAmount && parseFloat(loan.loanAmount) > 100000000 && !loan.id;
        return hasAdminFields && !isSuspicious;
      });
      
      // Transform API data to match UI format
      const transformedApps = allLoans.map(loan => {
        // Map loan type to key for internal use
        const typeKeyMap = {
          'Personal Loan': 'personal',
          'Personal': 'personal',
          'Home Loan': 'home',
          'Home': 'home',
          'Business Loan': 'business',
          'Business': 'business',
          'Short-term Loan': 'short-term',
          'Short Term': 'short-term',
          'short-term': 'short-term'
        };
        
        return {
          id: loan.id || loan._id,
          applicationId: loan.id || loan._id,
          customer: loan.customer || 'Unknown',
          email: loan.email || '',
          phone: loan.phone || '',
          type: loan.type || 'Personal Loan',
          loanTypeKey: typeKeyMap[loan.type] || 'personal',
          amount: typeof loan.amount === 'string' ? loan.amount : `₹${parseFloat(loan.amount || 0).toLocaleString()}`,
          status: loan.status || 'Pending',
          appliedDate: loan.appliedDate || 'N/A',
          tenure: loan.tenure || 'N/A',
          interestRate: loan.interestRate || '8.5%',
          purpose: loan.purpose || 'N/A',
          income: loan.income || 'N/A',
          cibilScore: loan.cibilScore || 750,
          documents: loan.documents || [],
          rejectionReason: loan.rejectionReason || null
        };
      });
      
      setLoans(transformedApps);
      setTotalLoans(data.total || 0);
      setTotalPages(data.totalPages || 1);
      
    } catch (err) {
      console.error('Error loading loans:', err);
      setError('Failed to load loan applications. Please try again.');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics from backend
  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('http://127.0.0.1:8000/api/admin/loan-management/statistics', {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status}`);
      }
      
      const stats = await response.json();
      
      setStatistics({
        totalPending: stats.pendingApplications || stats.totalPending || 0,
        totalUnderReview: stats.underReviewApplications || stats.totalUnderReview || 0,
        totalApproved: stats.approvedApplications || stats.totalApproved || 0,
        totalRejected: stats.rejectedApplications || stats.totalRejected || 0,
        totalDisbursed: stats.disbursedApplications || stats.totalDisbursed || 0,
        homeLoanCount: stats.homeLoanCount || 0,
        personalLoanCount: stats.personalLoanCount || 0,
        businessLoanCount: stats.businessLoanCount || 0,
        shortTermLoanCount: stats.shortTermLoanCount || 0
      });
    } catch (err) {
      console.error('Error loading statistics:', err);
      // Set default values if fetch fails
      setStatistics({
        totalPending: 0,
        totalUnderReview: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalDisbursed: 0,
        homeLoanCount: 0,
        personalLoanCount: 0,
        businessLoanCount: 0,
        shortTermLoanCount: 0
      });
    }
  };

  // Load initial data
  useEffect(() => {
    fetchAllLoanApplications();
    loadStatistics();
  }, []);

  // Reload data when page changes
  useEffect(() => {
    fetchAllLoanApplications();
  }, [currentPage]);

  // Reset to page 1 and reload when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterLoanType, searchTerm]);

  // Reload loans when filters change (but after currentPage is reset)
  useEffect(() => {
    if (currentPage === 1) {
      fetchAllLoanApplications();
    }
  }, [filterStatus, filterLoanType, searchTerm]);

  // Refresh data function
  const refreshData = async () => {
    await fetchAllLoanApplications();
    await loadStatistics();
  };

  // Legacy function for backward compatibility
  const loadLoansData = async () => {
    await fetchAllLoanApplications();
  };

  // Filter and search logic
  const filteredLoans = loans;

  // Pagination logic - already handled by API
  const paginatedLoans = filteredLoans;

  // Download document function
  const downloadDocument = async (loanId, documentName) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // documentName should be the file path from the database like "/uploads/documents/abc123.pdf"
      // or just the filename like "bank.pdf"
      
      let downloadUrl;
      let fileName = documentName;
      
      if (documentName.startsWith('/uploads/')) {
        // It's a full path - use the new download endpoint
        // Extract just the path part after /uploads/
        const pathPart = documentName.substring(1); // Remove leading /
        downloadUrl = `http://localhost:8000/api/admin/loan-management/download-document/${pathPart}`;
        fileName = documentName.split('/').pop(); // Get just the filename
      } else if (documentName.startsWith('http')) {
        // It's already a full URL
        downloadUrl = documentName;
      } else {
        // Just a filename - try the new download endpoint with documents path
        downloadUrl = `http://localhost:8000/api/admin/loan-management/download-document/documents/${documentName}`;
        fileName = documentName;
      }
      
      const response = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return;
      } else if (response.status === 404) {
        console.warn('Document not found at path, trying alternate locations');
        // Try alternate path construction
        const altUrl = `http://localhost:8000/uploads/documents/${documentName.split('/').pop()}`;
        const altResponse = await fetch(altUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (altResponse.ok) {
          const blob = await altResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          return;
        }
      }
      
      // If we get here, download failed
      alert('❌ Failed to download document. Please check the file path and try again.');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('❌ Failed to download document. Please try again.');
    }
  };

  // Open document viewer modal
  const handleViewDocument = (documents, documentName, loanId = null) => {
    if (!documents || documents.length === 0) {
      alert('No documents available');
      return;
    }
    
    setDocumentList(documents);
    const index = documents.indexOf(documentName);
    setCurrentDocumentIndex(index >= 0 ? index : 0);
    setSelectedDocument(documents[index >= 0 ? index : 0]);
    setViewerLoanId(loanId || selectedLoan?.id || null);
    setShowDocumentViewer(true);
  };

  // Navigate to next document
  const nextDocument = () => {
    if (currentDocumentIndex < documentList.length - 1) {
      const nextIndex = currentDocumentIndex + 1;
      setCurrentDocumentIndex(nextIndex);
      setSelectedDocument(documentList[nextIndex]);
    }
  };

  // Navigate to previous document
  const previousDocument = () => {
    if (currentDocumentIndex > 0) {
      const prevIndex = currentDocumentIndex - 1;
      setCurrentDocumentIndex(prevIndex);
      setSelectedDocument(documentList[prevIndex]);
    }
  };

  // Get document preview URL
  const getDocumentPreviewUrl = (documentName) => {
    // Construct URL for the document using API endpoint
    // Extract just the filename if it contains path
    const fileName = documentName.split('/').pop();
    return `http://localhost:8000/api/admin/loan-management/download-document/documents/${fileName}`;
  };

  // Check if document is an image
  const isImage = (documentName) => {
    if (!documentName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => documentName.toLowerCase().endsWith(ext));
  };

  // Check if document is a PDF
  const isPDF = (documentName) => {
    if (!documentName) return false;
    return documentName.toLowerCase().endsWith('.pdf');
  };

  // Handler functions
  const updateLoanStatusAsync = async (loanId, loanTypeKey, newStatus, rejectionReason = null) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Build correct endpoint based on loan type
      const endpoints = {
        'personal': 'http://127.0.0.1:8000/api/personal-loan/applications',
        'home': 'http://127.0.0.1:8000/api/home-loan/applications',
        'business': 'http://127.0.0.1:8000/api/business-loan/applications',
        'short-term': 'http://127.0.0.1:8000/api/short-term-loan/applications'
      };
      
      const baseUrl = endpoints[loanTypeKey];
      if (!baseUrl) {
        throw new Error(`Invalid loan type: ${loanTypeKey}`);
      }
      
      const updateUrl = `${baseUrl}/${loanId}/status`;
      
      const statusData = {
        status: newStatus.toLowerCase()
      };
      
      if (newStatus.toLowerCase() === 'rejected' && rejectionReason) {
        statusData.rejectionReason = rejectionReason;
      }
      
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating loan status:', error);
      throw error;
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      // Check if we're in modal or table view
      const loan = selectedLoan || loans.find(l => l.id === loanId);
      
      if (!loan) {
        alert('Error: Loan not found');
        return;
      }

      if (!loan.loanTypeKey) {
        alert('Error: Loan type information not available');
        return;
      }

      if (window.confirm(`Are you sure you want to approve this loan? (${loanId})`)) {
        const result = await updateLoanStatusAsync(loanId, loan.loanTypeKey, 'Approved');
        alert(`✅ Loan ${loanId} has been approved successfully!`);
        
        // Refresh data
        await fetchAllLoanApplications();
        await loadStatistics();
        
        // Close modal if open
        if (showLoanDetails) {
          setShowLoanDetails(false);
        }
      }
    } catch (err) {
      console.error('Error approving loan:', err);
      alert(`❌ Error approving loan: ${err.message}`);
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      // Check if we're in modal or table view
      const loan = selectedLoan || loans.find(l => l.id === loanId);
      
      if (!loan) {
        alert('Error: Loan not found');
        return;
      }

      if (!loan.loanTypeKey) {
        alert('Error: Loan type information not available');
        return;
      }

      const reason = prompt('Please enter rejection reason:');
      if (!reason || reason.trim() === '') {
        alert('❌ Rejection reason is required');
        return;
      }
      
      if (window.confirm(`Are you sure you want to reject this loan? (${loanId})`)) {
        const result = await updateLoanStatusAsync(loanId, loan.loanTypeKey, 'Rejected', reason);
        alert(`❌ Loan ${loanId} has been rejected!`);
        
        // Refresh data
        await fetchAllLoanApplications();
        await loadStatistics();
        
        // Close modal if open
        if (showLoanDetails) {
          setShowLoanDetails(false);
        }
      }
    } catch (err) {
      console.error('Error rejecting loan:', err);
      alert(`❌ Error rejecting loan: ${err.message}`);
    }
  };

  const handleUnderReview = async (loanId) => {
    try {
      // Check if we're in modal or table view
      const loan = selectedLoan || loans.find(l => l.id === loanId);
      
      if (!loan) {
        alert('Error: Loan not found');
        return;
      }

      if (!loan.loanTypeKey) {
        alert('Error: Loan type information not available');
        return;
      }

      if (window.confirm(`Are you sure you want to move this loan to review? (${loanId})`)) {
        const result = await updateLoanStatusAsync(loanId, loan.loanTypeKey, 'Under Review');
        alert(`📋 Loan ${loanId} is now under review.`);
        
        // Refresh data
        await fetchAllLoanApplications();
        await loadStatistics();
        
        // Close modal if open
        if (showLoanDetails) {
          setShowLoanDetails(false);
        }
      }
    } catch (err) {
      console.error('Error updating loan:', err);
      alert(`❌ Error updating loan: ${err.message}`);
    }
  };

  const handleDisburse = async (loanId) => {
    try {
      // Check if we're in modal or table view
      const loan = selectedLoan || loans.find(l => l.id === loanId);
      
      if (!loan) {
        alert('Error: Loan not found');
        return;
      }

      if (!loan.loanTypeKey) {
        alert('Error: Loan type information not available');
        return;
      }

      if (window.confirm(`Are you sure you want to disburse this loan? (${loanId})`)) {
        const result = await updateLoanStatusAsync(loanId, loan.loanTypeKey, 'Disbursed');
        alert(`💰 Loan ${loanId} has been disbursed successfully!`);
        
        // Refresh data
        await fetchAllLoanApplications();
        await loadStatistics();
        
        // Close modal if open
        if (showLoanDetails) {
          setShowLoanDetails(false);
        }
      }
    } catch (err) {
      console.error('Error disbursing loan:', err);
      alert(`❌ Error disbursing loan: ${err.message}`);
    }
  };

  const exportToCSV = async () => {
    try {
      // Prepare current filter data for export
      const exportData = loans.map(loan => ({
        'ID': loan.id || '',
        'Customer': loan.customer || '',
        'Type': loan.type || '',
        'Amount': loan.amount || '',
        'Status': loan.status || '',
        'Applied Date': loan.appliedDate || '',
        'Tenure': loan.tenure || '',
        'Interest Rate': loan.interestRate || ''
      }));
      
      // Create CSV content
      const headers = Object.keys(exportData[0]);
      const csvData = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => {
          const value = row[header];
          // Escape quotes and handle commas
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(','))
      ].join('\n');
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loan-applications-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
    setShowLoanDetails(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Under Review':
        return 'bg-blue-100 text-blue-700';
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Disbursed':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-lg ${showLoanDetails ? 'overflow-hidden' : ''}`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Review and manage all loan applications (Total: {totalLoans})</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
            title="Refresh data"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm sm:text-base hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Export</span>
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-xs sm:text-sm font-semibold">Pending</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-900 mt-1 sm:mt-2">{statistics.totalPending}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs sm:text-sm font-semibold">Under Review</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900 mt-1 sm:mt-2">{statistics.totalUnderReview}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 md:p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-xs sm:text-sm font-semibold">Approved</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900 mt-1 sm:mt-2">{statistics.totalApproved}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 md:p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-xs sm:text-sm font-semibold">Rejected</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-900 mt-1 sm:mt-2">{statistics.totalRejected}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 md:p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-xs sm:text-sm font-semibold">Disbursed</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-900 mt-1 sm:mt-2">{statistics.totalDisbursed}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Type Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-xs sm:text-sm font-semibold">🏠 Home Loans</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-orange-900 mt-1">{statistics.homeLoanCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-600 text-xs sm:text-sm font-semibold">👤 Personal Loans</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-cyan-900 mt-1">{statistics.personalLoanCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-xs sm:text-sm font-semibold">💼 Business Loans</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-indigo-900 mt-1">{statistics.businessLoanCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-600 text-xs sm:text-sm font-semibold">⚡ Short-term Loans</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-pink-900 mt-1">{statistics.shortTermLoanCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
            type="text"
            placeholder="Search by customer name, loan ID, or type..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Status Filters */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by Status</h4>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'under review', 'approved', 'rejected', 'disbursed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-300 capitalize ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Loan Type Filters */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter by Loan Type</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Types', icon: '📊' },
                { key: 'home', label: `Home Loans (${statistics.homeLoanCount})`, icon: '🏠' },
                { key: 'personal', label: `Personal Loans (${statistics.personalLoanCount})`, icon: '👤' },
                { key: 'business', label: `Business Loans (${statistics.businessLoanCount})`, icon: '💼' },
                { key: 'short-term', label: `Short-term Loans (${statistics.shortTermLoanCount})`, icon: '⚡' }
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setFilterLoanType(type.key)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-300 ${
                    filterLoanType === type.key
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {(filterStatus !== 'all' || filterLoanType !== 'all' || searchTerm) && (
            <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
              Showing <span className="font-semibold">{loans.length}</span> application(s) 
              {filterStatus !== 'all' && ` with status "${filterStatus}"`}
              {filterLoanType !== 'all' && ` and loan type "${filterLoanType}"`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>
      </div>
      {/* Loans Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="w-8 h-8 animate-spin text-green-600 mr-3" />
            <p className="text-gray-600">Loading loan applications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={fetchAllLoanApplications}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Retry
            </button>
          </div>
        ) : paginatedLoans.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No loan applications found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loan ID</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Applied Date</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">{loan.id}</p>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                            {loan.customer?.charAt(0) || 'L'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{loan.customer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{loan.type}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                        <p className="text-xs sm:text-sm font-bold text-gray-900">{loan.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">{loan.appliedDate}</td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 md:py-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleViewLoan(loan)}
                            className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            title="View Details"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              handleApproveLoan(loan.id);
                            }}
                            className="p-1.5 sm:p-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            title="Approve"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              handleRejectLoan(loan.id);
                            }}
                            className="p-1.5 sm:p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            title="Reject"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {/* Pagination Controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs sm:text-sm text-gray-700">
                <span className="font-semibold">Page {currentPage}</span> of <span className="font-semibold">{totalPages}</span> 
                (Showing <span className="font-semibold">{paginatedLoans.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalLoans)}</span> of{' '}
                <span className="font-semibold">{totalLoans}</span> total)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow hover:shadow-lg'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 inline sm:mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow hover:shadow-lg'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4 inline sm:ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loan Details Modal */}
      {showLoanDetails && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="bg-white  shadow-2xl max-w-2xl w-full max-h-[80vh] border-2 border-green-600 border-opacity-50 flex flex-col">
            <div className={`px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 shadow-md ${
              selectedLoan.status === 'Approved' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
              selectedLoan.status === 'Rejected' ? 'bg-gradient-to-r from-red-600 to-red-700' :
              selectedLoan.status === 'Disbursed' ? 'bg-gradient-to-r from-purple-600 to-purple-700' :
              selectedLoan.status === 'Under Review' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
              'bg-gradient-to-r from-yellow-600 to-yellow-700'
            } flex-shrink-0`}>
              <div className="min-w-0 flex-1 mr-2">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Loan Application Details</h3>
                <p className="text-xs sm:text-sm text-green-100">{selectedLoan.id}</p>
              </div>
              <button
                onClick={() => setShowLoanDetails(false)}
                className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              {/* Customer Info */}
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Name</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{selectedLoan.customer}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Email</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{selectedLoan.email}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Phone</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedLoan.phone}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Monthly Income</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedLoan.income}</p>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Loan Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg border border-green-200">
                    <p className="text-green-600 text-xs sm:text-sm font-semibold">Loan Amount</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-900 mt-1">{selectedLoan.amount}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-600 text-xs sm:text-sm font-semibold">Loan Type</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-900 mt-1">{selectedLoan.type}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 rounded-lg border border-indigo-200">
                    <p className="text-indigo-600 text-xs sm:text-sm font-semibold">Tenure</p>
                    <p className="text-lg sm:text-xl font-bold text-indigo-900 mt-1">{selectedLoan.tenure}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg border border-purple-200">
                    <p className="text-purple-600 text-xs sm:text-sm font-semibold">Interest Rate</p>
                    <p className="text-lg sm:text-xl font-bold text-purple-900 mt-1">{selectedLoan.interestRate}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Applied Date</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedLoan.appliedDate}</p>
                  </div>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Purpose</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedLoan.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Uploaded Documents</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {selectedLoan.documents && selectedLoan.documents.length > 0 ? (
                      selectedLoan.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 break-all">{doc}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button 
                              onClick={() => handleViewDocument(selectedLoan.documents, doc, selectedLoan.id)}
                              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                            <button 
                              onClick={() => downloadDocument(selectedLoan.id, doc)}
                              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                              title="Download Document"
                            >
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">Download</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No documents uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Reason if any */}
              {selectedLoan.rejectionReason && (
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-red-900 mb-3">Rejection Reason</h4>
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-red-700 text-sm">{selectedLoan.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Current Status</h4>
                <div className={`p-4 rounded-lg border-2 ${
                  selectedLoan.status === 'Approved' ? 'bg-green-50 border-green-200' :
                  selectedLoan.status === 'Rejected' ? 'bg-red-50 border-red-200' :
                  selectedLoan.status === 'Disbursed' ? 'bg-purple-50 border-purple-200' :
                  selectedLoan.status === 'Under Review' ? 'bg-blue-50 border-blue-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedLoan.status)}`}>
                    {selectedLoan.status === 'Approved' && <CheckCircle className="w-5 h-5" />}
                    {selectedLoan.status === 'Rejected' && <XCircle className="w-5 h-5" />}
                    {selectedLoan.status === 'Under Review' && <AlertCircle className="w-5 h-5" />}
                    {selectedLoan.status === 'Pending' && <Clock className="w-5 h-5" />}
                    {selectedLoan.status === 'Disbursed' && <CheckCircle className="w-5 h-5" />}
                    {selectedLoan.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t flex-shrink-0">
                {selectedLoan.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => handleUnderReview(selectedLoan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Move to Review
                    </button>
                    <button 
                      onClick={() => handleApproveLoan(selectedLoan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectLoan(selectedLoan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
                {selectedLoan.status === 'Under Review' && (
                  <>
                    <button 
                      onClick={() => handleApproveLoan(selectedLoan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Loan
                    </button>
                    <button 
                      onClick={() => handleRejectLoan(selectedLoan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Loan
                    </button>
                  </>
                )}
                {selectedLoan.status === 'Approved' && (
                  <button 
                    onClick={() => handleDisburse(selectedLoan.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <DollarSign className="w-5 h-5" />
                    Disburse Loan
                  </button>
                )}
                <button 
                  onClick={() => setShowLoanDetails(false)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border-2 border-blue-600 border-opacity-50">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0 border-b border-blue-200">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Document Viewer</h3>
                <p className="text-xs sm:text-sm text-blue-100 truncate">Document {currentDocumentIndex + 1} of {documentList.length}</p>
                <p className="text-xs sm:text-sm text-blue-100 truncate mt-1">{selectedDocument}</p>
              </div>
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4 sm:p-6">
              {isImage(selectedDocument) ? (
                <div className="flex flex-col items-center">
                  {imageLoading ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                      <p className="text-gray-600">Loading document...</p>
                    </div>
                  ) : imageDataUrl ? (
                    <img 
                      src={imageDataUrl} 
                      alt={selectedDocument}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy="0.3em" font-family="sans-serif" font-size="16" fill="%239ca3af"%3EImage not found or error loading%3C/text%3E%3C/svg%3E';
                      }}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <AlertCircle className="w-12 h-12 text-red-600" />
                      <p className="text-gray-700 font-semibold">Failed to load image</p>
                      <p className="text-gray-600 text-sm">{selectedDocument}</p>
                    </div>
                  )}
                </div>
              ) : isPDF(selectedDocument) ? (
                <div className="text-center w-full h-full flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-red-600" />
                  </div>
                  <p className="text-gray-700 font-semibold mb-2">{selectedDocument}</p>
                  <p className="text-gray-600 text-sm mb-6">PDF Document</p>
                  <div className="flex flex-col gap-3 items-center">
                    <button 
                      onClick={() => downloadDocument(viewerLoanId || '', selectedDocument)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <p className="text-xs text-gray-500">Click download to view the PDF file</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-12 h-12 text-gray-600" />
                  </div>
                  <p className="text-gray-700 font-semibold mb-2">{selectedDocument}</p>
                  <p className="text-gray-600 text-sm mb-4">Document type not supported for preview</p>
                  <button 
                    onClick={() => downloadDocument(viewerLoanId || '', selectedDocument)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Document
                  </button>
                </div>
              )}
            </div>

            {/* Navigation and Actions */}
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between bg-gray-50 border-t flex-shrink-0 flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                <button
                  onClick={previousDocument}
                  disabled={currentDocumentIndex === 0}
                  className={`p-2 rounded-lg transition-colors ${
                    currentDocumentIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  title="Previous Document"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-700 px-2 min-w-fit">
                  {currentDocumentIndex + 1} / {documentList.length}
                </span>
                <button
                  onClick={nextDocument}
                  disabled={currentDocumentIndex === documentList.length - 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentDocumentIndex === documentList.length - 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  title="Next Document"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    downloadDocument(viewerLoanId || '', selectedDocument);
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button 
                  onClick={() => setShowDocumentViewer(false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;
