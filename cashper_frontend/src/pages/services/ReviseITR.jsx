import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaFileAlt, FaCalculator, FaChartLine, FaPiggyBank, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaCalendar } from 'react-icons/fa';
import { CheckCircle, FileText, TrendingUp, Target, Award, Shield, X, Phone, Mail, Upload, AlertCircle, User, IdCard as IdCardIcon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitITRRevisionApplication } from '../../services/retailServicesApi';

const ReviseITR = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [showContactPopup, setShowContactPopup] = useState(false);
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleContactClick = () => {
    setShowContactPopup(true);
  };

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  // Application Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    panNumber: '',
    assessmentYear: '',
    itrType: '',
    acknowledgmentNumber: '',
    originalFilingDate: '',
    revisionReason: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    originalITR: null,
    acknowledgmentReceipt: null,
    supportingDocuments: null,
    revisedComputations: null,
    form26AS: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // useEffect for authentication check and form restoration
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    
    // Check if returning from login with pending step
    const pendingStep = sessionStorage.getItem('revise_itr_pending_step');
    const savedFormData = sessionStorage.getItem('revise_itr_form_data');
    
    console.log('Revise ITR Form - Checking restoration:', { token: !!token, pendingStep, hasFormData: !!savedFormData });
    
    if (token && pendingStep && savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        const step = parseInt(pendingStep);
        
        console.log('Revise ITR Form - Restoring:', { step, formData });
        
        setApplicationForm(formData);
        setCurrentStep(step);
        
        // Use setTimeout to ensure state is set before showing toast
        setTimeout(() => {
          toast.success('Welcome back! Continuing your ITR revision application...', {
            position: 'top-center',
            autoClose: 2000
          });
        }, 100);
        
        // Clear session storage after restoration
        sessionStorage.removeItem('revise_itr_pending_step');
        sessionStorage.removeItem('revise_itr_form_data');
      } catch (error) {
        console.error('Error restoring form data:', error);
        toast.error('Failed to restore your form. Please start again.');
        // Clear corrupted data
        sessionStorage.removeItem('revise_itr_pending_step');
        sessionStorage.removeItem('revise_itr_form_data');
      }
    }
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'fullName':
        if (!value || value.trim().length < 3) error = 'Full name must be at least 3 characters';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!value) error = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) error = 'Phone must be 10 digits';
        break;
      case 'panNumber':
        if (!value) error = 'PAN is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format (e.g., ABCDE1234F)';
        break;
      case 'assessmentYear':
        if (!value) error = 'Assessment year is required';
        break;
      case 'itrType':
        if (!value) error = 'ITR type is required';
        break;
      case 'acknowledgmentNumber':
        if (!value) error = 'Acknowledgment number is required';
        else if (value.length !== 15) error = 'Acknowledgment number must be 15 digits';
        break;
      case 'originalFilingDate':
        if (!value) error = 'Original filing date is required';
        break;
      case 'revisionReason':
        if (!value || value.trim().length < 20) error = 'Please provide detailed revision reason (min 20 characters)';
        break;
      case 'address':
        if (!value || value.trim().length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'city':
        if (!value) error = 'City is required';
        break;
      case 'state':
        if (!value) error = 'State is required';
        break;
      case 'pincode':
        if (!value) error = 'Pincode is required';
        else if (!/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits';
        break;
      default:
        break;
    }
    return error;
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
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      setApplicationForm(prev => ({ ...prev, [name]: file }));
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) {
      ['fullName', 'email', 'phone', 'panNumber'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 2) {
      ['assessmentYear', 'itrType', 'acknowledgmentNumber', 'originalFilingDate', 'revisionReason'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) stepErrors[field] = error;
      });
    } else if (step === 4) {
      // Validate required documents for step 4
      if (!applicationForm.originalITR) {
        stepErrors.originalITR = 'Original ITR Copy is required';
      }
      if (!applicationForm.acknowledgmentReceipt) {
        stepErrors.acknowledgmentReceipt = 'Acknowledgment Receipt is required';
      }
    }
    return stepErrors;
  };

  const nextStep = () => {
    // Check authentication FIRST - before any validation
    // User must be logged in to proceed from Step 1 (Personal Details)
    if (currentStep === 1 && !isAuthenticated) {
      // Store current form data and intended step in sessionStorage
      sessionStorage.setItem('revise_itr_pending_step', '2');
      sessionStorage.setItem('revise_itr_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your ITR revision application', {
        position: 'top-center',
        autoClose: 3000
      });
      // Redirect to login with query parameters
      navigate(`/login?redirect=/services/revise-itr&step=2`, { 
        state: { from: '/services/revise-itr', returnStep: 2 } 
      });
      return;
    }
    
    // Validate all steps from 1 to current step
    for (let step = 1; step <= currentStep; step++) {
      const stepErrors = validateStep(step);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        Object.keys(stepErrors).forEach(key => setTouched(prev => ({ ...prev, [key]: true })));
        toast.error(`Please fix all errors in Step ${step} before proceeding`);
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' });
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!isAuthenticated) {
      sessionStorage.setItem('revise_itr_pending_step', '4');
      sessionStorage.setItem('revise_itr_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/revise-itr&step=4', { 
        state: { from: '/services/revise-itr', returnStep: 4 } 
      });
      return;
    }
    
    // Validate ALL 4 steps before submission
    const allErrors = {};
    for (let step = 1; step <= 4; step++) {
      const stepErrors = validateStep(step);
      Object.assign(allErrors, stepErrors);
    }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please complete all 4 steps with required information before submitting');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitITRRevisionApplication(applicationForm);
      toast.success('ITR Revision Application submitted successfully!');
      setShowSuccessModal(true);
      setApplicationForm({
        fullName: '', email: '', phone: '', panNumber: '', assessmentYear: '', itrType: '',
        acknowledgmentNumber: '', originalFilingDate: '', revisionReason: '', address: '', city: '',
        state: '', pincode: '', originalITR: null, acknowledgmentReceipt: null,
        supportingDocuments: null, revisedComputations: null, form26AS: null
      });
      setCurrentStep(1);
      setErrors({});
      setTouched({});
      setTimeout(() => navigate('/dashboard/retail-services'), 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

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

    try {
      const response = await fetch('http://127.0.0.1:8000/api/applications/revise-itr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heroFormData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Hero Form Response:', data);
        toast.success(`Thank you! Your inquiry (${data.inquiryId}) has been submitted. We will contact you soon.`);
        setHeroFormData({
          name: '',
          email: '',
          phone: '',
          service: 'ITR Revision Services'
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {!isPopupMode && <Navbar />}

      {/* Hero Section with Contact Form */}
      {!isPopupMode && <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-16 sm:pb-20 md:pb-24 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3")',
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
                Revise Your ITR
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-green-50 leading-relaxed">
                Made an error in your filed ITR? Don't worry! Our experts help you file a revised return to correct any mistakes or omissions in your original filing. We ensure your revised ITR is compliant and processed smoothly.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Error Correction</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Quick Filing</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">100% Compliant</span>
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
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Revise Your Return Today</h3>
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
      </section>}

      {/* What is ITR Revision Section */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              What is ITR Revision?
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              ITR Revision allows taxpayers to correct errors or add missing information in their original income tax return. Section 139(5) of the Income Tax Act permits filing a revised return to rectify mistakes discovered after filing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FileText className="text-white w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Legal Provision</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Governed by Section 139(5) of the Income Tax Act, allowing corrections to filed returns within specified time limits.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Target className="text-white w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Purpose</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Correct errors, claim missed deductions, report additional income, or update incorrect information in your original return.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <Award className="text-white w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Multiple Revisions</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                You can revise your return multiple times if needed, as long as it's within the permissible time frame.
              </p>
            </div>
          </div>
        </div>
      </section>}

      {/* When to Revise Section */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              When to Revise Your ITR
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: FaCalculator,
                title: 'Incorrect Income Details',
                description: 'Realized you reported wrong income figures from salary, business, or other sources after filing your return.'
              },
              {
                icon: FaPiggyBank,
                title: 'Missed Deductions',
                description: 'Forgot to claim eligible deductions under Section 80C, 80D, or other sections that could reduce your tax liability.'
              },
              {
                icon: FaFileAlt,
                title: 'Wrong ITR Form',
                description: 'Filed return using incorrect ITR form (e.g., ITR-1 instead of ITR-2 or ITR-3) which needs correction.'
              },
              {
                icon: FaChartLine,
                title: 'Additional Income',
                description: 'Discovered additional income sources like capital gains, rental income, or interest that were not included.'
              },
              {
                icon: FaCheckCircle,
                title: 'Bank Details Error',
                description: 'Entered incorrect bank account information, IFSC code, or other personal details that need updating.'
              },
              {
                icon: FaFileAlt,
                title: 'Calculation Mistakes',
                description: 'Found mathematical errors or calculation mistakes in tax computation or total income calculation.'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all border-t-4 border-green-600"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* Our Services Section */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our Revision Services
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide end-to-end assistance in filing revised returns. Our team reviews your original filing, identifies errors, and files the corrected return with proper documentation.
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Thorough review of your original ITR filing',
                'Identification of all errors and omissions',
                'Collection and verification of supporting documents',
                'Calculation of correct tax liability',
                'Filing of revised return on income tax portal',
                'Claiming all eligible deductions and exemptions',
                'Ensuring compliance with tax regulations',
                'Follow-up on processing status and updates'
              ].map((service, index) => (
                <li key={index} className="flex items-start text-gray-600 text-sm sm:text-base">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>}

      {/* Important Points Section */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Important Points to Remember
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <Target className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Time Limits</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>Revised return can be filed before the end of the relevant assessment year</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>Or before completion of assessment, whichever is earlier</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>No revision after assessment order is passed</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <Shield className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Key Requirements</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>Keep all supporting documents ready for verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>Revised returns undergo same scrutiny as original returns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">•</span>
                  <span>Multiple revisions allowed within time limit</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Processing Timeline</h3>
            <p className="text-sm sm:text-base text-green-100">Revised returns are typically processed within 2-4 weeks after successful filing, subject to verification by the Income Tax Department.</p>
          </div>
        </div>
      </section>}

      {/* Application Form Section */}
      <section id="application-form-section" className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">Apply for ITR Revision Service</h2>
              <p className="text-white/90 text-center mt-2 text-sm sm:text-base">Complete the form below to revise your Income Tax Return</p>
            </div>

            <div className="px-6 sm:px-8 py-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {[
                  { num: 1, label: 'Personal Info' },
                  { num: 2, label: 'Revision Details' },
                  { num: 3, label: 'Address' },
                  { num: 4, label: 'Documents' }
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                      currentStep >= step.num ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
                    }`}>{step.num}</div>
                    <span className={`mt-2 text-xs sm:text-sm font-medium text-center ${currentStep >= step.num ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleApplicationSubmit} className="px-6 sm:px-8 py-8">
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-green-600">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.fullName ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                          placeholder="Enter your full name" />
                      </div>
                      {errors.fullName && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                          placeholder="you@example.com" />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} maxLength="10"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                          placeholder="10-digit mobile number" />
                      </div>
                      {errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">PAN Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} maxLength="10"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all uppercase ${errors.panNumber ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                          placeholder="ABCDE1234F" />
                      </div>
                      {errors.panNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.panNumber}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-green-600">ITR Revision Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Year <span className="text-red-500">*</span></label>
                      <select name="assessmentYear" value={applicationForm.assessmentYear} onChange={handleApplicationChange} onBlur={() => handleBlur('assessmentYear')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.assessmentYear ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}>
                        <option value="">Select assessment year</option>
                        <option value="2023-24">2023-24</option>
                        <option value="2022-23">2022-23</option>
                        <option value="2021-22">2021-22</option>
                        <option value="2020-21">2020-21</option>
                      </select>
                      {errors.assessmentYear && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.assessmentYear}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ITR Type <span className="text-red-500">*</span></label>
                      <select name="itrType" value={applicationForm.itrType} onChange={handleApplicationChange} onBlur={() => handleBlur('itrType')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.itrType ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}>
                        <option value="">Select ITR type</option>
                        <option value="ITR-1">ITR-1 (Sahaj)</option>
                        <option value="ITR-2">ITR-2</option>
                        <option value="ITR-3">ITR-3</option>
                        <option value="ITR-4">ITR-4 (Sugam)</option>
                      </select>
                      {errors.itrType && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.itrType}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Acknowledgment Number <span className="text-red-500">*</span></label>
                      <input type="text" name="acknowledgmentNumber" value={applicationForm.acknowledgmentNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('acknowledgmentNumber')} maxLength="15"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.acknowledgmentNumber ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                        placeholder="15-digit acknowledgment number" />
                      {errors.acknowledgmentNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.acknowledgmentNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Original Filing Date <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="date" name="originalFilingDate" value={applicationForm.originalFilingDate} onChange={handleApplicationChange} onBlur={() => handleBlur('originalFilingDate')}
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.originalFilingDate ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`} />
                      </div>
                      {errors.originalFilingDate && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.originalFilingDate}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Revision <span className="text-red-500">*</span></label>
                      <textarea name="revisionReason" value={applicationForm.revisionReason} onChange={handleApplicationChange} onBlur={() => handleBlur('revisionReason')} rows="4"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${errors.revisionReason ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                        placeholder="Provide detailed reason for revision (minimum 20 characters)"></textarea>
                      {errors.revisionReason && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.revisionReason}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-green-600">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                        <textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="3"
                          className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${errors.address ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                          placeholder="House/Flat No., Building Name, Street, Area"></textarea>
                      </div>
                      {errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.address}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                      <input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.city ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                        placeholder="Enter city" />
                      {errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State <span className="text-red-500">*</span></label>
                      <input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.state ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                        placeholder="Enter state" />
                      {errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.state}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode <span className="text-red-500">*</span></label>
                      <input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} maxLength="6"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.pincode ? 'border-red-500 focus:border-red-600 focus:ring-red-200' : 'border-gray-200 focus:border-green-600 focus:ring-green-200'}`}
                        placeholder="6-digit pincode" />
                      {errors.pincode && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-green-600">Required Documents</h3>
                  <p className="text-sm text-gray-600 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <strong>Note:</strong> Upload clear, legible copies. Accepted formats: JPG, PNG, PDF (Max 5MB per file)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: 'originalITR', label: 'Original ITR Copy', required: true },
                      { name: 'acknowledgmentReceipt', label: 'Acknowledgment Receipt', required: true },
                      { name: 'supportingDocuments', label: 'Supporting Documents', required: false },
                      { name: 'revisedComputations', label: 'Revised Computations', required: false },
                      { name: 'form26AS', label: 'Form 26AS', required: false }
                    ].map((doc) => (
                      <div key={doc.name}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {doc.label} {doc.required && <span className="text-red-500">*</span>}
                        </label>
                        <div className={`relative border-2 border-dashed rounded-lg p-4 hover:border-green-500 transition-all cursor-pointer ${
                          errors[doc.name] 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300 bg-gray-50'
                        }`}>
                          <input type="file" name={doc.name} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="text-center">
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${errors[doc.name] ? 'text-red-400' : 'text-gray-400'}`} />
                            <p className={`text-sm ${errors[doc.name] ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                              {applicationForm[doc.name] ? applicationForm[doc.name].name : 'Click to upload'}
                            </p>
                          </div>
                        </div>
                        {errors[doc.name] && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> {errors[doc.name]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300">← Previous</button>
                )}
                {currentStep < 4 ? (
                  <button type="button" onClick={nextStep} className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg">Next Step →</button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">Your ITR revision application has been received. Our team will contact you within 24 hours.</p>
              <button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Need to Revise Your ITR?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-green-50 mb-6 sm:mb-8 leading-relaxed">
            Get expert help to file your revised return correctly and claim all eligible benefits
          </p>
          <button
            onClick={handleContactClick}
            className="inline-block bg-white text-green-700 px-8 sm:px-10 py-4 sm:py-5 rounded-lg font-bold hover:bg-green-50 transform hover:scale-105 transition-all shadow-lg text-base sm:text-lg"
          >
            Contact Us Now →
          </button>
        </div>
      </section>}

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

      {!isPopupMode && <Footer />}
    </div>
  );
};

export default ReviseITR;
