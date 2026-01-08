import React, { useState, useEffect } from 'react';
import { 
  Building, FileText, Scale, Shield, Users, Receipt, 
  Briefcase, Calculator, BookOpen, CheckCircle, Clock,
  Star, Search, Eye, Phone, Building2, RefreshCw, X,
  Award, Target, TrendingUp, AlertCircle, Wallet, Download, Plus, Mail, Calendar, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CorporateServiceFormPopup from './CorporateServiceFormPopup';

const CorporateServices = () => {
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
  const [applications, setApplications] = useState([]);

  // Fetch user's corporate service applications from backend
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Get auth token from localStorage
        const token = localStorage.getItem('access_token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Fetch from all 9 business services endpoints with authentication
        const [companyRegRes, complianceRes, taxAuditRes, legalRes, pfRes, tdsRes, gstRes, payrollRes, accountingRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/business-services/company-registration', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/company-compliance', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/tax-audit', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/legal-advice', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/provident-fund-services', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/tds-services', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/gst-services', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/payroll-services', { headers }),
          fetch('http://127.0.0.1:8000/api/business-services/accounting-bookkeeping', { headers })
        ]);

        const allApplications = [];

        // Process Company Registration
        if (companyRegRes.ok) {
          const data = await companyRegRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.proposed_company_name || app.company_name || app.full_name,
              applicantEmail: app.email,
              serviceType: 'Register New Company',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app,  // Store full application data
              collectionName: 'company-registration'  // For fetching full details
            }));
            allApplications.push(...transformed);
          }
        }

        // Process Company Compliance
        if (complianceRes.ok) {
          const data = await complianceRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.company_name || app.full_name,
              applicantEmail: app.email,
              serviceType: 'Compliance for New Company',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Process Tax Audit
        if (taxAuditRes.ok) {
          const data = await taxAuditRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.full_name || app.business_name,
              applicantEmail: app.email,
              serviceType: 'Tax Audit',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Process Legal Advice
        if (legalRes.ok) {
          const data = await legalRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.company_name || app.name,
              applicantEmail: app.email,
              serviceType: 'Legal Advice',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Process Provident Fund Services
        if (pfRes.ok) {
          const data = await pfRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.company_name || app.name,
              applicantEmail: app.email,
              serviceType: 'Provident Fund Services',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Process TDS Services
        if (tdsRes.ok) {
          const data = await tdsRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.company_name || app.full_name,
              applicantEmail: app.email,
              serviceType: 'TDS-Related Services',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Process GST Services
        if (gstRes.ok) {
          const data = await gstRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.business_name || app.full_name,
              applicantEmail: app.email,
              serviceType: 'GST-Related Services',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Process Payroll Services
        if (payrollRes.ok) {
          const data = await payrollRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.company_name || app.name,
              applicantEmail: app.email,
              serviceType: 'Payroll Services',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Process Accounting & Bookkeeping
        if (accountingRes.ok) {
          const data = await accountingRes.json();
          if (data.applications && Array.isArray(data.applications)) {
            const transformed = data.applications.map(app => ({
              id: app.application_id,
              applicantName: app.business_name || app.full_name,
              applicantEmail: app.email,
              serviceType: 'Accounting & Bookkeeping',
              contact: app.phone,
              appliedOn: app.created_at ? new Date(app.created_at).toLocaleString('en-IN', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              }) : 'N/A',
              status: app.status || 'Pending',
              rawData: app
            }));
            allApplications.push(...transformed);
          }
        }

        // Sort by date (newest first)
        allApplications.sort((a, b) => {
          try {
            const dateA = new Date(a.appliedOn);
            const dateB = new Date(b.appliedOn);
            return dateB - dateA;
          } catch {
            return 0;
          }
        });

        setApplications(allApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
    
    // Only refresh data if modal is not open (don't interrupt user while filling form)
    const interval = setInterval(() => {
      if (!showServiceFormPopup) {
        fetchApplications();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [showServiceFormPopup]);

  // Calculate stats from applications
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Pending').length,
    inProgress: applications.filter(app => app.status === 'In Progress').length,
    completed: applications.filter(app => app.status === 'Completed').length
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesService = serviceFilter === 'all' || app.serviceType === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, serviceFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);

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
      ['Application ID', 'Company Name', 'Email', 'Service Type', 'Contact', 'Applied On', 'Status'],
      ...filteredApplications.map(app => [
        app.id,
        app.applicantName,
        app.applicantEmail,
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
    a.download = `corporate_services_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewApplication = async (app) => {
    try {
      // Fetch full application details from backend
      let endpoint = '';
      
      // Determine the correct endpoint based on service type
      const serviceEndpointMap = {
        'Register New Company': 'company-registration',
        'Compliance for New Company': 'company-compliance',
        'Tax Audit': 'tax-audit',
        'Legal Advice': 'legal-advice',
        'Provident Fund Services': 'provident-fund-services',
        'TDS-Related Services': 'tds-services',
        'GST-Related Services': 'gst-services',
        'Payroll Services': 'payroll-services',
        'Accounting & Bookkeeping': 'accounting-bookkeeping'
      };
      
      endpoint = serviceEndpointMap[app.serviceType];
      
      if (endpoint) {
        const response = await fetch(`http://127.0.0.1:8000/api/business-services/${endpoint}/${app.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.application) {
            // Merge with the list data
            setSelectedApplication({
              ...app,
              fullData: data.application
            });
            setShowModal(true);
            return;
          }
        }
      }
      
      // Fallback to existing data if fetch fails
      setSelectedApplication(app);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching application details:', error);
      // Fallback to existing data
      setSelectedApplication(app);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  // Download document function
  const downloadDocument = async (documentPath) => {
    try {
      // Extract filename from path
      const fileName = documentPath.split('/').pop().split('\\').pop();
      
      // Construct download URL
      const downloadUrl = `http://127.0.0.1:8000/${documentPath}`;
      
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none'; // Hide the anchor element
      document.body.appendChild(a);
      a.click();
      
      // Cleanup after a short delay to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading corporate services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
            Corporate Services
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage all corporate service applications</p>
        </div>
        <button
          onClick={() => setShowServiceTypeModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Apply for Corporate Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-md border-l-4 border-indigo-600">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="w-full">
              <p className="text-gray-600 text-xs sm:text-sm mb-1">Total Applications</p>
              <p className="text-2xl sm:text-4xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-indigo-100 rounded-lg sm:rounded-xl">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white"
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
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none bg-white"
          >
            <option value="all">All Services</option>
            <option value="Register New Company">Register New Company</option>
            <option value="Compliance for New Company">Compliance for New Company</option>
            <option value="Tax Audit">Tax Audit</option>
            <option value="Legal Advice">Legal Advice</option>
            <option value="Provident Fund Services">Provident Fund Services</option>
            <option value="TDS-Related Services">TDS-Related Services</option>
            <option value="GST-Related Services">GST-Related Services</option>
            <option value="Payroll Services">Payroll Services</option>
            <option value="Accounting & Bookkeeping">Accounting & Bookkeeping</option>
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
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
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
                      className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-xs"
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
                            ? 'bg-indigo-600 text-white'
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
        <div className="hidden md:block">
          {/* Table Header */}
          <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
            <div className="flex items-center gap-6 font-semibold text-gray-700 text-sm">
              <div className="w-40">ID</div>
              <div className="flex-1 min-w-[200px]">APPLICANT</div>
              <div className="flex-1 min-w-[180px]">SERVICE TYPE</div>
              <div className="w-36">CONTACT</div>
              <div className="w-36">APPLIED ON</div>
              <div className="w-32">STATUS</div>
              <div className="w-24 text-center">ACTIONS</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {currentApplications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Applications Found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              currentApplications.map((app) => (
                <div key={app.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-6 text-sm">
                  {/* ID */}
                  <div className="w-40">
                    <span className="font-mono text-gray-600 font-semibold text-xs">{app.id}</span>
                  </div>
                  
                  {/* Applicant */}
                  <div className="flex-1 min-w-[200px]">
                    <div>
                      <p className="font-semibold text-gray-800">{app.applicantName}</p>
                      <p className="text-xs text-gray-500 truncate">{app.applicantEmail}</p>
                    </div>
                  </div>
                  
                  {/* Service Type */}
                  <div className="flex-1 min-w-[180px]">
                    <span className="text-gray-700">{app.serviceType}</span>
                  </div>
                  
                  {/* Contact */}
                  <div className="w-36">
                    <span className="text-gray-700">{app.contact}</span>
                  </div>
                  
                  {/* Applied On */}
                  <div className="w-36">
                    <span className="text-gray-600 text-xs">{app.appliedOn}</span>
                  </div>
                  
                  {/* Status */}
                  <div className="w-32">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="w-24 flex justify-center">
                    <button
                      onClick={() => handleViewApplication(app)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                            ? 'bg-indigo-600 text-white shadow-md'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 rounded-t-xl flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Your Application Details</h2>
                <p className="text-indigo-100 text-sm mt-1">Application ID: {selectedApplication.id}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-indigo-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedApplication.status)} shadow-md`}>
                  {selectedApplication.status}
                </span>
              </div>

              {/* Application Information - Display all fields dynamically */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-200">
                <h3 className="text-base font-bold text-indigo-900 mb-3">Application Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Display all fields from fullData or rawData */}
                  {(() => {
                    const data = selectedApplication.fullData || selectedApplication.rawData || selectedApplication;
                    const excludeFields = ['_id', 'user_id', 'created_at', 'updated_at', 'documents', 'application_id'];
                    const fieldLabels = {
                      'full_name': 'Full Name',
                      'name': 'Name',
                      'email': 'Email',
                      'phone': 'Phone',
                      'pan_number': 'PAN Number',
                      'proposed_company_name': 'Proposed Company Name',
                      'company_name': 'Company Name',
                      'company_type': 'Company Type',
                      'number_of_directors': 'Number of Directors',
                      'registration_state': 'Registration State',
                      'address': 'Address',
                      'city': 'City',
                      'state': 'State',
                      'pincode': 'Pincode',
                      'cin': 'CIN',
                      'compliance_type': 'Compliance Type',
                      'registration_date': 'Registration Date',
                      'business_name': 'Business Name',
                      'turnover': 'Turnover',
                      'audit_type': 'Audit Type',
                      'financial_year': 'Financial Year',
                      'legal_issue_type': 'Legal Issue Type',
                      'case_description': 'Case Description',
                      'urgency': 'Urgency',
                      'company_pan': 'Company PAN',
                      'number_of_employees': 'Number of Employees',
                      'existing_pf_number': 'Existing PF Number',
                      'existing_esi_number': 'Existing ESI Number',
                      'service_required': 'Service Required',
                      'tan_number': 'PAN Number',
                      'service_type': 'Service Type',
                      'quarter_year': 'Quarter/Year',
                      'gstin': 'GSTIN',
                      'industry_type': 'Industry Type',
                      'gst_number': 'GST Number',
                      'pf_number': 'PF Number',
                      'esi_number': 'ESI Number',
                      'business_type': 'Business Type',
                      'number_of_transactions': 'Number of Transactions',
                      'status': 'Status'
                    };
                    
                    return Object.entries(data)
                      .filter(([key, value]) => !excludeFields.includes(key) && value !== null && value !== undefined && value !== '')
                      .map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-500 font-semibold uppercase mb-1">
                            {fieldLabels[key] || key.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-gray-900 font-medium text-sm break-words">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </p>
                        </div>
                      ));
                  })()}
                  
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">APPLICATION DATE</p>
                    <p className="text-gray-900 font-bold text-base">{selectedApplication.appliedOn}</p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Section */}
              {(() => {
                const data = selectedApplication.fullData || selectedApplication.rawData || selectedApplication;
                const documents = data.documents || {};
                const hasDocuments = documents && typeof documents === 'object' && Object.keys(documents).length > 0;
                
                return (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Uploaded Documents
                    </h3>
                    {hasDocuments ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          {Object.entries(documents).map(([docKey, docPath], index) => {
                            if (!docPath || typeof docPath !== 'string') return null;
                            const docName = docPath.split('\\').pop().split('/').pop();
                            const displayName = docKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            
                            return (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-indigo-50 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-gray-900 block">{displayName}</span>
                                    <span className="text-xs text-gray-500 block truncate">{docName}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => downloadDocument(docPath)}
                                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ml-2 flex-shrink-0"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-600">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>No documents uploaded for this application</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Close Button */}
              <div className="pt-3 border-t">
                <button
                  onClick={closeModal}
                  className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Service Type Selection Modal */}
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
                Select Corporate Service
              </h3>
              <p className="text-sm sm:text-base text-gray-600">Choose the corporate service you need for your business</p>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { name: 'Register New Company', icon: Building, route: '/services', color: 'from-indigo-500 to-indigo-600', desc: 'Company registration services' },
                  { name: 'Compliance for New Company', icon: FileText, route: '/services', color: 'from-blue-500 to-blue-600', desc: 'Legal compliance support' },
                  { name: 'Tax Audit', icon: Calculator, route: '/services', color: 'from-purple-500 to-purple-600', desc: 'Professional tax auditing' },
                  { name: 'Legal Advice', icon: Scale, route: '/services', color: 'from-orange-500 to-orange-600', desc: 'Legal consultation services' },
                  { name: 'Provident Fund Services', icon: Shield, route: '/services', color: 'from-green-500 to-green-600', desc: 'PF management & filing' },
                  { name: 'TDS-Related Services', icon: Receipt, route: '/services', color: 'from-teal-500 to-teal-600', desc: 'TDS filing & compliance' },
                  { name: 'GST-Related Services', icon: FileText, route: '/services', color: 'from-pink-500 to-pink-600', desc: 'GST registration & filing' },
                  { name: 'Payroll Services', icon: Users, route: '/services', color: 'from-red-500 to-red-600', desc: 'Payroll processing' },
                  { name: 'Accounting & Bookkeeping', icon: BookOpen, route: '/services', color: 'from-cyan-500 to-cyan-600', desc: 'Complete accounting services' },
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setShowServiceTypeModal(false);
                      setSelectedServiceType(service.name);
                      setShowServiceFormPopup(true);
                    }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-200 hover:border-indigo-500 rounded-lg sm:rounded-xl transition-all group hover:shadow-lg active:scale-95"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-indigo-700 truncate">{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{service.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Form Popup */}
      {showServiceFormPopup && (
        <CorporateServiceFormPopup
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
export default CorporateServices;