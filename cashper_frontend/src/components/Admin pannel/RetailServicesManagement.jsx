import React, { useState, useEffect } from 'react';
import { ShoppingBag, FileText, Eye, CheckCircle, XCircle, Clock, Filter, Search, Download, AlertCircle, User } from 'lucide-react';

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
      hour12: true
    });
  } catch (e) {
    return dateString;
  }
};

const RetailServicesManagement = () => {
  // Map document keys to user-friendly names
  const getDocumentDisplayName = (docKey) => {
    const nameMap = {
      'pan_card': 'Pan Card',
      'panCard': 'Pan Card',
      'aadhaar_card': 'Aadhar Card',
      'aadhaarCard': 'Aadhar Card',
      'photo': 'Photo',
      'signature': 'Signature',
      'bank_proof': 'Bank Proof',
      'bank_statement': 'Bank Statements',
      'bankStatement': 'Bank Statements',
      'form16': 'Form 16',
      'investment_proofs': 'Investment Proofs',
      'investmentProofs': 'Investment Proofs',
      'salary_slip': 'Salary Slips',
      'salarySlip': 'Salary Slips',
      'original_itr': 'Original ITR',
      'originalITR': 'Original ITR',
      'revised_itr': 'Revised ITR',
      'revisedITR': 'Revised ITR',
      'notice_document': 'Notice Document',
      'noticeDocument': 'Notice Document',
      'reply_document': 'Reply Document',
      'replyDocument': 'Reply Document',
      'supporting_documents': 'Supporting Documents',
      'supportingDocuments': 'Supporting Documents',
      'address_proof': 'Address Proof',
      'addressProof': 'Address Proof',
      'identity_proof': 'Identity Proof',
      'identityProof': 'Identity Proof',
      'pf_statement': 'PF Statement',
      'pfStatement': 'PF Statement',
      'cancellation_cheque': 'Cancelled Cheque',
      'cancellationCheque': 'Cancelled Cheque',
      'demat_documents': 'Demat Documents',
      'dematDocuments': 'Demat Documents',
      'trading_documents': 'Trading Documents',
      'tradingDocuments': 'Trading Documents',
      'kyc_documents': 'KYC Documents',
      'kycDocuments': 'KYC Documents',
      'income_proof': 'Income Proof',
      'incomeProof': 'Income Proof',
      'business_proof': 'Business Proof',
      'businessProof': 'Business Proof'
    };
    
    return nameMap[docKey] || docKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to download a single document
  const downloadDocument = async (docKey, applicationId) => {
    try {
      console.log('📥 Downloading document:', { docKey, applicationId });
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://127.0.0.1:8000/api/retail-services/admin/applications/${applicationId}/documents/${docKey}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('📦 Blob size:', blob.size, 'bytes');
        
        if (blob.size === 0) {
          console.error('❌ Downloaded file is empty');
          alert('Downloaded file is empty. Please check if the file was uploaded correctly.');
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `${getDocumentDisplayName(docKey)}.pdf`;
        
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }
        
        console.log('💾 Saving as:', filename);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('✅ Download completed');
      } else {
        const errorText = await response.text();
        console.error('❌ Download failed:', errorText);
        alert(`Failed to download document: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      alert(`Error downloading document: ${error.message}`);
    }
  };

  // Helper function to download all documents as ZIP
  const downloadAllDocuments = async (documents, applicationId) => {
    // Download each document one by one
    for (const docKey of documents) {
      await downloadDocument(docKey, applicationId);
      // Small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Helper function to export data as CSV
  const exportToCSV = () => {
    // CSV Headers
    const headers = ['Application ID', 'Name', 'Email', 'Phone', 'Service Type', 'Status', 'Applied On'];
    
    // CSV Rows
    const rows = filteredApplications.map(app => [
      app._id || app.id || '',
      app.name || '',
      app.email || '',
      app.phone || '',
      getServiceDisplayName(app.service_type),
      app.status || '',
      formatDate(app.created_at)
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Retail_Services_Applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, approved: 0, completed: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPage = 10;

  const serviceTypes = [
    'itr-filing',
    'itr-revision',
    'itr-notice-reply',
    'individual-pan',
    'huf-pan',
    'pf-withdrawal',
    'update-aadhaar-pan',
    'trading-demat',
    'bank-account',
    'financial-planning'
  ];

  const serviceTypeDisplayNames = {
    'itr-filing': 'File Your ITR',
    'itr-revision': 'ITR Revision',
    'itr-notice-reply': 'ITR Notice Reply',
    'individual-pan': 'Apply for Individual PAN',
    'huf-pan': 'Apply for HUF PAN',
    'pf-withdrawal': 'Withdraw Your PF',
    'update-aadhaar-pan': 'Update Aadhaar or PAN',
    'trading-demat': 'Online Trading & Demat',
    'bank-account': 'Bank Account Services',
    'financial-planning': 'Financial Planning & Advisory'
  };

  // Helper function to get display name
  const getServiceDisplayName = (serviceType) => {
    return serviceTypeDisplayNames[serviceType] || serviceType || 'N/A';
  };

  useEffect(() => {
    fetchApplications();
    fetchStatistics();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/retail-services/admin/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched applications:', data.length);
        setApplications(data);
      } else {
        console.error('❌ Failed to fetch applications:', response.statusText);
        setApplications([]);
      }
    } catch (error) {
      console.error('❌ Error fetching retail services:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetails = async (applicationId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/retail-services/admin/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched application details:', data);
        // Flatten application_data fields for easy access
        const flattenedApp = {
          ...data,
          ...(data.application_data || {})
        };
        setSelectedApplication(flattenedApp);
        setShowDetailsModal(true);
      } else {
        console.error('❌ Failed to fetch application details:', response.statusText);
        alert('Failed to load application details');
      }
    } catch (error) {
      console.error('❌ Error fetching application details:', error);
      alert('Error loading application details');
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/retail-services/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched statistics:', data);
        setStats(data);
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/retail-services/admin/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Status updated:', result);
        
        // Refresh both applications and statistics
        await fetchApplications();
        await fetchStatistics();
        
        setShowDetailsModal(false);
        alert(`✅ Status successfully updated to: ${newStatus}`);
      } else {
        const error = await response.json();
        console.error('❌ Failed to update status:', error);
        alert(`❌ Failed to update status: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('❌ Error updating status. Please check your connection.');
    }
  };

  const filteredApplications = applications.filter(app => {
    // Search filter - check multiple fields
    const matchesSearch = !searchQuery || 
      app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone?.includes(searchQuery) ||
      app.application_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.service_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter - case insensitive comparison
    const matchesStatus = filterStatus === 'all' || 
      app.status?.toLowerCase() === filterStatus.toLowerCase();
    
    // Service type filter - exact match
    const matchesServiceType = filterServiceType === 'all' || 
      app.service_type === filterServiceType;
    
    return matchesSearch && matchesStatus && matchesServiceType;
  });

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In-Progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'Approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'In-Progress': return <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Approved': return <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Completed': return <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Rejected': return <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      default: return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
  };

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          <span>Retail Services</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage all retail service applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">Total Applications</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">Pending</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">In-Progress</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-purple-600">{stats.inProgress || 0}</p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">Approved</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600">{stats.approved || 0}</p>
            </div>
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">Completed</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">Rejected</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            </div>
            <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4">
          <div className="relative w-full sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all touch-manipulation"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer transition-all touch-manipulation font-medium"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In-Progress</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterServiceType}
            onChange={(e) => {
              setFilterServiceType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white cursor-pointer transition-all touch-manipulation font-medium"
          >
            <option value="all">All Services</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>
                {serviceTypeDisplayNames[type] || type}
              </option>
            ))}
          </select>

          <button 
            onClick={exportToCSV}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all text-xs sm:text-sm md:text-base font-medium touch-manipulation"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Applications Table/Cards */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <table className="w-full table-fixed">
            <thead className="bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
              <tr>
                <th className="w-[15%] px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                <th className="w-[20%] px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase">Applicant</th>
                <th className="w-[18%] px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase">Service</th>
                <th className="w-[13%] px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase">Contact</th>
                <th className="w-[16%] px-2 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                <th className="w-[10%] px-1 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                <th className="w-[8%] px-1 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedApplications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        {filteredApplications.length === 0 && applications.length > 0
                          ? 'No applications match your filters'
                          : 'No applications found'}
                      </p>
                      {filteredApplications.length === 0 && applications.length > 0 && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('all');
                            setFilterServiceType('all');
                          }}
                          className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((app) => (
                  <tr key={app._id || app.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-2 py-3 text-xs font-semibold text-gray-900" title={`#${app.id || 'N/A'}`}>
                      <div className="break-words">#{app.id || 'N/A'}</div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="text-xs font-medium text-gray-900 truncate" title={app.name}>{app.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 truncate" title={app.email}>{app.email || 'N/A'}</div>
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-900 truncate" title={getServiceDisplayName(app.service_type)}>
                      {getServiceDisplayName(app.service_type)}
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-500 truncate" title={app.phone}>
                      {app.phone || 'N/A'}
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-500" title={formatDate(app.created_at)}>
                      <div className="truncate">{formatDate(app.created_at)}</div>
                    </td>
                    <td className="px-1 py-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        <span className="hidden xl:inline">{app.status}</span>
                      </span>
                    </td>
                    <td className="px-1 py-3 text-xs font-medium">
                      <button
                        onClick={() => fetchApplicationDetails(app._id || app.id)}
                        className="text-green-600 hover:text-green-900 flex items-center justify-center gap-1 font-semibold hover:underline text-xs"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden xl:inline">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            </div>
          ) : paginatedApplications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <FileText className="w-16 h-16 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-sm">
                  {filteredApplications.length === 0 && applications.length > 0
                    ? 'No applications match your filters'
                    : 'No applications found'}
                </p>
                {filteredApplications.length === 0 && applications.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                      setFilterServiceType('all');
                    }}
                    className="mt-3 text-sm text-green-600 hover:text-green-800 font-medium underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            paginatedApplications.map((app) => (
              <div key={app._id || app.id} className="p-3 sm:p-4 hover:bg-green-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">#{app.id} - {app.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 truncate">{getServiceDisplayName(app.service_type)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-600 truncate">{app.email || 'N/A'}</p>
                  <p className="text-xs text-gray-600">{app.phone || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{formatDate(app.created_at)}</p>
                </div>
                <button
                  onClick={() => fetchApplicationDetails(app._id || app.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all text-xs font-semibold touch-manipulation"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-50 hover:border-green-500 active:bg-green-100 transition-all text-xs sm:text-sm font-medium touch-manipulation"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all touch-manipulation ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white shadow-md'
                            : 'border-2 border-gray-300 hover:bg-green-50 hover:border-green-500 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                {/* Mobile Page Indicator */}
                <div className="sm:hidden px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-xs font-semibold text-gray-700">
                  {currentPage} / {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-50 hover:border-green-500 active:bg-green-100 transition-all text-xs sm:text-sm font-medium touch-manipulation"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-2 xs:p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg sm:rounded-xl max-w-3xl w-full max-h-[95vh] my-auto overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-t-lg sm:rounded-t-xl z-10">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">Application Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 active:bg-opacity-30 p-1.5 sm:p-2 rounded-lg transition-all touch-manipulation flex-shrink-0"
                  aria-label="Close modal"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Application ID</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">#{selectedApplication.id}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Service Type</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">{getServiceDisplayName(selectedApplication.service_type)}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Applicant Name</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">{selectedApplication.name}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Email</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">{selectedApplication.email}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Phone</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{selectedApplication.phone}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status}
                  </span>
                </div>
                <div className="min-w-0 xs:col-span-2">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Applied On</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{formatDate(selectedApplication.created_at)}</p>
                </div>
              </div>

              {selectedApplication.pan_number && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">PAN Number</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{selectedApplication.pan_number}</p>
                </div>
              )}

              {selectedApplication.aadhaar_number && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Aadhaar Number</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{selectedApplication.aadhaar_number}</p>
                </div>
              )}

              {selectedApplication.message && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Message</label>
                  <p className="text-xs sm:text-sm md:text-base text-gray-900 whitespace-pre-wrap break-words">{selectedApplication.message}</p>
                </div>
              )}

              {/* Documents Section */}
              {selectedApplication.documents && Object.keys(selectedApplication.documents).length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <label className="text-sm sm:text-base font-bold text-gray-800">Uploaded Documents</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {Object.keys(selectedApplication.documents).map((docKey, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-400 transition-all">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                              {getDocumentDisplayName(docKey)}
                            </span>
                          </div>
                          <button
                            onClick={() => downloadDocument(docKey, selectedApplication._id || selectedApplication.id)}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all text-xs font-semibold touch-manipulation flex-shrink-0"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => downloadAllDocuments(Object.keys(selectedApplication.documents), selectedApplication._id || selectedApplication.id)}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all text-sm font-semibold touch-manipulation"
                  >
                    <Download className="w-4 h-4" />
                    Download All Documents
                  </button>
                </div>
              )}

              <div className="border-t-2 pt-4">
                <label className="text-xs sm:text-sm font-bold text-gray-700 mb-3 block">Update Status</label>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Pending')}
                    className="px-3 py-2.5 sm:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 active:bg-yellow-800 transition-all text-xs sm:text-sm font-semibold touch-manipulation"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'In-Progress')}
                    className="px-3 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-all text-xs sm:text-sm font-semibold touch-manipulation"
                  >
                    In-Progress
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Approved')}
                    className="px-3 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all text-xs sm:text-sm font-semibold touch-manipulation"
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Completed')}
                    className="px-3 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all text-xs sm:text-sm font-semibold touch-manipulation"
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Rejected')}
                    className="px-3 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all text-xs sm:text-sm font-semibold touch-manipulation"
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailServicesManagement;
