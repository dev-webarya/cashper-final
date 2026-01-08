import React, { useState, useEffect } from 'react';
import { 
  FileText, Calculator, CreditCard, TrendingUp, User, Users, 
  Home, Briefcase, Shield, DollarSign, Building, PiggyBank,
  ChevronRight, CheckCircle, Clock, ArrowRight, Phone, Mail,
  Calendar, Search, Filter, BookOpen, Wallet, Award, Target,
  X, Eye, Plus, ShoppingBag, Download, Star, RefreshCw, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServiceFormPopup from './ServiceFormPopup';

// Available retail services
const RETAIL_SERVICES = [
  'File Your ITR',
  'Revise Your ITR',
  'Reply to ITR Notice',
  'Apply for Individual PAN',
  'Apply for HUF PAN',
  'Withdraw Your PF',
  'Update Aadhaar or PAN Details',
  'Online Trading & Demat',
  'Bank Account Services',
  'Financial Planning & Advisory'
];

// Mapping from display names to database values
const SERVICE_TYPE_MAPPING = {
  'File Your ITR': 'itr-filing',
  'Revise Your ITR': 'itr-revision',
  'Reply to ITR Notice': 'itr-notice-reply',
  'Apply for Individual PAN': 'individual-pan',
  'Apply for HUF PAN': 'huf-pan',
  'Withdraw Your PF': 'pf-withdrawal',
  'Update Aadhaar or PAN Details': 'document-update',
  'Online Trading & Demat': 'trading-demat',
  'Bank Account Services': 'bank-account',
  'Financial Planning & Advisory': 'financial-planning'
};

// Reverse mapping from database values to display names
const DB_TO_DISPLAY_MAPPING = {
  'itr-filing': 'File Your ITR',
  'itr-revision': 'Revise Your ITR',
  'itr-notice-reply': 'Reply to ITR Notice',
  'individual-pan': 'Apply for Individual PAN',
  'huf-pan': 'Apply for HUF PAN',
  'pf-withdrawal': 'Withdraw Your PF',
  'document-update': 'Update Aadhaar or PAN Details',
  'trading-demat': 'Online Trading & Demat',
  'bank-account': 'Bank Account Services',
  'financial-planning': 'Financial Planning & Advisory'
};

const RetailServices = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [showServiceFormPopup, setShowServiceFormPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Applications data from backend
  const [applications, setApplications] = useState([
    {
      id: 'RS001',
      applicantName: 'Rajesh Kumar',
      serviceType: 'File Your ITR',
      contact: '9876543210',
      appliedOn: '25 Nov 2024',
      status: 'Pending'
    },
    {
      id: 'RS002',
      applicantName: 'Priya Sharma',
      serviceType: 'Apply for Individual PAN',
      contact: '9876543211',
      appliedOn: '24 Nov 2024',
      status: 'Approved'
    }
  ]);

  // Fetch user's retail service applications from backend
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (serviceFilter && serviceFilter !== 'all') {
          // Convert display name to database value
          const dbServiceType = SERVICE_TYPE_MAPPING[serviceFilter];
          console.log('🔍 Selected service filter:', serviceFilter);
          console.log('🔍 Mapped to database value:', dbServiceType);
          if (dbServiceType) {
            params.append('service_type', dbServiceType);
          }
        }
        if (statusFilter && statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        const url = `http://localhost:8000/api/user/retail-services/applications${params.toString() ? '?' + params.toString() : ''}`;
        console.log('🌐 Fetching applications from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Fetched applications:', data);
          console.log('✅ Number of applications:', data.length);
          // Transform backend data to match frontend structure
          const transformedData = data.map(app => ({
            id: app.application_id || `#RS${app._id}`,
            applicantName: app.applicant_name || app.name || 'N/A',
            applicantEmail: app.applicant_email || app.email || 'N/A',
            // Convert database value to display name
            serviceType: DB_TO_DISPLAY_MAPPING[app.service_type] || app.service_type || 'N/A',
            contact: app.contact || app.phone || 'N/A',
            appliedOn: app.applied_on || app.createdAt || new Date().toLocaleDateString(),
            status: app.status || 'Pending'
          }));
          setApplications(transformedData);
        } else {
          console.error('❌ Failed to fetch applications:', response.status);
          setApplications([]);
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [serviceFilter, statusFilter]); // Re-fetch when filters change

  // Calculate stats from applications
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Pending').length,
    inProgress: applications.filter(app => app.status === 'In Progress').length,
    completed: applications.filter(app => app.status === 'Completed').length
  };

  // Filter applications by search only (service and status filters are handled by backend)
  const filteredApplications = applications.filter(app => {
    if (searchQuery.trim() === '') return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (app.applicantName && app.applicantName.toLowerCase().includes(searchLower)) ||
      (app.applicantEmail && app.applicantEmail.toLowerCase().includes(searchLower)) ||
      (app.serviceType && app.serviceType.toLowerCase().includes(searchLower)) ||
      (app.id && app.id.toLowerCase().includes(searchLower)) ||
      (app.contact && app.contact.toLowerCase().includes(searchLower))
    );
  });

  // Pagination - Reset to page 1 when filters change
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  
  // Auto-reset page when filtered results are less than current page
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Under Review':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Under Review':
        return <AlertCircle className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleExportCSV = () => {
    // Generate CSV data
    const csvContent = [
      ['Application ID', 'Applicant Name', 'Service Type', 'Contact', 'Applied On', 'Status'],
      ...filteredApplications.map(app => [
        app.id,
        app.applicantName,
        app.serviceType,
        app.contact,
        app.appliedOn,
        app.status
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retail_services_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleApplyForService = () => {
    window.location.href = '/services';
  };

  const handleViewApplication = async (app) => {
    try {
      // Fetch full application details from backend
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/user/retail-services/applications/${app.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📄 Full application data:', data);
        // Merge with existing data
        setSelectedApplication({
          ...app,
          fullData: data
        });
      } else {
        // Fallback to existing data if fetch fails
        console.error('Failed to fetch full application details');
        setSelectedApplication(app);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      // Fallback to existing data
      setSelectedApplication(app);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  // Download document function
  const downloadDocument = async (documentPath) => {
    try {
      console.log('📥 Original document path:', documentPath);
      
      // Extract filename from path
      const fileName = documentPath.split('/').pop().split('\\').pop();
      
      // Normalize the path
      let normalizedPath = documentPath;
      
      // Check if it's an absolute Windows path
      if (documentPath.includes(':\\')) {
        // Extract only the relative path after 'uploads'
        const uploadsIndex = documentPath.indexOf('uploads');
        if (uploadsIndex !== -1) {
          normalizedPath = documentPath.substring(uploadsIndex);
        }
      }
      
      // Convert backslashes to forward slashes for URL
      normalizedPath = normalizedPath.replace(/\\/g, '/');
      
      // Construct download URL
      const downloadUrl = `http://localhost:8000/${normalizedPath}`;
      
      console.log('📥 Normalized path:', normalizedPath);
      console.log('📥 Download URL:', downloadUrl);
      console.log('📥 File name:', fileName);
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(downloadUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Download failed:', errorText);
        throw new Error(`Download failed with status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('📥 Blob size:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download successful:', fileName);
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      alert(`Failed to download document: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading retail services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            Retail Services
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all retail service applications</p>
        </div>
        <button
          onClick={() => setShowServiceTypeModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Apply for Retail Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-teal-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Applications</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-teal-100 rounded-lg sm:rounded-xl">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-yellow-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Pending</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{stats.pending}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-yellow-100 rounded-lg sm:rounded-xl">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-blue-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">In Progress</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{stats.inProgress}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-blue-100 rounded-lg sm:rounded-xl">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-green-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Completed</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{stats.completed}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-green-100 rounded-lg sm:rounded-xl">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
          >
            <option value="all">All Services</option>
            {RETAIL_SERVICES.map((service, index) => (
              <option key={index} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          <div className="divide-y divide-gray-200">
          {currentApplications.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">No Applications Found</h3>
              <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            currentApplications.map((app) => (
              <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs text-gray-500">{app.id}</p>
                      <p className="font-semibold text-gray-800 mt-1">{app.applicantName}</p>
                      <p className="text-xs text-gray-500">{app.applicantEmail}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Service</p>
                      <p className="font-medium text-gray-700">{app.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contact</p>
                      <p className="font-medium text-gray-700">{app.contact}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">{app.appliedOn}</p>
                    <button
                      onClick={() => handleViewApplication(app)}
                      className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
          
          {/* Mobile Pagination */}
          {filteredApplications.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} applications
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 text-xs sm:text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          {/* Table Header */}
          <div className="bg-green-50 px-4 py-3 border-b border-green-100 sticky top-0">
            <div className="flex items-center gap-6 font-semibold text-gray-700 text-sm whitespace-nowrap">
              <div className="w-40">ID</div>
              <div className="w-40">APPLICANT</div>
              <div className="w-44">SERVICE TYPE</div>
              <div className="w-32">CONTACT</div>
              <div className="w-36">APPLIED ON</div>
              <div className="w-28">STATUS</div>
              <div className="w-20 text-center">ACTIONS</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {currentApplications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Applications Found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              currentApplications.map((app) => (
                <div key={app.id} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-6 text-sm whitespace-nowrap">
                  {/* ID */}
                  <div className="w-40">
                    <span className="font-mono text-gray-600 font-semibold truncate block">{app.id}</span>
                  </div>
                  
                  {/* Applicant */}
                  <div className="w-40">
                    <p className="font-semibold text-gray-800 truncate">{app.applicantName}</p>
                  </div>
                  
                  {/* Service Type */}
                  <div className="w-44">
                    <span className="text-gray-700 truncate block">{app.serviceType}</span>
                  </div>
                  
                  {/* Contact */}
                  <div className="w-32">
                    <span className="text-gray-700 truncate block">{app.contact}</span>
                  </div>
                  
                  {/* Applied On */}
                  <div className="w-36">
                    <span className="text-gray-600 text-xs truncate block">{app.appliedOn}</span>
                  </div>
                  
                  {/* Status */}
                  <div className="w-28">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="w-20 flex justify-center flex-shrink-0">
                    <button
                      onClick={() => handleViewApplication(app)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
          
          {/* Desktop Pagination */}
          {filteredApplications.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} applications
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 text-sm rounded-lg transition-colors font-medium ${
                          currentPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Application Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-3 rounded-t-xl flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Your Application Details</h2>
                <p className="text-teal-100 text-sm mt-1">Application ID: {selectedApplication.id}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-teal-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedApplication.status)} shadow-md`}>
                  {getStatusIcon(selectedApplication.status)}
                  {selectedApplication.status}
                </span>
              </div>

              {/* Application Information */}
              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-3 rounded-lg border border-teal-200">
                <h3 className="text-base font-bold text-teal-900 mb-3">Application Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Display all fields dynamically from fullData */}
                  {(() => {
                    const data = selectedApplication.fullData || selectedApplication;
                    const excludeFields = ['_id', 'user_id', 'created_at', 'updated_at', 'documents', 'application_id', 'id'];
                    const fieldLabels = {
                      'applicantName': 'Applicant Name',
                      'applicant_name': 'Applicant Name',
                      'email': 'Email',
                      'applicantEmail': 'Email',
                      'applicant_email': 'Email',
                      'phone': 'Phone',
                      'contact': 'Contact Number',
                      'serviceType': 'Service Type',
                      'service_type': 'Service Type',
                      'status': 'Status',
                      'appliedOn': 'Applied On',
                      'applied_on': 'Applied On',
                      'pan_number': 'PAN Number',
                      'aadhaar_number': 'Aadhaar Number',
                      'date_of_birth': 'Date of Birth',
                      'gender': 'Gender',
                      'father_name': 'Father Name',
                      'mother_name': 'Mother Name',
                      'address': 'Address',
                      'city': 'City',
                      'state': 'State',
                      'pincode': 'Pincode',
                      'income_source': 'Income Source',
                      'previous_year_income': 'Previous Year Income',
                      'bank_name': 'Bank Name',
                      'account_number': 'Account Number',
                      'ifsc_code': 'IFSC Code',
                      'investment_details': 'Investment Details',
                      'account_type': 'Account Type',
                      'demat_account': 'Demat Account',
                      'trading_experience': 'Trading Experience',
                      'annual_income': 'Annual Income',
                      'occupation': 'Occupation',
                      'nationality': 'Nationality',
                      'marital_status': 'Marital Status',
                      'pf_account_number': 'PF Account Number',
                      'uan_number': 'UAN Number',
                      'employer_name': 'Employer Name',
                      'withdrawal_amount': 'Withdrawal Amount',
                      'reason_for_withdrawal': 'Reason for Withdrawal',
                      'huf_name': 'HUF Name',
                      'karta_name': 'Karta Name',
                      'members_count': 'Members Count',
                      'notice_type': 'Notice Type',
                      'notice_date': 'Notice Date',
                      'assessment_year': 'Assessment Year',
                      'financial_year': 'Financial Year',
                      'original_itr_date': 'Original ITR Date',
                      'revision_reason': 'Revision Reason'
                    };
                    
                    return Object.entries(data)
                      .filter(([key, value]) => 
                        !excludeFields.includes(key) && 
                        value !== null && 
                        value !== undefined && 
                        value !== '' &&
                        key !== 'fullData' &&
                        typeof value !== 'object'
                      )
                      .map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                            {fieldLabels[key] || key.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-gray-900 font-medium text-sm break-words">
                            {String(value)}
                          </p>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {/* Uploaded Documents Section */}
              {(() => {
                const data = selectedApplication.fullData || selectedApplication;
                const documents = data.documents || {};
                const hasDocuments = documents && typeof documents === 'object' && Object.keys(documents).length > 0;
                
                return hasDocuments ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      Uploaded Documents
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2">
                        {Object.entries(documents).map(([docKey, docPath], index) => {
                          if (!docPath || typeof docPath !== 'string') return null;
                          const docName = docPath.split('\\').pop().split('/').pop();
                          const displayName = docKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          
                          return (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-teal-50 transition-colors">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-teal-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-semibold text-gray-900 block">{displayName}</span>
                                  <span className="text-xs text-gray-500 block truncate">{docName}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => downloadDocument(docPath)}
                                className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ml-2 flex-shrink-0"
                              >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Retail Service Type Selection Modal */}
      {showServiceTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <button
              onClick={() => setShowServiceTypeModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 pr-8">
                Select Retail Service
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Choose the retail service you need</p>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { name: 'File Your ITR', icon: FileText, route: '/personal-tax-planning', color: 'from-teal-500 to-teal-600', desc: 'Income tax return filing' },
                  { name: 'Revise Your ITR', icon: FileText, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Revise filed ITR' },
                  { name: 'Reply to ITR Notice', icon: AlertCircle, route: '/services', color: 'from-red-500 to-red-600', desc: 'Respond to tax notices' },
                  { name: 'Apply for Individual PAN', icon: CreditCard, route: '/services', color: 'from-purple-500 to-purple-600', desc: 'New PAN card application' },
                  { name: 'Apply for HUF PAN', icon: Users, route: '/services', color: 'from-orange-500 to-orange-600', desc: 'HUF PAN card application' },
                  { name: 'Withdraw Your PF', icon: DollarSign, route: '/services', color: 'from-green-500 to-green-600', desc: 'PF withdrawal services' },
                  { name: 'Update Aadhaar or PAN Details', icon: User, route: '/services', color: 'from-pink-500 to-pink-600', desc: 'Update your documents' },
                  { name: 'Online Trading & Demat', icon: TrendingUp, route: '/services', color: 'from-cyan-500 to-cyan-600', desc: 'Trading account services' },
                  { name: 'Bank Account Services', icon: Building, route: '/services', color: 'from-indigo-500 to-indigo-600', desc: 'Banking assistance' },
                  { name: 'Financial Planning & Advisory', icon: Target, route: '/services', color: 'from-yellow-500 to-yellow-600', desc: 'Expert financial advice' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setShowServiceTypeModal(false);
                      setSelectedServiceType(service.name);
                      setShowServiceFormPopup(true);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-teal-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-teal-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-teal-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Form Popup */}
      {showServiceFormPopup && (
        <ServiceFormPopup
          serviceType={selectedServiceType}
          onClose={() => {
            setShowServiceFormPopup(false);
            setSelectedServiceType(null);
          }}
        />
      )}
    </div>
  );
};

export default RetailServices;
