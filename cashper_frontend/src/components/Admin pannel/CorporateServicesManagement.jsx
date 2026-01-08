import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, Eye, CheckCircle, XCircle, Clock, Filter, Search, Download, AlertCircle, FileText, RefreshCw } from 'lucide-react';

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

const CorporateServicesManagement = () => {
  // Helper function to download a single document
  const downloadDocument = async (docPath) => {
    try {
      // Extract filename from path
      const fileName = docPath.split('/').pop().split('\\').pop();
      
      // Construct download URL
      const downloadUrl = `http://127.0.0.1:8000/${docPath}`;
      
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // Force download
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  // Helper function to download all documents as ZIP
  const downloadAllDocuments = (documents, applicationId) => {
    // In production, you would create a ZIP file with JSZip library
    // For now, we'll download a text file listing all documents
    const content = `All Documents for Application #${applicationId}\n\n` +
      documents.map((doc, i) => `${i + 1}. ${doc}`).join('\n') +
      `\n\nDownloaded on: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `All_Documents_${applicationId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Helper function to export data as CSV
  const exportToCSV = () => {
    // CSV Headers
    const headers = ['Application ID', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Service Type', 'Status', 'Applied On'];
    
    // CSV Rows
    const rows = filteredApplications.map(app => [
      app._id || app.id || '',
      app.company_name || '',
      app.contact_person || '',
      app.email || '',
      app.phone || '',
      app.service_type || '',
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
    link.download = `Corporate_Services_Applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const itemsPerPage = 10;

  const serviceTypes = [
    'Register Your New Company',
    'Compliance for New Company',
    'Tax Audit',
    'Legal Advice',
    'Provident Fund Services',
    'TDS Services',
    'GST Services',
    'Payroll Services',
    'Accounting & Bookkeeping'
  ];

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filterStatus, filterServiceType]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/business-services/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched stats:', data);
        
        if (data.success && data.stats) {
          setStats({
            total: data.stats.total || 0,
            pending: data.stats.pending || 0,
            approved: data.stats.approved || 0,
            completed: data.stats.completed || 0
          });
        }
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Build query parameters for backend filtering
      const params = new URLSearchParams();
      if (filterServiceType && filterServiceType !== 'all') {
        params.append('service_type', filterServiceType);
      }
      if (filterStatus && filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      
      const url = `http://127.0.0.1:8000/api/business-services/all-applications${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Fetching applications with filters:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched corporate services data:', data);
        
        // Check if data is an array or has applications property
        const applicationsData = Array.isArray(data) ? data : (data.applications || data.data || []);
        
        // Transform the data to match our component's expected structure
        const transformedData = applicationsData.map((app, index) => ({
          _id: app._id || app.id,
          id: app.id || app._id,
          company_name: app.company_name || app.companyName || app.full_name || app.name,
          contact_person: app.contact_person || app.contactPerson || app.full_name || app.name,
          email: app.email,
          phone: app.phone || app.mobile || app.contact_number,
          service_type: app.service_type || app.serviceType || app.service,
          status: app.status || 'Pending',
          created_at: app.created_at || app.createdAt || app.date || app.timestamp,
          updated_at: app.updated_at || app.updatedAt,
          // Additional fields that might be present
          company_address: app.company_address || app.address,
          registration_number: app.registration_number || app.registrationNumber,
          message: app.message || app.description || app.additional_info,
          documents: app.documents || app.uploadedDocuments || app.uploaded_documents || [],
          // Service-specific fields
          company_type: app.company_type || app.companyType,
          proposed_names: app.proposed_names || app.proposedNames,
          directors_count: app.directors_count || app.directorsCount || app.number_of_directors,
          authorized_capital: app.authorized_capital || app.authorizedCapital,
          registered_office: app.registered_office || app.registeredOffice || app.state,
          gst_type: app.gst_type || app.gstType,
          business_type: app.business_type || app.businessType,
          annual_turnover: app.annual_turnover || app.annualTurnover,
          gstin: app.gstin,
          financial_year: app.financial_year || app.financialYear,
          turnover: app.turnover,
          business_nature: app.business_nature || app.businessNature,
          audit_type: app.audit_type || app.auditType,
          service_requested: app.service_requested || app.serviceRequested,
          employee_count: app.employee_count || app.employeeCount,
          establishment_date: app.establishment_date || app.establishmentDate,
          rejection_reason: app.rejection_reason || app.rejectionReason,
          // All other fields from API
          ...app
        }));
        
        setApplications(transformedData);
        // Refresh stats after fetching applications
        fetchStats();
      } else {
        console.error('Failed to fetch applications:', response.status, response.statusText);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching corporate services:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/business-services/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Status updated successfully:', data);
        
        // Show success message
        alert(`✅ Status successfully updated to "${newStatus}"!`);
        
        // Update the current application in state
        setSelectedApplication(prev => ({
          ...prev,
          status: newStatus
        }));
        
        // Refresh the applications list
        fetchApplications();
        fetchStats();
        
        // Close modal after a short delay
        setTimeout(() => {
          setShowDetailsModal(false);
        }, 800);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update status:', response.status, errorData);
        alert(`❌ Failed to update status: ${errorData.detail || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error updating status. Please check your connection and try again.');
    }
  };

  // Now only filter by search query since status and service type are filtered by backend
  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    
    const matchesSearch = 
      app.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone?.includes(searchQuery) ||
      app.service_type?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'approved': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
      'under_review': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'Rejected': 'bg-red-100 text-red-800 border-red-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === 'pending') return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (lowerStatus === 'approved') 
      return <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (lowerStatus === 'in progress' || lowerStatus === 'in-progress' || lowerStatus === 'in_progress' || lowerStatus === 'under review' || lowerStatus === 'under_review') 
      return <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (lowerStatus === 'completed') 
      return <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    if (lowerStatus === 'rejected') 
      return <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    return <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
  };

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2">
          <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0" />
          <span>Corporate Services</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage all corporate service applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">Total Applications</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 flex-shrink-0" />
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
              <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 truncate">Approved</p>
              <p className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
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
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-2.5 sm:p-3 md:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer transition-all touch-manipulation font-medium"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filterServiceType}
            onChange={(e) => setFilterServiceType(e.target.value)}
            className="w-full px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer transition-all touch-manipulation font-medium"
          >
            <option value="all">All Services</option>
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button 
            onClick={exportToCSV}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all text-xs sm:text-sm md:text-base font-medium touch-manipulation"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Applications Table/Cards */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b-2 border-indigo-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[150px]">APPLICANT</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[180px]">Service Type</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[120px]">Contact</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[130px]">Applied On</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedApplications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  paginatedApplications.map((app) => (
                    <tr key={app._id || app.id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        #{app.id || app._id}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{app.company_name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{app.email}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-900 truncate max-w-[180px]">{app.service_type}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{app.phone}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">
                        {formatDate(app.created_at)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={async () => {
                            // Fetch full application details
                            try {
                              const serviceEndpointMap = {
                                'Register Your New Company': 'company-registration',
                                'Register New Company': 'company-registration',
                                'Company Registration': 'company-registration',
                                'Compliance for New Company': 'company-compliance',
                                'Tax Audit': 'tax-audit',
                                'Legal Advice': 'legal-advice',
                                'Provident Fund Services': 'provident-fund-services',
                                'TDS Services': 'tds-services',
                                'TDS-Related Services': 'tds-services',
                                'GST Services': 'gst-services',
                                'GST-Related Services': 'gst-services',
                                'Payroll Services': 'payroll-services',
                                'Accounting & Bookkeeping': 'accounting-bookkeeping'
                              };
                              
                              const endpoint = serviceEndpointMap[app.service_type];
                              if (endpoint) {
                                const response = await fetch(`http://127.0.0.1:8000/api/business-services/${endpoint}/${app.id}`);
                                if (response.ok) {
                                  const data = await response.json();
                                  if (data.success && data.application) {
                                    setSelectedApplication({
                                      ...app,
                                      fullData: data.application
                                    });
                                    setShowDetailsModal(true);
                                    return;
                                  }
                                }
                              }
                            } catch (error) {
                              console.error('Error fetching full details:', error);
                            }
                            // Fallback to existing data
                            setSelectedApplication(app);
                            setShowDetailsModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 font-semibold hover:underline"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          ) : paginatedApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No applications found
            </div>
          ) : (
            paginatedApplications.map((app) => (
              <div key={app._id || app.id} className="p-3 sm:p-4 hover:bg-indigo-50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">#{app.id || app._id} - {app.company_name}</p>
                    <p className="text-xs text-gray-500 truncate">{app.service_type}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-xs text-gray-600 truncate">{app.email}</p>
                  <p className="text-xs font-medium text-gray-900">{app.phone}</p>
                  <p className="text-xs text-gray-500">{formatDate(app.created_at)}</p>
                </div>
                <button
                  onClick={async () => {
                    // Fetch full application details
                    try {
                      const serviceEndpointMap = {
                        'Register Your New Company': 'company-registration',
                        'Register New Company': 'company-registration',
                        'Company Registration': 'company-registration',
                        'Compliance for New Company': 'company-compliance',
                        'Tax Audit': 'tax-audit',
                        'Legal Advice': 'legal-advice',
                        'Provident Fund Services': 'provident-fund-services',
                        'TDS Services': 'tds-services',
                        'TDS-Related Services': 'tds-services',
                        'GST Services': 'gst-services',
                        'GST-Related Services': 'gst-services',
                        'Payroll Services': 'payroll-services',
                        'Accounting & Bookkeeping': 'accounting-bookkeeping'
                      };
                      
                      const endpoint = serviceEndpointMap[app.service_type];
                      if (endpoint) {
                        const response = await fetch(`http://127.0.0.1:8000/api/business-services/${endpoint}/${app.id}`);
                        if (response.ok) {
                          const data = await response.json();
                          if (data.success && data.application) {
                            setSelectedApplication({
                              ...app,
                              fullData: data.application
                            });
                            setShowDetailsModal(true);
                            return;
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching full details:', error);
                    }
                    // Fallback to existing data
                    setSelectedApplication(app);
                    setShowDetailsModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all text-xs font-semibold touch-manipulation"
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
                  className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-500 active:bg-indigo-100 transition-all text-xs sm:text-sm font-medium touch-manipulation"
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
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'border-2 border-gray-300 hover:bg-indigo-50 hover:border-indigo-500 text-gray-700'
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
                  className="px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-50 hover:border-indigo-500 active:bg-indigo-100 transition-all text-xs sm:text-sm font-medium touch-manipulation"
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
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-t-lg sm:rounded-t-xl z-10">
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
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">{selectedApplication.service_type}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Company Name</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">{selectedApplication.company_name}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Contact Person</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 truncate">{selectedApplication.contact_person}</p>
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

              {selectedApplication.company_address && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Company Address</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 break-words">{selectedApplication.company_address}</p>
                </div>
              )}
              {selectedApplication.registration_number && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Registration Number</label>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">{selectedApplication.registration_number}</p>
                </div>
              )}
              {selectedApplication.message && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <label className="text-[10px] xs:text-xs text-gray-600 font-medium block mb-1">Message</label>
                  <p className="text-xs sm:text-sm md:text-base text-gray-900 whitespace-pre-wrap break-words">{selectedApplication.message}</p>
                </div>
              )}
              {/* Documents Section - Show documents from backend */}
              {(() => {
                const fullData = selectedApplication.fullData || selectedApplication;
                const documents = fullData.documents || {};
                const hasDocuments = documents && typeof documents === 'object' && Object.keys(documents).length > 0;
                
                return (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <label className="text-sm sm:text-base font-bold text-gray-800">Uploaded Documents</label>
                    </div>
                    {hasDocuments ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {Object.entries(documents).map(([docKey, docPath], index) => {
                            if (!docPath || typeof docPath !== 'string') return null;
                            const docName = docPath.split('\\').pop().split('/').pop();
                            const displayName = docKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            
                            return (
                              <div key={index} className="bg-white p-3 rounded-lg border border-blue-200 hover:border-blue-400 transition-all">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                                      <p className="text-[10px] text-gray-500 truncate">{docName}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => downloadDocument(docPath)}
                                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all text-xs font-semibold touch-manipulation flex-shrink-0"
                                  >
                                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Download</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="bg-white p-6 rounded-lg text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No documents uploaded for this application</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="border-t-2 pt-4">
                <label className="text-xs sm:text-sm font-bold text-gray-700 mb-3 block">Update Application Status</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Pending')}
                    disabled={selectedApplication.status === 'Pending'}
                    className={`px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-all text-xs sm:text-sm font-bold touch-manipulation flex items-center justify-center gap-2 ${
                      selectedApplication.status === 'Pending'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 active:from-yellow-700 active:to-yellow-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Approved')}
                    disabled={selectedApplication.status === 'Approved'}
                    className={`px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-all text-xs sm:text-sm font-bold touch-manipulation flex items-center justify-center gap-2 ${
                      selectedApplication.status === 'Approved'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approved
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Completed')}
                    disabled={selectedApplication.status === 'Completed'}
                    className={`px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-all text-xs sm:text-sm font-bold touch-manipulation flex items-center justify-center gap-2 ${
                      selectedApplication.status === 'Completed'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication._id || selectedApplication.id, 'Rejected')}
                    disabled={selectedApplication.status === 'Rejected'}
                    className={`px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg transition-all text-xs sm:text-sm font-bold touch-manipulation flex items-center justify-center gap-2 ${
                      selectedApplication.status === 'Rejected'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
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

export default CorporateServicesManagement;
