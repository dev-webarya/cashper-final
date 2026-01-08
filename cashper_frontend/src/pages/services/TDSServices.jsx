import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFileInvoice, FaCalculator, FaCheckCircle, FaMoneyBillWave, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { CheckCircle, FileText, X, Phone, Mail, Upload, AlertCircle, User, IdCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitTDSServices } from '../../services/businessServicesApi';

const TDSServices = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', panNumber: '',
    companyName: '', tanNumber: '', serviceType: '', quarterYear: '',
    address: '', city: '', state: '', pincode: '',
    form16: null, form26AS: null, salaryRegister: null, tdsReturns: null, panCard: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    const savedFormData = sessionStorage.getItem('tds_services_form_data');
    const savedStep = sessionStorage.getItem('tds_services_pending_step');
    
    if (savedFormData && token) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setApplicationForm(parsedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        sessionStorage.removeItem('tds_services_form_data');
        sessionStorage.removeItem('tds_services_pending_step');
        toast.success('Welcome back! Continue with your application', {
          position: 'top-center',
          autoClose: 2000
        });
      } catch (error) {
        console.error('Error restoring form data:', error);
      }
    }
  }, []);

  const handleContactNavigation = () => {
    navigate('/contactus');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleContactClick = () => {
    setShowContactPopup(true);
  };

  // Hero form state
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  const handleHeroFormChange = (e) => {
    setHeroFormData({ ...heroFormData, [e.target.name]: e.target.value });
  };

  const handleHeroFormSubmit = async (e) => {
    e.preventDefault();
    if (!heroFormData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!heroFormData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(heroFormData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!heroFormData.phone.trim() || !/^[0-9]{10}$/.test(heroFormData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSubmittingHero(true);
    try {
      const response = await fetch('http://localhost:8000/api/corporate-inquiry/tds-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        toast.success(data.message || 'Thank you! Our TDS expert will contact you soon.');
        setHeroFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(data.detail || 'Failed to submit inquiry.');
      }
    } catch (error) {
      toast.error('Failed to submit inquiry. Please try again.');
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
      case 'companyName':
        if (!value.trim()) error = 'Company name is required';
        break;
      case 'tanNumber':
        if (!value.trim()) error = 'PAN Number is required';
        else if (!/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid TAN format';
        break;
      case 'serviceType':
        if (!value) error = 'Service type is required';
        break;
      case 'quarterYear':
        if (!value) error = 'Quarter/Year is required';
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
      ['companyName', 'tanNumber', 'serviceType', 'quarterYear'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
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
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('tds_services_pending_step', '2');
      sessionStorage.setItem('tds_services_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your TDS services application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login?redirect=/services/tds-services&step=2', {
        state: { from: '/services/tds-services', returnStep: 2 }
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
    
    const formSection = document.getElementById('application-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    
    const formSection = document.getElementById('application-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      sessionStorage.setItem('tds_services_pending_step', '4');
      sessionStorage.setItem('tds_services_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/tds-services&step=4', {
        state: { from: '/services/tds-services', returnStep: 4 }
      });
      return;
    }

    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix all errors before submitting');
      return;
    }
    setIsSubmitting(true);
    try {
      // Call API to submit TDS services application
      const response = await submitTDSServices(applicationForm);
      
      if (response.success) {
        setShowSuccessModal(true);
        toast.success('TDS services application submitted successfully!');
        setApplicationForm({
          fullName: '', email: '', phone: '', panNumber: '',
          companyName: '', tanNumber: '', serviceType: '', quarterYear: '',
          address: '', city: '', state: '', pincode: '',
          form16: null, form26AS: null, salaryRegister: null, tdsReturns: null, panCard: null
        });
        setCurrentStep(1);
        setErrors({});
        setTouched({});
      } else {
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

  // If in popup mode, only render the application form section and success modal
  if (isPopupMode) {
    return (
      <>
        <section id="application-form-section" className="py-4 sm:py-6 bg-gradient-to-br from-white via-green-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                  TDS Services Application
                </h2>
                <p className="text-green-50 text-center mt-2">Complete the form to get started with TDS services</p>
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

                {/* Step 2: TDS Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">TDS Service Details</h3>
                    
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaBuilding className="mr-2 text-green-600" /> Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={applicationForm.companyName}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('companyName')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.companyName ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="Enter company name"
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <IdCard className="mr-2 text-green-600" /> PAN Number *
                      </label>
                      <input
                        type="text"
                        name="tanNumber"
                        value={applicationForm.tanNumber}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('tanNumber')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors uppercase ${
                          errors.tanNumber ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="ABCD12345E"
                        maxLength={10}
                      />
                      {errors.tanNumber && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.tanNumber}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Format: ABCD12345E (10 characters)</p>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaCalculator className="mr-2 text-green-600" /> Service Type *
                      </label>
                      <select
                        name="serviceType"
                        value={applicationForm.serviceType}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('serviceType')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.serviceType ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                      >
                        <option value="">Select Service Type</option>
                        <option value="TDS Return Filing">TDS Return Filing</option>
                        <option value="TDS Compliance">TDS Compliance</option>
                        <option value="TDS Reconciliation">TDS Reconciliation</option>
                        <option value="Lower Deduction Certificate">Lower Deduction Certificate</option>
                        <option value="TDS Notice Support">TDS Notice Support</option>
                      </select>
                      {errors.serviceType && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.serviceType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <FaCalendarAlt className="mr-2 text-green-600" /> Quarter/Year *
                      </label>
                      <input
                        type="text"
                        name="quarterYear"
                        value={applicationForm.quarterYear}
                        onChange={handleApplicationChange}
                        onBlur={() => handleBlur('quarterYear')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.quarterYear ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                        }`}
                        placeholder="e.g., Q1 2024-25"
                      />
                      {errors.quarterYear && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.quarterYear}
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
                        <Upload className="mr-2 text-green-600" /> Form 16 *
                      </label>
                      <input
                        type="file"
                        name="form16"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.form16 && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.form16}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> Form 26AS *
                      </label>
                      <input
                        type="file"
                        name="form26AS"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.form26AS && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.form26AS}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> Salary Register *
                      </label>
                      <input
                        type="file"
                        name="salaryRegister"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.salaryRegister && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.salaryRegister}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> TDS Returns *
                      </label>
                      <input
                        type="file"
                        name="tdsReturns"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.tdsReturns && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.tdsReturns}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="mr-2 text-green-600" /> PAN Card *
                      </label>
                      <input
                        type="file"
                        name="panCard"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      {errors.panCard && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" /> {errors.panCard}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  {currentStep > 1 && (
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      ← Previous
                    </button>
                  )}
                  {currentStep < 4 ? (
                    <button
                      onClick={nextStep}
                      className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
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
                Your TDS service application has been received. Our expert will review and contact you within 1-2 business days.
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
      </>
    );
  }

  // Full page mode - render complete page
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'scroll',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-700/60 to-green-900/50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center">
            <div className="space-y-3 sm:space-y-4 md:space-y-5 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                TDS <span className="text-yellow-300">Compliance Services</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                Complete TDS compliance services. From TAN registration to quarterly returns, we handle all your TDS requirements with expert guidance.
              </p>
              <div className="pt-2">
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
            
            {/* Contact Form - Right Side */}
            <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 md:p-5 mt-6 md:mt-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                GET IN TOUCH
              </h3>
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
      </section>

      <div className="pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-gray-100">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                Tax Deducted at Source (TDS) is a mechanism to collect income tax at the source of income. Every business 
                making specified payments must deduct TDS and deposit it with the government. We provide comprehensive TDS 
                compliance services to help you meet your obligations accurately and on time.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our TDS Services</h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">TAN Registration</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Tax Deduction and Collection Account Number (TAN) application</li>
                    <li>• TAN correction or modification</li>
                    <li>• Duplicate TAN certificate issuance</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-green-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">TDS Calculation & Deduction</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Identification of transactions subject to TDS</li>
                    <li>• Correct TDS rate application as per sections (192, 194A, 194C, 194H, 194I, 194J, etc.)</li>
                    <li>• TDS on salary, rent, professional fees, commission, interest</li>
                    <li>• TDS on contractor and sub-contractor payments</li>
                    <li>• Lower/NIL TDS deduction certificate support</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">TDS Payment & Challan</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Timely TDS payment through online challans</li>
                    <li>• Form 281 (Challan 280) preparation and filing</li>
                    <li>• Payment due date tracking (7th of following month)</li>
                    <li>• Bank payment verification</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-green-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quarterly TDS Returns</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Form 24Q - TDS on salary (quarterly)</li>
                    <li>• Form 26Q - TDS on payments other than salary (quarterly)</li>
                    <li>• Form 27Q - TDS on payments to non-residents (quarterly)</li>
                    <li>• Form 26QB - TDS on property transactions (within 30 days)</li>
                    <li>• Return preparation, validation, and e-filing</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">TDS Certificates</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Form 16 - TDS certificate for salary (annual)</li>
                    <li>• Form 16A - TDS certificate for other payments (quarterly)</li>
                    <li>• Form 16B - TDS certificate for property (one-time)</li>
                    <li>• Form 16C - TDS certificate for rent (quarterly)</li>
                    <li>• Bulk certificate generation and distribution</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-green-50 p-5 rounded-xl border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">TDS Correction & Revision</h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• TDS return correction (wrong PAN, incorrect amount, etc.)</li>
                    <li>• Revised TDS return filing</li>
                    <li>• Default/correction statement filing</li>
                    <li>• Mismatch resolution between Form 26AS and books</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">TDS Rate Chart (Common Sections)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gradient-to-r from-green-100 to-blue-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Section</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nature of Payment</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">192</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Salary</td>
                      <td className="px-4 py-3 text-sm text-gray-700">As per slab</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">194A</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Interest other than securities</td>
                      <td className="px-4 py-3 text-sm text-gray-700">10%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">194C</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Contractor/Sub-contractor</td>
                      <td className="px-4 py-3 text-sm text-gray-700">1% / 2%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">194H</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Commission/Brokerage</td>
                      <td className="px-4 py-3 text-sm text-gray-700">5%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-700">194I</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Rent</td>
                      <td className="px-4 py-3 text-sm text-gray-700">2% / 10%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">194J</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Professional/Technical fees</td>
                      <td className="px-4 py-3 text-sm text-gray-700">10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8 p-6 bg-red-50 rounded-xl border-l-4 border-red-500">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">⚠ Penalties for Non-Compliance</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Interest at 1% per month for delay in TDS payment</li>
                  <li>• Interest at 1.5% per month if TDS deducted but not deposited</li>
                  <li>• Late filing fee: ₹200 per day (max ₹1,00,000 for non-salary and ₹25,000 for salary)</li>
                  <li>• Penalty under Section 271H for non-filing of TDS return</li>
                  <li>• Disallowance of expense if TDS not deducted or deposited</li>
                </ul>
              </div>

              <div className="mt-6 p-6 bg-green-50 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Help</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Complete TDS lifecycle management from deduction to certificate issuance</li>
                  <li>• Automated TDS calculation and due date reminders</li>
                  <li>• Quarterly return filing with error-free data</li>
                  <li>• Form 26AS reconciliation with books of accounts</li>
                  <li>• Lower deduction certificate and NIL deduction support</li>
                  <li>• TDS notice response and litigation support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Application Form Section */}
          <section id="application-form-section" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-green-50 to-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                    TDS Services Application
                  </h2>
                  <p className="text-green-50 text-center mt-2">Complete the form to get started with TDS services</p>
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

                  {/* Step 2: TDS Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">TDS Service Details</h3>
                      
                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaBuilding className="mr-2 text-green-600" /> Company Name *
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={applicationForm.companyName}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('companyName')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.companyName ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter company name"
                        />
                        {errors.companyName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.companyName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <IdCard className="mr-2 text-green-600" /> PAN Number *
                        </label>
                        <input
                          type="text"
                          name="tanNumber"
                          value={applicationForm.tanNumber}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('tanNumber')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors uppercase ${
                            errors.tanNumber ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="ABCD12345E"
                          maxLength={10}
                        />
                        {errors.tanNumber && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.tanNumber}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Format: ABCD12345E (10 characters)</p>
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaCalculator className="mr-2 text-green-600" /> Service Type *
                        </label>
                        <select
                          name="serviceType"
                          value={applicationForm.serviceType}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('serviceType')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.serviceType ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select Service Type</option>
                          <option value="TDS Return Filing">TDS Return Filing</option>
                          <option value="TDS Compliance">TDS Compliance</option>
                          <option value="TDS Reconciliation">TDS Reconciliation</option>
                          <option value="Lower Deduction Certificate">Lower Deduction Certificate</option>
                          <option value="TDS Notice Support">TDS Notice Support</option>
                        </select>
                        {errors.serviceType && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.serviceType}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <FaCalendarAlt className="mr-2 text-green-600" /> Quarter/Year *
                        </label>
                        <input
                          type="text"
                          name="quarterYear"
                          value={applicationForm.quarterYear}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('quarterYear')}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.quarterYear ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="e.g., Q1 2024-25"
                        />
                        {errors.quarterYear && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.quarterYear}
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
                          <Upload className="mr-2 text-green-600" /> Form 16 *
                        </label>
                        <input
                          type="file"
                          name="form16"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.form16 && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.form16}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> Form 26AS *
                        </label>
                        <input
                          type="file"
                          name="form26AS"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.form26AS && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.form26AS}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> Salary Register *
                        </label>
                        <input
                          type="file"
                          name="salaryRegister"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.salaryRegister && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.salaryRegister}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> TDS Returns *
                        </label>
                        <input
                          type="file"
                          name="tdsReturns"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.tdsReturns && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.tdsReturns}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                          <Upload className="mr-2 text-green-600" /> PAN Card *
                        </label>
                        <input
                          type="file"
                          name="panCard"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
                        />
                        {errors.panCard && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.panCard}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    {currentStep > 1 && (
                      <button
                        onClick={prevStep}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                      >
                        ← Previous
                      </button>
                    )}
                    {currentStep < 4 ? (
                      <button
                        onClick={nextStep}
                        className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-semibold"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
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
                  Your TDS service application has been received. Our expert will review and contact you within 1-2 business days.
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
          <div className="text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gray-800">Need TDS Services?</h2>
            <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Get complete TDS compliance support from expert professionals. Ensure timely filing and avoid penalties.
            </p>
            <button
              onClick={handleContactClick}
              className="inline-block bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold px-8 md:px-12 py-4 md:py-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base md:text-lg"
            >
              Contact Us Now →
            </button>
          </div>
        </div>
      </div>

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
                  <Mail className="w-6 h-6 text-white" />
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

export default TDSServices;
