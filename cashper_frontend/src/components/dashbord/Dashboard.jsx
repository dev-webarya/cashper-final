import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardOverview from './DashboardOverview';
import LoanManagement from './LoanManagement';
import InsuranceManagement from './InsuranceManagement';
import InvestmentManagement from './InvestmentManagement';
import TaxPlanning from './TaxPlanning';
import RetailServices from './RetailServices';
import CorporateServices from './CorporateServices';
import CalculatorManagement from './CalculatorManagement';
import UserProfile from './UserProfile';
import ChangePassword from './ChangePassword';
import AllNotifications from './AllNotifications';
import { getCurrentUser, isAuthenticated } from '../../services/api';
import { getMyDocuments, uploadDocument, deleteDocument, submitSupportRequest } from '../../services/dashboardApi';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [userData, setUserData] = useState({
    name: 'Sudha',
    email: 'john.doe@example.com',
    initials: 'SD',
    profileImage: null
  });
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const hasFetchedUser = useRef(false); // Track if user data has been fetched

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Check if admin trying to access regular dashboard - redirect to admin panel
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.isAdmin === true) {
          navigate('/admin');
          return;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Prevent duplicate API calls
    if (hasFetchedUser.current) {
      return;
    }

    // Fetch user data from backend API
    const fetchUserData = async () => {
      try {
        hasFetchedUser.current = true; // Mark as fetched before calling API
        const user = await getCurrentUser();
        setUserData({
          name: user.fullName || 'User',
          email: user.email || 'user@example.com',
          initials: getInitials(user.fullName || 'User'),
          profileImage: user.profileImage || null,
          phone: user.phone || '',
          isEmailVerified: user.isEmailVerified || false,
          isPhoneVerified: user.isPhoneVerified || false,
          // Add complete profile data for UserProfile component
          address: user.address || '',
          panCard: user.panCard || '',
          aadhar: user.aadhar || '',
          dateOfBirth: user.dateOfBirth || '',
          occupation: user.occupation || '',
          annualIncome: user.annualIncome || ''
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        hasFetchedUser.current = false; // Reset on error so it can retry
        // If token is invalid, redirect to login
        navigate('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Update userData when profile changes
  const handleProfileUpdate = (updatedData) => {
    const newUserData = { ...userData, ...updatedData };
    setUserData(newUserData);
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  // Sync activeView with URL path
  useEffect(() => {
    const path = location.pathname;
    
    if (path.startsWith('/calculators') || path === '/dashboard/calculators') {
      setActiveView('calculators');
    } else if (path === '/dashboard/overview' || path === '/dashboard') {
      setActiveView('overview');
    } else if (path === '/dashboard/loans') {
      setActiveView('loans');
    } else if (path === '/dashboard/insurance') {
      setActiveView('insurance');
    } else if (path === '/dashboard/investments') {
      setActiveView('investments');
    } else if (path === '/dashboard/tax') {
      setActiveView('tax');
    } else if (path === '/dashboard/retail-services') {
      setActiveView('retail-services');
    } else if (path === '/dashboard/corporate-services') {
      setActiveView('corporate-services');
    } else if (path === '/dashboard/profile/edit') {
      setActiveView('profile-edit');
    } else if (path === '/dashboard/profile') {
      setActiveView('profile');
    } else if (path === '/dashboard/settings') {
      setActiveView('change-password');
    } else if (path === '/dashboard/notifications') {
      setActiveView('all-notifications');
    } else if (path === '/dashboard/documents') {
      setActiveView('documents');
    } else if (path === '/dashboard/support') {
      setActiveView('support');
    }
  }, [location]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <DashboardOverview setActiveView={setActiveView} />;
      case 'loans':
        return <LoanManagement />;
      case 'insurance':
        return <InsuranceManagement />;
      case 'investments':
        return <InvestmentManagement />;
      case 'tax':
        return <TaxPlanning />;
      case 'retail-services':
        return <RetailServices />;
      case 'corporate-services':
        return <CorporateServices />;
      case 'calculators':
        return <CalculatorManagement />;
      case 'profile':
        return <UserProfile userData={userData} setUserData={setUserData} onProfileUpdate={handleProfileUpdate} showEditButton={false} />;
      case 'profile-edit':
        return <UserProfile userData={userData} setUserData={setUserData} onProfileUpdate={handleProfileUpdate} showEditButton={true} />;
      case 'change-password':
        return <ChangePassword setActiveView={setActiveView} />;
      case 'all-notifications':
        return <AllNotifications />;
      case 'documents':
        return <DocumentsView />;
      case 'support':
        return <ContactSupportView />;
      
      default:
        return <DashboardOverview />;
    }
  };

  // Placeholder Components for New Views
  const NotificationsView = () => (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Notifications</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          {[
            { title: 'Loan Approved', message: 'Your personal loan application has been approved!', time: '2 hours ago', type: 'success' },
            { title: 'Insurance Renewal', message: 'Your health insurance policy is due for renewal in 15 days', time: '1 day ago', type: 'warning' },
            { title: 'EMI Payment Due', message: 'Your Home Loan EMI payment is due on Jan 5', time: '2 days ago', type: 'alert' }
          ].map((notif, i) => (
            <div key={i} className={`p-4 rounded-lg border-l-4 ${
              notif.type === 'success' ? 'bg-green-50 border-green-500' :
              notif.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-red-50 border-red-500'
            }`}>
              <h3 className="font-bold text-gray-800">{notif.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DocumentsView = () => {
    const [documents, setDocuments] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const fileInputRef = React.useRef(null);

    // Fetch documents on component mount
    React.useEffect(() => {
      fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMyDocuments();
        setDocuments(response.documents || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    const handleUploadClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileSelect = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        setTimeout(() => setError(''), 5000);
        e.target.value = '';
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 10MB');
        setTimeout(() => setError(''), 5000);
        e.target.value = '';
        return;
      }

      setUploading(true);
      setError('');
      setSuccess('');

      try {
        const documentType = file.name.replace(/\.[^/.]+$/, '');
        await uploadDocument(file, documentType, 'general');

        setSuccess('✅ Document uploaded successfully!');
        setTimeout(() => setSuccess(''), 5000);
        
        // Refresh documents list
        await fetchDocuments();
        
        // Reset file input
        e.target.value = '';
      } catch (err) {
        console.error('Error uploading document:', err);
        setError(err.response?.data?.detail || 'Failed to upload document');
        setTimeout(() => setError(''), 5000);
      } finally {
        setUploading(false);
      }
    };

    const handleViewDocument = (doc) => {
      // Open document in new tab
      const fullUrl = `http://127.0.0.1:8000${doc.fileUrl}`;
      window.open(fullUrl, '_blank');
    };

    const handleDeleteDocument = async (docId) => {
      if (!window.confirm('Are you sure you want to delete this document?')) {
        return;
      }

      try {
        await deleteDocument(docId);

        setSuccess('✅ Document deleted successfully!');
        setTimeout(() => setSuccess(''), 5000);
        
        // Refresh documents list
        await fetchDocuments();
      } catch (err) {
        console.error('Error deleting document:', err);
        setError(err.response?.data?.detail || 'Failed to delete document');
        setTimeout(() => setError(''), 5000);
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideInRight max-w-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="fixed top-20 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideInRight max-w-md">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">My Documents</h1>
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload New'}
          </button>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && documents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-600">No documents uploaded yet</p>
            <p className="mt-2 text-sm text-gray-500">Click "Upload New" to add your first document</p>
          </div>
        )}
        
        {/* Documents Grid - Fully Responsive */}
        {!loading && documents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate" title={doc.fileName}>
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex gap-2">
                  <button 
                    onClick={() => handleViewDocument(doc)}
                    className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileSelect}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          className="hidden"
        />
      </div>
    );
  };



  const ContactSupportView = () => {
    const [supportForm, setSupportForm] = React.useState({
      name: userData.name || '',
      email: userData.email || '',
      phone: '',
      issue: ''
    });
    const [supportErrors, setSupportErrors] = React.useState({});
    const [supportLoading, setSupportLoading] = React.useState(false);
    const [supportSuccess, setSupportSuccess] = React.useState('');

    // Pre-fill form with user data
    React.useEffect(() => {
      setSupportForm(prev => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email
      }));
    }, [userData]);

    const validateSupportForm = () => {
      const errors = {};

      // Name validation
      if (!supportForm.name.trim()) {
        errors.name = 'Name is required';
      } else if (supportForm.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(supportForm.name)) {
        errors.name = 'Name should only contain letters';
      }

      // Email validation
      if (!supportForm.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportForm.email)) {
        errors.email = 'Please enter a valid email address';
      }

      // Phone validation
      if (!supportForm.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(supportForm.phone.replace(/\s/g, ''))) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }

      // Issue validation
      if (!supportForm.issue.trim()) {
        errors.issue = 'Please describe your issue';
      } else if (supportForm.issue.trim().length < 10) {
        errors.issue = 'Issue description must be at least 10 characters';
      } else if (supportForm.issue.trim().length > 500) {
        errors.issue = 'Issue description must not exceed 500 characters';
      }

      return errors;
    };

    const handleSupportSubmit = async (e) => {
      e.preventDefault();
      const errors = validateSupportForm();
      setSupportErrors(errors);

      if (Object.keys(errors).length === 0) {
        setSupportLoading(true);
        
        try {
          await submitSupportRequest({
            name: supportForm.name,
            email: supportForm.email,
            phone: supportForm.phone,
            issue: supportForm.issue
          });

          setSupportLoading(false);
          setSupportSuccess('✅ Your support request has been submitted successfully! Our team will contact you within 24-48 hours.');
          setSupportForm(prev => ({ ...prev, phone: '', issue: '' }));
          setTimeout(() => setSupportSuccess(''), 5000);
        } catch (err) {
          setSupportLoading(false);
          console.error('Error submitting support request:', err);
          setSupportErrors({ 
            submit: err.response?.data?.detail || 'Failed to submit support request. Please try again.' 
          });
        }
      }
    };

    const handleInputChange = (field, value) => {
      // Phone number validation - only numbers
      if (field === 'phone') {
        value = value.replace(/[^0-9]/g, '').slice(0, 10);
      }
      
      setSupportForm(prev => ({ ...prev, [field]: value }));
      if (supportErrors[field]) {
        setSupportErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    return (
      <div className="space-y-6">
        {supportSuccess && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideInRight max-w-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-semibold">{supportSuccess}</span>
          </div>
        )}
        
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Contact Support</h1>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSupportSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={supportForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      supportErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {supportErrors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {supportErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email *</label>
                  <input 
                    type="email" 
                    placeholder="example@email.com" 
                    value={supportForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      supportErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {supportErrors.email && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {supportErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    placeholder="10 digit mobile number" 
                    value={supportForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    maxLength={10}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                      supportErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {supportErrors.phone && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {supportErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                {/* Issue Field */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe Your Issue * 
                    <span className="text-xs text-gray-500 ml-2">({supportForm.issue.length}/500)</span>
                  </label>
                  <textarea 
                    placeholder="Please provide detailed information about your issue..." 
                    rows="6" 
                    value={supportForm.issue}
                    onChange={(e) => handleInputChange('issue', e.target.value)}
                    maxLength={500}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all resize-none ${
                      supportErrors.issue ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                    }`}
                  />
                  {supportErrors.issue && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {supportErrors.issue}
                    </p>
                  )}
                </div>

                {/* Submit Error Display */}
                {supportErrors.submit && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-semibold text-red-700">{supportErrors.submit}</p>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={supportLoading}
                  className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {supportLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Other Ways to Reach Us</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-semibold text-gray-800">info@cashper.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="text-sm font-semibold text-gray-800">6200755759<br/>7393080847</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-600">Hours</p>
                  <p className="text-sm font-semibold text-gray-800">Mon-Sun: 9 AM - 6 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-Width Header/Navbar at Top */}
      <DashboardHeader 
        toggleSidebar={toggleSidebar} 
        setActiveView={setActiveView}
        userData={userData}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex relative">
        {/* Sidebar - Below Navbar */}
        <DashboardSidebar 
          isOpen={isSidebarOpen}
          activeView={activeView}
          setActiveView={setActiveView}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 xs:p-4 sm:p-6 lg:p-8 max-w-full min-h-[calc(100vh-64px)]">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar - Removed to keep background visible */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={toggleSidebar}
          style={{ marginTop: '64px' }} // Below navbar
        />
      )}
    </div>
  );
};

export default Dashboard;
