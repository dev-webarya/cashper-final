import React, { useState, useEffect } from 'react';
import { X, Upload, Check, AlertCircle, Lock, Shield, Trash2, Edit, Eye, EyeOff, FileText, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile } from '../../services/api';
import { toast } from 'react-toastify';

const UserProfile = ({ userData, setUserData, showEditButton = false }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(showEditButton);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    documentType: '',
    file: null,
    fileName: ''
  });
  const [uploadErrors, setUploadErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState([]);
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    panCard: '',
    aadhar: '',
    dateOfBirth: '',
    occupation: '',
    annualIncome: ''
  });

  useEffect(() => {
    // Always fetch fresh data from backend
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        
        // Update userInfo with actual backend data
        setUserInfo({
          name: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          panCard: data.panCard || '',
          aadhar: data.aadhar || '',
          dateOfBirth: data.dateOfBirth || '',
          occupation: data.occupation || '',
          annualIncome: data.annualIncome || ''
        });

        // Set profile image if available
        if (data.profileImage) {
          console.log('Profile image from backend:', data.profileImage);
          setProfileImage(data.profileImage);
        } else {
          console.log('No profile image in backend response');
        }

        // Update parent component with user data including profile image
        if (setUserData) {
          setUserData({
            name: data.fullName,
            email: data.email,
            initials: getInitials(data.fullName),
            profileImage: data.profileImage || null
          });
        }

        // Fetch user documents
        const docsResponse = await fetch('http://localhost:8000/api/auth/documents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          // Map backend document format to frontend format
          const mappedDocs = docsData.map(doc => ({
            id: doc.id,
            name: doc.documentType,
            type: doc.category,
            status: doc.verificationStatus,
            uploadDate: new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            fileName: doc.fileName,
            filePath: doc.filePath
          }));
          setDocuments(mappedDocs);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        toast.error('Failed to load profile data', {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []); // Empty dependency array - run only once on mount

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateAadhar = (aadhar) => {
    const cleanAadhar = aadhar.replace(/[^0-9X]/g, '');
    return cleanAadhar.length === 12 || /^X{4}-X{4}-\d{4}$/.test(aadhar);
  };

  const validateName = (name) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
  };

  const validateAddress = (address) => {
    return address.trim().length >= 10;
  };

  const validateOccupation = (occupation) => {
    return occupation.trim().length >= 2;
  };

  const validateIncome = (income) => {
    const numIncome = parseInt(income.replace(/[^0-9]/g, ''));
    return !isNaN(numIncome) && numIncome >= 0;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateName(userInfo.name)) {
      newErrors.name = 'Name must be at least 2 characters and contain only letters';
    }

    if (!validatePhone(userInfo.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!validateAddress(userInfo.address)) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    if (!validatePAN(userInfo.panCard)) {
      newErrors.panCard = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    if (!validateAadhar(userInfo.aadhar)) {
      newErrors.aadhar = 'Invalid Aadhar format (12 digits)';
    }

    if (!validateOccupation(userInfo.occupation)) {
      newErrors.occupation = 'Occupation is required';
    }

    if (!validateIncome(userInfo.annualIncome)) {
      newErrors.annualIncome = 'Please enter a valid income amount';
    }

    if (!userInfo.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveChanges = async () => {
    if (!validateForm()) {
      setSuccessMessage('');
      return;
    }
    setLoading(true);
    try {
      // Call backend API to update profile
      const updatedProfile = await updateUserProfile({
        fullName: userInfo.name,
        phone: userInfo.phone,
        address: userInfo.address,
        panCard: userInfo.panCard,
        aadhar: userInfo.aadhar,
        dateOfBirth: userInfo.dateOfBirth,
        occupation: userInfo.occupation,
        annualIncome: userInfo.annualIncome
      });
      
      // Update local state with API response
      setUserInfo({
        name: updatedProfile.fullName,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        address: updatedProfile.address || '',
        panCard: updatedProfile.panCard || '',
        aadhar: updatedProfile.aadhar || '',
        dateOfBirth: updatedProfile.dateOfBirth || '',
        occupation: updatedProfile.occupation || '',
        annualIncome: updatedProfile.annualIncome || ''
      });
      
      // Update parent userData
      if (setUserData) {
        const updatedUser = {
          name: updatedProfile.fullName,
          email: updatedProfile.email,
          initials: getInitials(updatedProfile.fullName),
          profileImage: updatedProfile.profileImage || profileImage || null
        };
        setUserData(updatedUser);
      }
      
      setIsEditing(false);
      setErrors({});
      
      toast.success('Profile updated successfully!', {
        position: "top-center",
        autoClose: 2000,
      });
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile', {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    return numValue ? `₹${parseInt(numValue).toLocaleString('en-IN')}` : '';
  };

  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const handlePasswordChange = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(passwordForm.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        setSuccessMessage('✅ Password changed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }, 1000);
    }
  };

  // File upload validation
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      setUploadErrors({ file: 'Only PDF, JPG, and PNG files are allowed' });
      return;
    }

    if (file.size > maxSize) {
      setUploadErrors({ file: 'File size must be less than 5MB' });
      return;
    }
    setUploadForm(prev => ({ ...prev, file, fileName: file.name }));
    setUploadErrors({});
  };

  // Profile image upload - direct file picker
  const handleProfileImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('❌ Only JPG and PNG images are allowed', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    if (file.size > maxSize) {
      toast.error('❌ Image size must be less than 2MB', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Upload to backend
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to upload image' }));
        throw new Error(errorData.detail || 'Failed to upload image');
      }

      const data = await response.json();
      
      // Update local state with backend image URL
      if (data.profileImage) {
        console.log('Profile image uploaded successfully:', data.profileImage);
        setProfileImage(data.profileImage);
        
        // Update parent component (Dashboard) with new profile image
        if (setUserData) {
          setUserData(prevData => ({
            ...prevData,
            profileImage: data.profileImage,
            name: data.fullName,
            email: data.email,
            initials: getInitials(data.fullName)
          }));
        }
      } else {
        console.warn('No profileImage in response:', data);
      }

      toast.success('Profile picture updated successfully!', {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture', {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerProfileImageUpload = () => {
    if (isEditing) {
      document.getElementById('profileImageInput')?.click();
    }
  };

  const handleUploadDocument = async () => {
    const newErrors = {};

    if (!uploadForm.documentType) {
      newErrors.documentType = 'Please select a document type';
    }

    if (!uploadForm.file) {
      newErrors.file = 'Please select a file to upload';
    }

    setUploadErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', uploadForm.file);
        formData.append('documentType', uploadForm.documentType);

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authentication required');
        }

        const response = await fetch('http://localhost:8000/api/auth/upload-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to upload document' }));
          throw new Error(errorData.detail || 'Failed to upload document');
        }

        const data = await response.json();
        
        // Add uploaded document to the list
        const newDoc = {
          id: data.id,
          name: data.documentType,
          type: data.category,
          status: data.verificationStatus,
          uploadDate: new Date(data.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          fileName: data.fileName,
          filePath: data.filePath
        };
        
        const updatedDocuments = [...documents, newDoc];
        setDocuments(updatedDocuments);
        
        setShowUploadModal(false);
        setUploadForm({ documentType: '', file: null, fileName: '' });
        setUploadErrors({});
        toast.success('✅ Document uploaded successfully! It will be verified within 24-48 hours.', {
          position: "top-center",
          autoClose: 3000,
        });
      } catch (error) {
        console.error('Document upload error:', error);
        toast.error(error.message || 'Failed to upload document', {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDocument = (doc) => {
    if (doc.filePath) {
      // Open the document from backend server
      const fileUrl = `http://localhost:8000${doc.filePath}`;
      window.open(fileUrl, '_blank');
    } else if (doc.fileData) {
      // Fallback for old localStorage-based documents
      const newWindow = window.open();
      if (newWindow) {
        if (doc.fileType && doc.fileType.includes('pdf')) {
          // For PDF files
          newWindow.document.write(`
            <html>
              <head>
                <title>${doc.name} - ${doc.fileName || 'Document'}</title>
                <style>
                  body { margin: 0; padding: 0; }
                  iframe { width: 100%; height: 100vh; border: none; }
                </style>
              </head>
              <body>
                <iframe src="${doc.fileData}"></iframe>
              </body>
            </html>
          `);
        } else {
          // For images and other files
          newWindow.document.write(`
            <html>
              <head>
                <title>${doc.name} - ${doc.fileName || 'Document'}</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-family: Arial, sans-serif;
                  }
                  h2 { color: #333; margin-bottom: 20px; }
                  img { 
                    max-width: 90%; 
                    height: auto; 
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    background: white;
                    padding: 10px;
                  }
                  .info { 
                    background: white; 
                    padding: 15px; 
                    margin-top: 20px; 
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                </style>
              </head>
              <body>
                <h2>${doc.name}</h2>
                <img src="${doc.fileData}" alt="${doc.name}" />
                <div class="info">
                  <p><strong>File Name:</strong> ${doc.fileName || 'N/A'}</p>
                  <p><strong>Type:</strong> ${doc.type}</p>
                  <p><strong>Status:</strong> ${doc.status}</p>
                  <p><strong>Upload Date:</strong> ${doc.uploadDate}</p>
                </div>
              </body>
            </html>
          `);
        }
        newWindow.document.close();
      }
    } else {
      toast.info(`📄 ${doc.name}\n\nDocument Type: ${doc.type}\nStatus: ${doc.status}\nUploaded: ${doc.uploadDate}`, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleDeleteProfile = () => {
    if (confirm('⚠️ Are you absolutely sure?\n\nThis will permanently delete your profile and all data. This action CANNOT be undone.')) {
      // Clear all user data
      localStorage.removeItem('user');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('authToken');
      localStorage.removeItem('uploadedDocuments');
      
      alert('Your profile has been deleted. You will be redirected to the login page.');
      navigate('/login');
    }
  };

  const activities = [
    { id: 1, action: 'Applied for Personal Loan', date: 'Dec 28, 2024', time: '10:30 AM' },
    { id: 2, action: 'Updated Profile Information', date: 'Dec 25, 2024', time: '03:15 PM' },
    { id: 3, action: 'Uploaded Bank Statement', date: 'Dec 20, 2024', time: '11:45 AM' },
    { id: 4, action: 'Made SIP Investment', date: 'Dec 15, 2024', time: '09:20 AM' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl flex items-center gap-2 sm:gap-3 animate-slideInRight">
          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your personal information and documents</p>
        </div>
        {showEditButton && (
          <div className="flex gap-2 w-full sm:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                    // Re-fetch original values from backend
                    const fetchUserProfile = async () => {
                      try {
                        const token = localStorage.getItem('access_token');
                        if (!token) return;

                        const response = await fetch('http://localhost:8000/api/auth/me', {
                          method: 'GET',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache'
                          },
                          cache: 'no-store'
                        });

                        if (response.ok) {
                          const data = await response.json();
                          setUserInfo({
                            name: data.fullName || '',
                            email: data.email || '',
                            phone: data.phone || '',
                            address: data.address || '',
                            panCard: data.panCard || '',
                            aadhar: data.aadhar || '',
                            dateOfBirth: data.dateOfBirth || '',
                            occupation: data.occupation || '',
                            annualIncome: data.annualIncome || ''
                          });
                        }
                      } catch (error) {
                        console.error('Failed to reset profile:', error);
                      }
                    };
                    fetchUserProfile();
                  }}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                data-edit-profile
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
        {/* Profile Info */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div 
              className={`w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl border-4 border-white relative group overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={triggerProfileImageUpload}
            >
              {profileImage ? (
                <img 
                  src={profileImage.startsWith('http') ? profileImage : `http://localhost:8000${profileImage}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', profileImage);
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = getInitials(userInfo.name);
                  }}
                  onLoad={() => console.log('Image loaded successfully:', profileImage)}
                />
              ) : (
                getInitials(userInfo.name)
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <span className="text-xs text-white mt-1">Change</span>
                </div>
              )}
            </div>
            {/* Hidden file input */}
            <input
              type="file"
              id="profileImageInput"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleProfileImageSelect}
              className="hidden"
            />
            <div className="text-center sm:text-left flex-1 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">{userInfo.name}</h2>
              <p className="text-sm sm:text-base text-gray-600">{userInfo.occupation}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="px-2.5 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    errors.name ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={userInfo.email}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Email cannot be changed (Login Email)
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Phone Number *</label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 10) {
                      handleInputChange('phone', value);
                    }
                  }}
                  disabled={!isEditing}
                  maxLength={10}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    errors.phone ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none`}
                  placeholder="9876543210"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Date of Birth *</label>
                <input
                  type="date"
                  value={userInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  disabled={!isEditing}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    errors.dateOfBirth ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none`}
                />
                {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dateOfBirth}</p>}
              </div>

              {/* Occupation */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Occupation *</label>
                <input
                  type="text"
                  value={userInfo.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    errors.occupation ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none`}
                  placeholder="Enter your occupation"
                />
                {errors.occupation && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.occupation}</p>}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Address */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Address *</label>
                <textarea
                  value={userInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  rows="3"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    errors.address ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none resize-none`}
                  placeholder="Enter your complete address"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
              </div>

              {/* PAN Card */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">PAN Card *</label>
                <input
                  type="text"
                  value={userInfo.panCard}
                  onChange={(e) => handleInputChange('panCard', e.target.value.toUpperCase())}
                  disabled={!isEditing}
                  maxLength={10}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 uppercase ${
                    errors.panCard ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none`}
                  placeholder="ABCDE1234F"
                />
                {errors.panCard && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.panCard}</p>}
              </div>

              {/* Aadhar */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Aadhar Number *</label>
                <input
                  type="text"
                  value={userInfo.aadhar}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9X\-]/g, '');
                    handleInputChange('aadhar', value);
                  }}
                  disabled={!isEditing}
                  maxLength={17}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    errors.aadhar ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none`}
                  placeholder="XXXX-XXXX-XXXX"
                />
                {errors.aadhar && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.aadhar}</p>}
              </div>

              {/* Annual Income */}
              <div>
                <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 sm:mb-2 block">Annual Income *</label>
                <input
                  type="text"
                  value={isEditing ? userInfo.annualIncome : formatCurrency(userInfo.annualIncome)}
                  onChange={(e) => handleInputChange('annualIncome', e.target.value.replace(/[^0-9]/g, ''))}
                  disabled={!isEditing}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    errors.annualIncome ? 'border-red-500' : isEditing ? 'border-gray-300 focus:border-green-500' : 'border-gray-200 bg-gray-50'
                  } focus:ring-2 focus:ring-green-200 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed focus:outline-none`}
                  placeholder="1200000"
                />
                {errors.annualIncome && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.annualIncome}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Delete Profile Section */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border-2 border-red-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          Danger Zone
        </h2>
        <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Delete Your Profile</p>
              <p className="text-[10px] sm:text-xs text-gray-600">
                Once you delete your profile, there is no going back. All your data, documents, and history will be permanently deleted.
              </p>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Delete Profile
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordErrors({});
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Change Password</h3>
                <p className="text-xs sm:text-sm text-gray-500">Update your account password</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">Current Password *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                      setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base rounded-lg border-2 ${
                      passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:outline-none transition-all`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{passwordErrors.currentPassword}
                  </p>
                )}
              </div>
              
              {/* New Password */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">New Password *</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base rounded-lg border-2 ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:outline-none transition-all`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{passwordErrors.newPassword}
                  </p>
                )}
                {passwordForm.newPassword && (
                  <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-[10px] sm:text-xs text-blue-900 font-semibold mb-1.5">Password Requirements:</p>
                    <div className="space-y-1">
                      {[
                        { test: passwordForm.newPassword.length >= 8, label: 'At least 8 characters' },
                        { test: /[A-Z]/.test(passwordForm.newPassword), label: 'One uppercase letter' },
                        { test: /[a-z]/.test(passwordForm.newPassword), label: 'One lowercase letter' },
                        { test: /[0-9]/.test(passwordForm.newPassword), label: 'One number' },
                        { test: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword), label: 'One special character' }
                      ].map((req, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center ${
                            req.test ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {req.test && <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />}
                          </div>
                          <span className={req.test ? 'text-green-700' : 'text-gray-600'}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirm Password */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">Confirm New Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base rounded-lg border-2 ${
                      passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:border-green-500 focus:outline-none transition-all`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handlePasswordChange}
                disabled={loading}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>Update</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-gray-200">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enable Two-Factor Authentication</h3>
            <p className="text-gray-600 mb-6">Add an extra layer of security to your account</p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 mb-2">How it works:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Download an authenticator app (Google Authenticator, Authy)</li>
                  <li>Scan the QR code or enter the key manually</li>
                  <li>Enter the 6-digit code to verify</li>
                </ul>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-3">
                    <p className="text-gray-400 text-sm">QR Code Here</p>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">ABCD-EFGH-IJKL-MNOP</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none text-center text-2xl font-mono"
                />
              </div>
            </div>
            
            <button 
              onClick={() => {
                alert('Two-Factor Authentication enabled successfully!');
                setShow2FAModal(false);
              }}
              className="w-full mt-6 bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Enable 2FA
            </button>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/20">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadForm({ documentType: '', file: null, fileName: '' });
                setUploadErrors({});
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">Upload Document</h3>
                <p className="text-xs sm:text-sm text-gray-500">Add a new document</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Document Type */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">Document Type *</label>
                <select 
                  value={uploadForm.documentType}
                  onChange={(e) => {
                    setUploadForm(prev => ({ ...prev, documentType: e.target.value }));
                    setUploadErrors(prev => ({ ...prev, documentType: '' }));
                  }}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 ${
                    uploadErrors.documentType ? 'border-red-500' : 'border-gray-300'
                  } focus:border-green-500 focus:outline-none transition-all`}
                >
                  <option value="">Select document type</option>
                  <option value="pan">PAN Card</option>
                  <option value="aadhar">Aadhar Card</option>
                  <option value="income">Income Proof</option>
                  <option value="bank">Bank Statement</option>
                  <option value="address">Address Proof</option>
                  <option value="other">Other</option>
                </select>
                {uploadErrors.documentType && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{uploadErrors.documentType}
                  </p>
                )}
              </div>
              
              {/* File Upload */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">Upload File *</label>
                <input
                  type="file"
                  id="fileUpload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="fileUpload"
                  className={`block border-2 border-dashed ${
                    uploadErrors.file ? 'border-red-500' : 'border-gray-300 hover:border-green-500'
                  } rounded-lg p-6 sm:p-8 text-center transition-all cursor-pointer ${
                    uploadForm.fileName ? 'bg-green-50 border-green-500' : 'bg-gray-50'
                  }`}
                >
                  {uploadForm.fileName ? (
                    <>
                      <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mx-auto mb-2" />
                      <p className="text-sm sm:text-base text-green-700 font-semibold break-all px-2">{uploadForm.fileName}</p>
                      <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                    </>
                  )}
                </label>
                {uploadErrors.file && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{uploadErrors.file}
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-[10px] sm:text-xs text-blue-900">
                  <strong>Note:</strong> Documents will be verified within 24-48 hours. Ensure the document is clear and all details are visible.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({ documentType: '', file: null, fileName: '' });
                  setUploadErrors({});
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadDocument}
                disabled={loading}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>Upload</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Delete Profile?</h3>
              <p className="text-sm sm:text-base text-gray-600">This action cannot be undone</p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs sm:text-sm text-red-900 mb-1.5 sm:mb-2 font-semibold">⚠️ Warning: This will permanently delete:</p>
                <ul className="text-[10px] sm:text-xs text-red-700 space-y-0.5 sm:space-y-1 list-disc list-inside">
                  <li>Your profile and all personal information</li>
                  <li>All loan and insurance applications</li>
                  <li>Investment and transaction history</li>
                  <li>Uploaded documents and records</li>
                  <li>All saved preferences and settings</li>
                </ul>
              </div>
              
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">
                  Type <span className="text-red-600 font-bold">DELETE</span> to confirm *
                </label>
                <input
                  type="text"
                  id="deleteConfirmation"
                  placeholder="Type DELETE in capital letters"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-300 focus:border-red-500 focus:outline-none font-semibold transition-all"
                />
              </div>

              <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-[10px] sm:text-xs text-yellow-900">
                  <strong>⚡ Tip:</strong> Consider downloading your data before deletion. This action is irreversible and all your data will be lost forever.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const input = document.getElementById('deleteConfirmation');
                  if (input.value === 'DELETE') {
                    setShowDeleteModal(false);
                    handleDeleteProfile();
                  } else {
                    alert('❌ Please type DELETE (in capital letters) to confirm.');
                  }
                }}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
