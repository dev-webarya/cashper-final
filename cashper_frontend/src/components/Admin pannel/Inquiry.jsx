import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Search,
  Users,
  TrendingUp
} from 'lucide-react';

const Inquiry = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });
  const itemsPerPage = 8;
  // Format service type for display
  const formatServiceType = (serviceType) => {
    if (!serviceType) return 'Retail Application';
    // Convert kebab-case to Title Case
    return serviceType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Check if token exists
      if (!token) {
        console.error('No token found in localStorage. User may not be logged in.');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Fetching with token:', token.substring(0, 20) + '...');
      
      // Fetch all inquiries from unified endpoint
      const response = await fetch(
        'http://localhost:8000/api/admin/inquiries/all',
        { headers }
      );

      let inquiriesList = [];
      
      if (response.ok) {
        const data = await response.json();
        inquiriesList = data.data || [];
      } else {
        console.error('Failed to fetch inquiries:', response.status, response.statusText);
      }
      // Fetch contact form submissions
      try {
        const contactResponse = await fetch(
          'http://localhost:8000/api/contact/submissions?skip=0&limit=100',
          { headers }
        );
        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          const contactSubmissions = contactData.data || [];
          console.log('Fetched contact submissions:', contactSubmissions.length);
          
          contactSubmissions.forEach(submission => {
            // Check if not already in the list
            if (!inquiriesList.find(i => i.id === submission.id)) {
              inquiriesList.push({
                id: submission.id,
                _id: submission.id,
                name: submission.name || 'N/A',
                email: submission.email || 'N/A',
                phone: submission.phone || 'N/A',
                income: 'N/A',
                amount: 'N/A',
                status: (submission.status || 'pending').toLowerCase(),
                createdAt: submission.createdAt,
                message: submission.message,
                subject: submission.subject,
                type: 'Contact Form',
                productType: 'Contact Form'
              });
            }
          });
        } else {
          console.error('Failed to fetch contact submissions:', contactResponse.status, contactResponse.statusText);
          const errorData = await contactResponse.json().catch(() => ({}));
          console.error('Error details:', errorData);
        }
      } catch (error) {
        console.warn('Error fetching contact submissions:', error);
      }

      // Also fetch personal tax consultations directly
      try {
        const ptResponse = await fetch(
          'http://localhost:8000/api/personal-tax/consultation/all?skip=0&limit=100',
          { headers }
        );
        if (ptResponse.ok) {
          const ptData = await ptResponse.json();
          const ptConsultations = Array.isArray(ptData) ? ptData : (ptData.data || []);
          console.log('Fetched personal tax consultations:', ptConsultations.length);
          
          ptConsultations.forEach(consultation => {
            // Check if not already in the list
            if (!inquiriesList.find(i => i.id === String(consultation._id))) {
              inquiriesList.push({
                id: String(consultation._id),
                _id: String(consultation._id),
                name: consultation.name || 'N/A',
                email: consultation.email || 'N/A',
                phone: consultation.phone || 'N/A',
                income: consultation.income || 'N/A',
                amount: consultation.income || 'N/A',
                status: (consultation.status || 'pending').toLowerCase(),
                createdAt: consultation.createdAt,
                message: `Income Range: ${consultation.income || 'N/A'}, Tax Regime: ${consultation.taxRegime || 'N/A'}`,
                type: 'Personal Tax Planning',
                productType: 'Personal Tax Planning'
              });
            }
          });
        } else {
          console.error('Failed to fetch personal tax consultations:', ptResponse.status, ptResponse.statusText);
        }
      } catch (error) {
        console.warn('Error fetching personal tax consultations:', error);
      }

      // Also fetch business tax consultations directly
      try {
        const btResponse = await fetch(
          'http://localhost:8000/api/business-tax/consultation/all?skip=0&limit=100',
          { headers }
        );
        if (btResponse.ok) {
          const btData = await btResponse.json();
          const btConsultations = Array.isArray(btData) ? btData : (btData.data || []);
          console.log('Fetched business tax consultations:', btConsultations.length);
          
          btConsultations.forEach(consultation => {
            // Check if not already in the list
            if (!inquiriesList.find(i => i.id === String(consultation._id))) {
              inquiriesList.push({
                id: String(consultation._id),
                _id: String(consultation._id),
                name: consultation.ownerName || 'N/A',
                email: consultation.email || 'N/A',
                phone: consultation.phone || 'N/A',
                income: consultation.annualTurnover || 'N/A',
                amount: consultation.annualTurnover || 'N/A',
                status: (consultation.status || 'pending').toLowerCase(),
                createdAt: consultation.createdAt,
                message: `Business: ${consultation.businessName || 'N/A'}, Type: ${consultation.businessType || 'N/A'}, Turnover: ${consultation.annualTurnover || 'N/A'}`,
                type: 'Business Tax Strategy',
                productType: 'Business Tax Strategy'
              });
            }
          });
        } else {
          console.error('Failed to fetch business tax consultations:', btResponse.status, btResponse.statusText);
        }
      } catch (error) {
        console.warn('Error fetching business tax consultations:', error);
      }

      // Fetch Corporate Inquiries
      try {
        const corpResponse = await fetch(
          'http://localhost:8000/api/corporate-inquiry/admin/inquiries?limit=100',
          { headers }
        );
        if (corpResponse.ok) {
          const corpData = await corpResponse.json();
          const corpInquiries = Array.isArray(corpData) ? corpData : [];
          console.log('Fetched corporate inquiries:', corpInquiries.length);
          
          corpInquiries.forEach(inquiry => {
            if (!inquiriesList.find(i => i.id === inquiry.id)) {
              // Format service type for display (e.g., "register-company" -> "Register Company")
              const formattedServiceType = formatServiceType(inquiry.serviceType);
              
              // Create detailed message with company name if available
              let displayMessage = inquiry.message || '';
              if (inquiry.companyName) {
                displayMessage = `Company: ${inquiry.companyName}${displayMessage ? ' - ' + displayMessage : ''}`;
              }
              if (!displayMessage) {
                displayMessage = `Inquiry for ${formattedServiceType} service`;
              }
              
              inquiriesList.push({
                id: inquiry.id,
                _id: inquiry.id,
                inquiryId: inquiry.inquiryId || '',
                name: inquiry.name || 'N/A',
                email: inquiry.email || 'N/A',
                phone: inquiry.phone || 'N/A',
                income: 'N/A',
                amount: 'N/A',
                status: (inquiry.status === 'new' || !inquiry.status) ? 'pending' : inquiry.status.toLowerCase(),
                createdAt: inquiry.createdAt,
                message: displayMessage,
                companyName: inquiry.companyName || '',
                serviceType: inquiry.serviceType || '',
                type: formattedServiceType,
                productType: formattedServiceType
              });
            }
          });
        } else {
          console.error('Failed to fetch corporate inquiries:', corpResponse.status);
        }
      } catch (error) {
        console.warn('Error fetching corporate inquiries:', error);
      }

      // Fetch Retail Applications
      try {
        const appResponse = await fetch(
          'http://localhost:8000/api/applications/admin/inquiries?limit=100',
          { headers }
        );
        if (appResponse.ok) {
          const appData = await appResponse.json();
          const appInquiries = Array.isArray(appData) ? appData : [];
          console.log('Fetched retail applications:', appInquiries.length);
          
          appInquiries.forEach(inquiry => {
            if (!inquiriesList.find(i => i.id === inquiry.id)) {
              const formattedServiceType = formatServiceType(inquiry.serviceType);
              const defaultMessage = inquiry.message || `New application for ${formattedServiceType} service. Awaiting review.`;
              
              inquiriesList.push({
                id: inquiry.id,
                _id: inquiry.id,
                name: inquiry.name || 'N/A',
                email: inquiry.email || 'N/A',
                phone: inquiry.phone || 'N/A',
                income: 'N/A',
                amount: 'N/A',
                status: (inquiry.status === 'new' || !inquiry.status) ? 'pending' : inquiry.status.toLowerCase(),
                createdAt: inquiry.createdAt,
                message: defaultMessage,
                serviceType: inquiry.serviceType || '',
                type: formattedServiceType,
                productType: formattedServiceType
              });
            }
          });
        } else {
          console.error('Failed to fetch retail applications:', appResponse.status);
        }
      } catch (error) {
        console.warn('Error fetching retail applications:', error);
      }
      
      console.log('Fetched inquiries:', inquiriesList);
      console.log('Total count:', inquiriesList.length);
      
      // Format inquiries with necessary fields
      const formatted = inquiriesList.map(inquiry => ({
        id: inquiry.id || inquiry._id,
        _id: inquiry.id || inquiry._id,
        name: inquiry.name || 'N/A',
        email: inquiry.email || 'N/A',
        phone: inquiry.phone || 'N/A',
        income: inquiry.amount || inquiry.loan_amount || inquiry.insurance_amount || 'N/A',
        status: (inquiry.status || 'pending').toLowerCase(),
        createdAt: inquiry.createdAt || inquiry.created_at || new Date().toISOString(),
        message: inquiry.message || inquiry.description || '',
        subject: inquiry.subject || '',
        type: inquiry.type || inquiry.productType || 'Contact Form',
        productType: inquiry.type || inquiry.productType || 'Contact Form'
      }));

      console.log('Formatted inquiries:', formatted);
      console.log('Status breakdown:', {
        total: formatted.length,
        pending: formatted.filter(c => c.status === 'pending').length,
        confirmed: formatted.filter(c => c.status === 'confirmed').length,
        completed: formatted.filter(c => c.status === 'completed').length
      });

      setConsultations(formatted);
      updateStats(formatted);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (consultationsList) => {
    const pending = consultationsList.filter(c => c.status === 'pending').length;
    const confirmed = consultationsList.filter(c => c.status === 'confirmed').length;
    const completed = consultationsList.filter(c => c.status === 'completed').length;
    
    setStats({
      total: pending + confirmed + completed,
      pending: pending,
      confirmed: confirmed,
      completed: completed
    });
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.phone.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    
    // Enhanced type matching - check both productType and type fields
    const consultationType = consultation.productType || consultation.type || 'Contact Form';
    const matchesType = filterType === 'all' || 
                        consultationType === filterType || 
                        consultationType.toLowerCase() === filterType.toLowerCase() ||
                        (consultation.serviceType && formatServiceType(consultation.serviceType) === filterType);
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConsultations = filteredConsultations.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' },
      confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
      completed: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
      in_progress: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600' },
      resolved: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
      closed: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: 'text-gray-600' },
      cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' }
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (consultationId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Find the consultation to get its type
      const consultation = consultations.find(c => c.id === consultationId);
      if (!consultation) {
        console.error('Consultation not found');
        return;
      }
      
      const inquiryType = consultation.productType || consultation.type || 'Contact Form';
      
      // Call backend API to update status
      const response = await fetch(
        'http://localhost:8000/api/admin/inquiries/' + consultationId + '/status',
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: newStatus,
            inquiry_type: inquiryType
          })
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log('Status update response:', result);
        
        // Update locally after successful backend update
        const updatedConsultations = consultations.map(c => 
          c.id === consultationId ? { ...c, status: newStatus } : c
        );
        setConsultations(updatedConsultations);
        updateStats(updatedConsultations);
        
        // Update selected consultation if modal is open
        if (selectedConsultation && selectedConsultation.id === consultationId) {
          setSelectedConsultation({ ...selectedConsultation, status: newStatus });
        }
        
        // Show success message
        const successMsg = `Inquiry ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'completed' ? 'marked as completed' : newStatus === 'cancelled' ? 'cancelled' : 'updated'} successfully!`;
        console.log(successMsg);
      } else {
        console.error('Failed to update status:', response.status, await response.text());
        // Show error but keep local state
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error by refetching
      fetchConsultations();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 md:py-8 lg:py-12 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-6">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Calendar className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600 flex-shrink-0" />
                <span className="truncate">Inquiry</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 truncate">Manage and track all inquiry requests</p>
            </div>
            <button
              onClick={fetchConsultations}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 whitespace-nowrap touch-manipulation"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 md:p-4 lg:p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm font-medium truncate">Total</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 md:mt-2">{stats.total}</p>
              </div>
              <Users className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-blue-500 opacity-20 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 md:p-4 lg:p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm font-medium truncate">Pending</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 md:mt-2">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-yellow-500 opacity-20 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 md:p-4 lg:p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm font-medium truncate">Confirmed</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 md:mt-2">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-indigo-500 opacity-20 flex-shrink-0" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 md:p-4 lg:p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 md:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm font-medium truncate">Completed</p>
                <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1 md:mt-2">{stats.completed}</p>
              </div>
              <TrendingUp className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-green-500 opacity-20 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-2.5 sm:p-3 md:p-4 lg:p-6 mb-4 sm:mb-6 md:mb-8 overflow-visible">
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 overflow-visible">
            {/* Search Input - Full width on mobile */}
            <div className="relative w-full sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 sm:pl-9 md:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all touch-manipulation placeholder:text-gray-400"
              />
            </div>

            {/* Status Filter - Full width on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 relative w-full">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 min-w-0 px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white cursor-pointer transition-all touch-manipulation font-medium"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.25rem" }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Product Type Filter - Full width on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 relative w-full sm:col-span-2 lg:col-span-1">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 min-w-0 px-2.5 sm:px-3 md:px-4 py-2.5 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white cursor-pointer transition-all touch-manipulation font-medium"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.25rem" }}
              >
                <option value="all">All Products</option>
                
                {/* Loan Services */}
                <optgroup label="💰 Loan Services">
                  <option value="Short Term Loan">Short Term Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Business Loan">Business Loan</option>
                </optgroup>

                {/* Insurance Services */}
                <optgroup label="🛡️ Insurance Services">
                  <option value="Term Insurance">Term Insurance</option>
                  <option value="Health Insurance">Health Insurance</option>
                  <option value="Motor Insurance">Motor Insurance</option>
                </optgroup>

                {/* Investment Services */}
                <optgroup label="📈 Investment Services">
                  <option value="SIP">SIP</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                </optgroup>

                {/* Tax Services */}
                <optgroup label="📋 Tax Services">
                  <option value="Personal Tax Planning">Personal Tax Planning</option>
                  <option value="Business Tax Strategy">Business Tax Strategy</option>
                </optgroup>

                {/* Retail Services */}
                <optgroup label="🏪 Retail Services">
                  <option value="File Itr">File ITR</option>
                  <option value="Revise Itr">Revise ITR</option>
                  <option value="Reply Itr Notice">Reply to ITR Notice</option>
                  <option value="Apply Individual Pan">Apply Individual PAN</option>
                  <option value="Apply Huf Pan">Apply HUF PAN</option>
                  <option value="Withdraw Pf">Withdraw PF</option>
                  <option value="Update Aadhaar Pan">Update Aadhaar/PAN</option>
                  <option value="Online Trading Demat">Online Trading & Demat</option>
                  <option value="Bank Account">Bank Account Services</option>
                  <option value="Financial Planning">Financial Planning</option>
                </optgroup>

                {/* Corporate Services */}
                <optgroup label="🏢 Corporate Services">
                  <option value="Register Company">Register Company</option>
                  <option value="Compliance New Company">Compliance New Company</option>
                  <option value="Tax Audit">Tax Audit</option>
                  <option value="Tds Services">Tds Services</option>
                  <option value="Gst Services">Gst Services</option>
                  <option value="Legal Advice">Legal Advice</option>
                  <option value="Provident Fund">Provident Fund</option>
                  <option value="Payroll Services">Payroll Services</option>
                  <option value="Accounting Bookkeeping">Accounting Bookkeeping</option>
                  <option value="Corporate Inquiry">Corporate Inquiry</option>
                </optgroup>

                {/* Contact */}
                <optgroup label="📞 Other">
                  <option value="Contact Form">Contact Form</option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        {/* Consultations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600 font-medium">Loading consultations...</p>
              </div>
            </div>
          ) : paginatedConsultations.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">No consultations found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            paginatedConsultations.map(consultation => {
              const statusColor = getStatusColor(consultation.status);
              return (
                <div key={consultation.id} className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg active:shadow-xl transition-all overflow-hidden touch-manipulation">
                  {/* Card Header */}
                  <div className={`${statusColor.bg} border-b-2 ${statusColor.border} p-2.5 sm:p-3 md:p-4`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">{consultation.name}</h3>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">{consultation.productType || 'Contact Form'}</p>
                      </div>
                      <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full ${statusColor.bg} border ${statusColor.border} flex-shrink-0`}>
                        <span className={statusColor.icon}>{getStatusIcon(consultation.status)}</span>
                        <span className={`text-xs sm:text-sm font-semibold ${statusColor.text} whitespace-nowrap`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-2.5 sm:p-3 md:p-4 lg:p-6 space-y-2 sm:space-y-3 md:space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-gray-700">
                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm truncate">{consultation.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-gray-700">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm">{consultation.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 text-gray-700">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                        <span className="text-[10px] xs:text-xs sm:text-sm">{formatDate(consultation.createdAt)}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 md:pt-4 border-t border-gray-200">
                      <div className="min-w-0">
                        <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Product/Service</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 sm:mt-1 truncate">{consultation.productType || 'Contact'}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Amount/Value</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 sm:mt-1 truncate">{consultation.income || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Message */}
                    {consultation.message && (
                      <div className="bg-gray-50 p-2 sm:p-2.5 md:p-3 rounded-lg">
                        <p className="text-[10px] xs:text-xs text-gray-600 font-medium mb-0.5 sm:mb-1">Message</p>
                        <p className="text-[10px] xs:text-xs sm:text-sm text-gray-700 line-clamp-2">{consultation.message}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="border-t border-gray-200 p-2 sm:p-3 md:p-4 bg-gray-50 flex flex-col xs:flex-row gap-2">
                    <button
                      onClick={() => {
                        setSelectedConsultation(consultation);
                        setShowDetails(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-3 py-2 sm:py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-all text-xs sm:text-sm font-medium touch-manipulation"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>View Details</span>
                    </button>
                    {(consultation.status === 'pending' || consultation.status === 'new') && (
                      <button
                        onClick={() => handleStatusUpdate(consultation.id, 'confirmed')}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-3 py-2 sm:py-2.5 text-green-600 bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-lg transition-all text-xs sm:text-sm font-medium touch-manipulation"
                      >
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Confirm</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filteredConsultations.length > 0 && (
          <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(startIndex + itemsPerPage, filteredConsultations.length)}</span> of{' '}
              <span className="font-semibold">{filteredConsultations.length}</span> results
            </p>
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation font-medium"
              >
                Prev
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNumber = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`min-w-[2rem] h-8 px-2 sm:min-w-[2.5rem] sm:h-10 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                      currentPage === pageNumber
                        ? 'bg-green-600 text-white shadow-md'
                        : 'border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedConsultation && (
          <div
            className="fixed inset-0  flex items-center justify-center p-2 xs:p-3 sm:p-4 z-50 overflow-y-auto"
            onClick={() => setShowDetails(false)}
          >
            <div
              className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] my-auto overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 sm:p-4 md:p-5 lg:p-6 sticky top-0 z-10 rounded-t-lg sm:rounded-t-xl">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">Inquiry Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 active:bg-opacity-30 p-1.5 sm:p-2 rounded-lg transition-all touch-manipulation flex-shrink-0 text-xl sm:text-2xl leading-none"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4 bg-gray-50 p-2.5 sm:p-3 md:p-4 rounded-lg">
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Full Name</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1 truncate">{selectedConsultation.name}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Email</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1 truncate">{selectedConsultation.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Phone Number</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1">{selectedConsultation.phone}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Amount/Value</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1">{selectedConsultation.income || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Inquiry Details */}
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Inquiry Details</h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4 bg-gray-50 p-2.5 sm:p-3 md:p-4 rounded-lg">
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Product/Service</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1 truncate">{selectedConsultation.productType || 'Contact Form'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Consultation Type</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1 truncate">{selectedConsultation.consultationType || 'Inquiry'}</p>
                    </div>
                    {selectedConsultation.subject && (
                      <div className="min-w-0 xs:col-span-2">
                        <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Subject</p>
                        <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1">{selectedConsultation.subject}</p>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Status</p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(selectedConsultation.status).bg} ${getStatusColor(selectedConsultation.status).border} border ${getStatusColor(selectedConsultation.status).text}`}>
                          {getStatusIcon(selectedConsultation.status)}
                          <span className="truncate">{selectedConsultation.status.charAt(0).toUpperCase() + selectedConsultation.status.slice(1)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] xs:text-xs text-gray-600 font-medium">Booked Date</p>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mt-0.5 sm:mt-1">{formatDate(selectedConsultation.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                {(selectedConsultation.confirmedDate || selectedConsultation.consultationDate) && (
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Important Dates</h3>
                    <div className="bg-blue-50 border border-blue-200 p-2.5 sm:p-3 md:p-4 rounded-lg space-y-2 sm:space-y-3">
                      {selectedConsultation.confirmedDate && (
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] xs:text-xs text-blue-600 font-medium">Confirmation Date</p>
                            <p className="text-xs sm:text-sm md:text-base font-semibold text-blue-900 truncate">{formatDate(selectedConsultation.confirmedDate)}</p>
                          </div>
                        </div>
                      )}
                      {selectedConsultation.consultationDate && (
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] xs:text-xs text-blue-600 font-medium">Scheduled Consultation</p>
                            <p className="text-xs sm:text-sm md:text-base font-semibold text-blue-900 truncate">{formatDate(selectedConsultation.consultationDate)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                {selectedConsultation.message && (
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">Message</h3>
                    <div className="bg-gray-50 p-2.5 sm:p-3 md:p-4 rounded-lg border border-gray-200">
                      <p className="text-xs sm:text-sm md:text-base text-gray-700 whitespace-pre-wrap break-words">{selectedConsultation.message}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t pt-3 sm:pt-4 md:pt-5 lg:pt-6 flex flex-col xs:flex-row gap-2 sm:gap-3">
                  {(selectedConsultation.status === 'pending' || selectedConsultation.status === 'new') && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedConsultation.id, 'confirmed');
                          setShowDetails(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all font-semibold text-xs sm:text-sm md:text-base touch-manipulation"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedConsultation.id, 'cancelled');
                          setShowDetails(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-4 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-all font-semibold text-xs sm:text-sm md:text-base touch-manipulation"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Cancel
                      </button>
                    </>
                  )}
                  {selectedConsultation.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedConsultation.id, 'completed');
                        setShowDetails(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-all font-semibold text-xs sm:text-sm md:text-base touch-manipulation"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all font-semibold text-xs sm:text-sm md:text-base touch-manipulation"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiry;
