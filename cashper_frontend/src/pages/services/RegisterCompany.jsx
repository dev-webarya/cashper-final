import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaBuilding, FaFileAlt, FaUsers, FaCertificate, FaHandshake, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { CheckCircle, FileText, Building, Users, Award, Shield, X, Phone, Mail, Upload, AlertCircle, User, IdCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitCompanyRegistration } from '../../services/businessServicesApi';

const RegisterCompany = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', panNumber: '',
    proposedCompanyName: '', companyType: '', numberOfDirectors: '', registrationState: '',
    address: '', city: '', state: '', pincode: '',
    directorPan: null, addressProof: null, directorPhoto: null, moaDraft: null, aoaDraft: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    // Restore form data from sessionStorage after login redirect
    const savedFormData = sessionStorage.getItem('register_company_form_data');
    const savedStep = sessionStorage.getItem('register_company_pending_step');
    
    if (savedFormData && token) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setApplicationForm(parsedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        // Clear saved data
        sessionStorage.removeItem('register_company_form_data');
        sessionStorage.removeItem('register_company_pending_step');
        toast.success('Welcome back! Continue with your application', {
          position: 'top-center',
          autoClose: 2000
        });
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  const handleContactClick = () => {
    setShowContactPopup(true);
  };

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  const handleHeroFormChange = (e) => {
    const { name, value } = e.target;
    setHeroFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHeroFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!heroFormData.name || !heroFormData.email || !heroFormData.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(heroFormData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(heroFormData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmittingHero(true);
    try {
      console.log('Submitting hero form to API:', heroFormData);
      
      // Submit to backend API
      const response = await fetch('http://localhost:8000/api/corporate-inquiry/register-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: heroFormData.name,
          email: heroFormData.email,
          phone: heroFormData.phone,
          companyName: '',
          message: heroFormData.message || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Thank you! We will contact you soon.');
        console.log('Inquiry submitted successfully:', data);
        
        // Reset form
        setHeroFormData({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      } else {
        toast.error(data.detail || 'Failed to submit inquiry. Please try again.');
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmittingHero(false);
    }
  };

  // Application Form Validation
  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(value)) error = 'Phone must be 10 digits';
        break;
      case 'panNumber':
        if (!value.trim()) error = 'PAN number is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format';
        break;
      case 'proposedCompanyName':
        if (!value.trim()) error = 'Company name is required';
        else if (value.trim().length < 3) error = 'Company name must be at least 3 characters';
        break;
      case 'companyType':
        if (!value) error = 'Company type is required';
        break;
      case 'numberOfDirectors':
        if (!value) error = 'Number of directors is required';
        else if (isNaN(value) || parseInt(value) < 1) error = 'Must have at least 1 director';
        break;
      case 'registrationState':
        if (!value) error = 'Registration state is required';
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        else if (value.trim().length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
      case 'state':
        if (!value.trim()) error = 'State is required';
        break;
      case 'pincode':
        if (!value.trim()) error = 'Pincode is required';
        else if (!/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits';
        break;
      default: break;
    }
    return error;
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) {
      ['fullName', 'email', 'phone', 'panNumber'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 2) {
      ['proposedCompanyName', 'companyType', 'numberOfDirectors', 'registrationState'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 4) {
      // Validate required documents
      const requiredDocs = ['directorPan', 'addressProof', 'directorPhoto', 'moaDraft', 'aoaDraft'];
      requiredDocs.forEach(docName => {
        if (!applicationForm[docName]) {
          stepErrors[docName] = `${docName.replace(/([A-Z])/g, ' $1').trim()} is required`;
        }
      });
    }
    return stepErrors;
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, applicationForm[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (file && !allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    setApplicationForm(prev => ({ ...prev, [name]: file }));
  };

  const nextStep = () => {
    // Check authentication before proceeding from step 1
    if (currentStep === 1 && !isAuthenticated) {
      // Save form data and target step in sessionStorage
      sessionStorage.setItem('register_company_pending_step', '2');
      sessionStorage.setItem('register_company_form_data', JSON.stringify(applicationForm));
      
      toast.warning('Please login to continue with your company registration', {
        position: 'top-center',
        autoClose: 3000
      });
      
      navigate('/login?redirect=/services/register-company&step=2', {
        state: { from: '/services/register-company', returnStep: 2 }
      });
      return;
    }

    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix all errors before proceeding');
      return;
    }
    
    setCurrentStep(prev => prev + 1);
    
    // Scroll to form section, not to top of page
    const formSection = document.getElementById('application-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    
    // Scroll to form section, not to top of page
    const formSection = document.getElementById('application-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if not on step 4
    if (currentStep < 4) {
      console.log('Form submission prevented - not on step 4');
      toast.warning('Please complete all steps before submitting');
      return;
    }
    
    // Validate step 4 documents
    const stepErrors = validateStep(4);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please upload all required documents before submitting');
      return;
    }
    
    // Final authentication check before submission
    if (!isAuthenticated) {
      sessionStorage.setItem('register_company_pending_step', '4');
      sessionStorage.setItem('register_company_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/register-company&step=4', {
        state: { from: '/services/register-company', returnStep: 4 }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Call API to submit company registration
      const response = await submitCompanyRegistration(applicationForm);
      
      if (response.success) {
        setShowSuccessModal(true);
        toast.success('Company registration application submitted successfully!');
        setApplicationForm({
          fullName: '', email: '', phone: '', panNumber: '',
          proposedCompanyName: '', companyType: '', numberOfDirectors: '', registrationState: '',
          address: '', city: '', state: '', pincode: '',
          directorPan: null, addressProof: null, directorPhoto: null, moaDraft: null, aoaDraft: null
        });
        setCurrentStep(1);
        setErrors({});
        setTouched({});
      } else {
        // Handle field-level validation errors from API
        if (response.fieldErrors && Object.keys(response.fieldErrors).length > 0) {
          setErrors(response.fieldErrors);
          toast.error('Please fix validation errors and try again');
        } else {
          toast.error(response.error || 'Failed to submit application. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If in popup mode, only render the application form section
  if (isPopupMode) {
    return (
      <>
        <section id="application-form-section" className="py-4 sm:py-6 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-4 sm:py-6 rounded-t-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">Company Registration Application</h2>
                <p className="text-green-50 text-center mt-1 text-sm">Complete the form to register your new company</p>
              </div>

              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>
                      {step < 4 && <div className={`w-8 sm:w-12 md:w-16 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`}></div>}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleApplicationSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault(); }} className="space-y-5">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Your full name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="your@email.com" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit number" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label><input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="ABCDE1234F" maxLength="10" /></div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Company Details</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label><input type="text" name="proposedCompanyName" value={applicationForm.proposedCompanyName} onChange={handleApplicationChange} onBlur={() => handleBlur('proposedCompanyName')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.proposedCompanyName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Company name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Type *</label><select name="companyType" value={applicationForm.companyType} onChange={handleApplicationChange} onBlur={() => handleBlur('companyType')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.companyType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Type</option><option value="Private Limited">Private Limited</option><option value="Public Limited">Public Limited</option><option value="OPC">One Person Company</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Number of Directors *</label><input type="number" name="numberOfDirectors" value={applicationForm.numberOfDirectors} onChange={handleApplicationChange} onBlur={() => handleBlur('numberOfDirectors')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.numberOfDirectors ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} min="1" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Registration State *</label><input type="text" name="registrationState" value={applicationForm.registrationState} onChange={handleApplicationChange} onBlur={() => handleBlur('registrationState')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.registrationState ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="State" /></div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Address Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="2" className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Full address" /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="City" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="State" /></div></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full px-3 py-2 border-2 rounded-lg text-sm ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="6-digit" maxLength="6" /></div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Upload Documents</h3>
                      {[{name: 'directorPan', label: 'Director PAN *'}, {name: 'addressProof', label: 'Address Proof *'}, {name: 'directorPhoto', label: 'Director Photo *'}, {name: 'moaDraft', label: 'MOA Draft *'}, {name: 'aoaDraft', label: 'AOA Draft *'}].map(doc => (
                        <div key={doc.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{doc.label}</label>
                          <div className={`border-2 border-dashed rounded-lg p-3 text-center hover:border-green-500 transition-colors ${errors[doc.name] ? 'border-red-500' : 'border-gray-300'}`}>
                            <input type="file" name={doc.name} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id={doc.name} />
                            <label htmlFor={doc.name} className="cursor-pointer block text-xs text-gray-600">
                              {applicationForm[doc.name] ? applicationForm[doc.name].name : 'Click to upload'}
                            </label>
                          </div>
                          {errors[doc.name] && (
                            <p className="mt-1 text-xs text-red-600">{errors[doc.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between gap-3 pt-4">
                    {currentStep > 1 && (
                      <button 
                        type="button" 
                        onClick={prevStep} 
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                      >
                        ← Previous
                      </button>
                    )}
                    {currentStep < 4 ? (
                      <button 
                        type="button" 
                        onClick={nextStep} 
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium text-sm transition-all"
                      >
                        Next →
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium text-sm transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-green-600" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 text-sm mb-4">Your company registration application has been submitted.</p>
              <button onClick={() => { setShowSuccessModal(false); if (onPopupClose) onPopupClose(); }} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium text-sm">Close</button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section with Contact Form */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-16 sm:pb-20 md:pb-24 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-700/60 to-green-900/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Register New Company
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-green-50 leading-relaxed">
                Starting a new business? We provide end-to-end company registration services for all types of business entities in India. From choosing the right structure to obtaining registrations, we handle everything.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Quick Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">All Entity Types</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Expert Guidance</span>
                </div>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => {
                    const element = document.getElementById('application-form-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-4xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                >
                  Apply Now →
                </button>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="w-full lg:w-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Start Your Business Today</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">Fill in your details and we'll get back to you</p>
                
                <form onSubmit={handleHeroFormSubmit} className="space-y-2 sm:space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={heroFormData.name}
                    onChange={handleHeroFormChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={heroFormData.email}
                    onChange={handleHeroFormChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Mobile Number"
                    value={heroFormData.phone}
                    onChange={handleHeroFormChange}
                    maxLength="10"
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <textarea
                    name="message"
                    placeholder="Type your message here..."
                    value={heroFormData.message}
                    onChange={handleHeroFormChange}
                    rows="4"
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm resize-none"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    disabled={isSubmittingHero}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingHero ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Register Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Register Your Company?
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Company registration provides legal recognition, limited liability protection, and credibility to your business. It's the first step towards building a successful enterprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="text-white w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Legal Protection</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Limited liability protection for owners</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Separate legal entity status</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Asset protection from business liabilities</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Award className="text-white w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Business Benefits</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Enhanced credibility with customers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Easier access to funding and loans</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Tax benefits and deductions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Company Registration */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Types of Company Registration
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

            {[
              {
                title: 'Private Limited Company',
                description: 'Most popular choice for startups and growing businesses. Offers limited liability, separate legal entity status, and easy funding options. Requires minimum 2 directors and 2 shareholders.'
              },
              {
                title: 'Limited Liability Partnership (LLP)',
                description: 'Ideal for professional services and small businesses. Combines benefits of partnership and company. Requires minimum 2 partners, lower compliance burden, and flexibility in operations.'
              },
              {
                title: 'One Person Company (OPC)',
                description: 'Perfect for solo entrepreneurs. Requires only one director and one shareholder (same person allowed). Provides limited liability with minimal compliance requirements.'
              },
              {
                title: 'Partnership Firm',
                description: 'Suitable for small businesses with 2-20 partners. Simple registration process, easy to manage, and minimal regulatory requirements. Partners share profits and liabilities.'
              },
              {
                title: 'Proprietorship Registration',
                description: 'Simplest business structure for individual entrepreneurs. No separate legal entity. Easy to set up with GST, MSME, and shop establishment registrations.'
              },
              {
                title: 'Public Limited Company',
                description: 'For large-scale businesses planning to raise capital from public. Can list on stock exchanges. Requires minimum 7 directors and 7 shareholders. Higher compliance requirements.'
              }
            ].map((type, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all border-t-4 border-green-600"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{type.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our Registration Services Include
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Business structure consultation and selection',
                'Name availability check and reservation',
                'Digital Signature Certificate (DSC) procurement',
                'Director Identification Number (DIN) application',
                'Memorandum and Articles of Association drafting',
                'Filing with Registrar of Companies (RoC)',
                'Certificate of Incorporation',
                'PAN and TAN application for company',
                'GST registration assistance'
              ].map((service, index) => (
                <li key={index} className="flex items-start text-gray-600 text-sm sm:text-base">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Documents Required Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Documents Required
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Personal Documents</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'PAN Card of all directors/partners',
                  'Aadhaar Card of all directors/partners',
                  'Passport-size photographs',
                  'Bank statement or cancelled cheque'
                ].map((doc, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm sm:text-base">
                    <FileText className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <Building className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Office Documents</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Address proof of registered office',
                  'Rent agreement or NOC from property owner',
                  'Utility bill (electricity/water) of registered office'
                ].map((doc, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm sm:text-base">
                    <Building className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Timeline & Process</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
              <div>
                <p className="font-semibold mb-1">Registration Time</p>
                <p className="text-green-100">7-14 working days</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Government Fees</p>
                <p className="text-green-100">Based on capital</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Professional Fees</p>
                <p className="text-green-100">Transparent pricing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form-section" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                Company Registration Application
              </h2>
              <p className="text-green-50 text-center mt-2">Complete the form to register your company</p>
            </div>

            <div className="px-6 sm:px-8 py-8">
              {/* Step Indicators */}
              <div className="flex justify-between items-center mb-8">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep === step ? 'bg-green-600 text-white' :
                      currentStep > step ? 'bg-green-200 text-green-700' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && <div className={`h-1 w-full ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                  
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="mr-2 text-green-600" /> Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={applicationForm.fullName}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('fullName')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.fullName ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="mr-2 text-green-600" /> Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={applicationForm.email}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="mr-2 text-green-600" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={applicationForm.phone}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="10-digit mobile number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaIdCard className="mr-2 text-green-600" /> PAN Number *
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={applicationForm.panNumber}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('panNumber')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors uppercase ${
                        errors.panNumber ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                    {errors.panNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.panNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Company Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Company Details</h3>
                  
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaBuilding className="mr-2 text-green-600" /> Proposed Company Name *
                    </label>
                    <input
                      type="text"
                      name="proposedCompanyName"
                      value={applicationForm.proposedCompanyName}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('proposedCompanyName')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.proposedCompanyName ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter proposed company name"
                    />
                    {errors.proposedCompanyName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.proposedCompanyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <IdCard className="mr-2 text-green-600" /> Company Type *
                    </label>
                    <select
                      name="companyType"
                      value={applicationForm.companyType}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('companyType')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.companyType ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                    >
                      <option value="">Select Company Type</option>
                      <option value="Private Limited Company">Private Limited Company</option>
                      <option value="Public Limited Company">Public Limited Company</option>
                      <option value="One Person Company (OPC)">One Person Company (OPC)</option>
                      <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                      <option value="Partnership Firm">Partnership Firm</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                    </select>
                    {errors.companyType && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.companyType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <User className="mr-2 text-green-600" /> Number of Directors/Partners *
                    </label>
                    <input
                      type="number"
                      name="numberOfDirectors"
                      value={applicationForm.numberOfDirectors}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('numberOfDirectors')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.numberOfDirectors ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter number"
                      min="1"
                    />
                    {errors.numberOfDirectors && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.numberOfDirectors}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="mr-2 text-green-600" /> Registration State *
                    </label>
                    <input
                      type="text"
                      name="registrationState"
                      value={applicationForm.registrationState}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('registrationState')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.registrationState ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter state for registration"
                    />
                    {errors.registrationState && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.registrationState}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Address Information */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Address Information</h3>
                  
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaHome className="mr-2 text-green-600" /> Complete Address *
                    </label>
                    <textarea
                      name="address"
                      value={applicationForm.address}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('address')}
                      rows={3}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.address ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="Enter complete address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="mr-2 text-green-600" /> City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={applicationForm.city}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('city')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.city ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="Enter city"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaMapMarkerAlt className="mr-2 text-green-600" /> State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={applicationForm.state}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('state')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.state ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="Enter state"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="mr-2 text-green-600" /> Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={applicationForm.pincode}
                      onChange={handleApplicationChange}
                      onBlur={() => handleBlur('pincode')}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.pincode ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                      }`}
                      placeholder="6-digit pincode"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Document Upload */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Documents</h3>
                  <p className="text-sm text-gray-600 mb-4">All documents must be in JPG, PNG, or PDF format (max 5MB each)</p>
                  
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="mr-2 text-green-600" /> Director PAN Card *
                    </label>
                    <input
                      type="file"
                      name="directorPan"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    {errors.directorPan && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.directorPan}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="mr-2 text-green-600" /> Address Proof *
                    </label>
                    <input
                      type="file"
                      name="addressProof"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    {errors.addressProof && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.addressProof}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="mr-2 text-green-600" /> Director Photo *
                    </label>
                    <input
                      type="file"
                      name="directorPhoto"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    {errors.directorPhoto && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.directorPhoto}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="mr-2 text-green-600" /> MOA Draft *
                    </label>
                    <input
                      type="file"
                      name="moaDraft"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    {errors.moaDraft && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.moaDraft}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="mr-2 text-green-600" /> AOA Draft *
                    </label>
                    <input
                      type="file"
                      name="aoaDraft"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    {errors.aoaDraft && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" /> {errors.aoaDraft}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    ← Previous
                  </button>
                )}
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplicationSubmit}
                    disabled={isSubmitting}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Your company registration application has been received. We'll contact you within 1-2 business days.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Your Business?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-green-50 mb-6 sm:mb-8 leading-relaxed">
            Let us handle your company registration while you focus on building your business
          </p>
          <button
            onClick={handleContactClick}
            className="inline-block bg-white text-green-700 px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-bold hover:bg-green-50 transform hover:scale-105 transition-all shadow-lg text-base sm:text-lg"
          >
            Contact Us Now →
          </button>
        </div>
      </section>

      {/* Contact Popup */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowContactPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Us</h3>
              <button 
                onClick={() => setShowContactPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                <div className="bg-green-600 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Phone Numbers</p>
                  <a href="tel:6200755759" className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors block">6200755759</a>
                  <a href="tel:7393080847" className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors block">7393080847</a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all">
                <div className="bg-green-600 p-3 rounded-full">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <a href="mailto:info@cashper.ai" className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors break-all">info@cashper.ai</a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowContactPopup(false)}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RegisterCompany;
