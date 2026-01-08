import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaFileAlt, FaBalanceScale, FaGavel, FaShieldAlt, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaHome, FaCalendar } from 'react-icons/fa';
import { CheckCircle, FileText, Shield, Scale, Award, AlertTriangle, X, Phone, Mail, Upload, AlertCircle, User, IdCard as IdCardIcon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitITRNoticeReplyApplication } from '../../services/retailServicesApi';

const ReplyITRNotice = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
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
    fullName: '', email: '', phone: '', panNumber: '',
    noticeType: '', noticeDate: '', assessmentYear: '', noticeReferenceNumber: '',
    cpcOrAO: '', noticeDetails: '', address: '', city: '', state: '', pincode: '',
    noticeCopy: null, itrCopy: null, form26AS: null, supportingDocuments: null, correspondence: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    const pendingStep = sessionStorage.getItem('reply_itr_notice_pending_step');
    const savedFormData = sessionStorage.getItem('reply_itr_notice_form_data');
    if (token && pendingStep && savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        const step = parseInt(pendingStep);
        setApplicationForm(formData);
        setCurrentStep(step);
        setTimeout(() => {
          toast.success('Welcome back! Continuing your ITR notice reply application...', {
            position: 'top-center',
            autoClose: 2000
          });
        }, 100);
        sessionStorage.removeItem('reply_itr_notice_pending_step');
        sessionStorage.removeItem('reply_itr_notice_form_data');
      } catch (error) {
        console.error('Error restoring form data:', error);
        toast.error('Failed to restore your form. Please start again.');
        sessionStorage.removeItem('reply_itr_notice_pending_step');
        sessionStorage.removeItem('reply_itr_notice_form_data');
      }
    }
  }, []);

  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'fullName': if (!value || value.trim().length < 3) error = 'Full name must be at least 3 characters'; break;
      case 'email': if (!value) error = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format'; break;
      case 'phone': if (!value) error = 'Phone number is required'; else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) error = 'Phone must be 10 digits'; break;
      case 'panNumber': if (!value) error = 'PAN is required'; else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format (e.g., ABCDE1234F)'; break;
      case 'noticeType': if (!value) error = 'Notice type is required'; break;
      case 'noticeDate': if (!value) error = 'Notice date is required'; break;
      case 'assessmentYear': if (!value) error = 'Assessment year is required'; break;
      case 'noticeReferenceNumber': if (!value) error = 'Notice reference number is required'; break;
      case 'cpcOrAO': if (!value) error = 'Please select CPC or AO'; break;
      case 'noticeDetails': if (!value || value.trim().length < 20) error = 'Please provide detailed notice information (min 20 characters)'; break;
      case 'address': if (!value || value.trim().length < 10) error = 'Address must be at least 10 characters'; break;
      case 'city': if (!value) error = 'City is required'; break;
      case 'state': if (!value) error = 'State is required'; break;
      case 'pincode': if (!value) error = 'Pincode is required'; else if (!/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits'; break;
      default: break;
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
      if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) { toast.error('Only JPG, PNG, and PDF files are allowed'); return; }
      setApplicationForm(prev => ({ ...prev, [name]: file }));
      toast.success(`${file.name} uploaded successfully`);
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) ['fullName', 'email', 'phone', 'panNumber'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 2) ['noticeType', 'noticeDate', 'assessmentYear', 'noticeReferenceNumber', 'cpcOrAO', 'noticeDetails'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 3) ['address', 'city', 'state', 'pincode'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 4) {
      if (!applicationForm.noticeCopy) stepErrors.noticeCopy = 'Notice Copy is required';
      if (!applicationForm.itrCopy) stepErrors.itrCopy = 'ITR Copy is required';
    }
    return stepErrors;
  };

  const nextStep = () => {
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('reply_itr_notice_pending_step', '2');
      sessionStorage.setItem('reply_itr_notice_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your ITR notice reply application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate(`/login?redirect=/services/reply-itr-notice&step=2`, { 
        state: { from: '/services/reply-itr-notice', returnStep: 2 } 
      });
      return;
    }
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); Object.keys(stepErrors).forEach(key => setTouched(prev => ({ ...prev, [key]: true }))); toast.error('Please fix all errors before proceeding'); return; }
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' });
  };

  const prevStep = () => { setCurrentStep(prev => prev - 1); window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' }); };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      sessionStorage.setItem('reply_itr_notice_pending_step', '4');
      sessionStorage.setItem('reply_itr_notice_form_data', JSON.stringify(applicationForm));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/reply-itr-notice&step=4', { 
        state: { from: '/services/reply-itr-notice', returnStep: 4 } 
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
      await submitITRNoticeReplyApplication(applicationForm);
      toast.success('ITR Notice Reply Application submitted successfully!');
      setShowSuccessModal(true);
      setApplicationForm({ fullName: '', email: '', phone: '', panNumber: '', noticeType: '', noticeDate: '', assessmentYear: '', noticeReferenceNumber: '', cpcOrAO: '', noticeDetails: '', address: '', city: '', state: '', pincode: '', noticeCopy: null, itrCopy: null, form26AS: null, supportingDocuments: null, correspondence: null });
      setCurrentStep(1); setErrors({}); setTouched({});
      setTimeout(() => navigate('/dashboard/retail-services'), 2000);
    } catch (error) { toast.error(error.message || 'Failed to submit application'); } finally { setIsSubmitting(false); }
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
      const response = await fetch('http://127.0.0.1:8000/api/applications/reply-itr-notice', {
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
          service: 'ITR Notice Response Services'
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
            backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3")',
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
                Reply to ITR Notice
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-green-50 leading-relaxed">
                Received an Income Tax notice? Don't panic! Our experienced tax consultants provide expert guidance in responding to various types of ITR notices, ensuring timely and accurate compliance to avoid penalties.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Expert Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Timely Filing</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Penalty Avoidance</span>
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
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Get Expert Help Now</h3>
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

      {/* What is ITR Notice Section */}
      {!isPopupMode && <section className="py-8 sm:py-8 md:py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Understanding ITR Notices
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Income Tax notices are sent by the IT Department to taxpayers for various reasons such as discrepancies, incomplete information, or verification of returns. Quick and accurate response is crucial.
            </p>
          </div>
        </div>
      </section>}

      {/* Types of Notices Section */}
      {!isPopupMode && <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Types of Notices We Handle
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'Section 139(9)',
                subtitle: 'Defective Return Notice',
                description: 'Sent when the filed return has defects or incomplete information. Requires correction within 15 days.'
              },
              {
                title: 'Section 143(1)',
                subtitle: 'Intimation Notice',
                description: 'Intimation regarding discrepancies in your ITR. Tax department adjusts calculations and informs you of tax due or refund.'
              },
              {
                title: 'Section 143(2)',
                subtitle: 'Scrutiny Assessment',
                description: 'Detailed scrutiny of your return. Requires submission of documents and explanations within specified timeframe.'
              },
              {
                title: 'Section 142(1)',
                subtitle: 'Inquiry Notice',
                description: 'Sent for non-filing of return or to seek additional information. Must respond within stipulated time.'
              },
              {
                title: 'Section 148',
                subtitle: 'Reassessment Notice',
                description: 'Issued when income has escaped assessment. Requires filing of return or explanation within time limit.'
              },
              {
                title: 'Section 156',
                subtitle: 'Demand Notice',
                description: 'Outstanding tax demand notice. Pay the demand or file rectification application if you disagree.'
              }
            ].map((notice, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all border-t-4 border-green-600"
              >
                <div className="flex items-start mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                    <FileText className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{notice.title}</h3>
                    <p className="text-sm text-green-600 font-semibold">{notice.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{notice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {/* Application Form Section */}
      <section id="application-form-section" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">ITR Notice Reply Application</h2>
              <p className="text-green-50 text-center mt-2">Fill out the form below to get expert assistance</p>
            </div>

            <div className="px-4 sm:px-6 md:px-8 py-6">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>
                    {step < 4 && <div className={`w-12 sm:w-20 md:w-32 h-1 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`}></div>}
                  </div>
                ))}
              </div>

              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h3>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><div className="relative"><FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter your full name" /></div>{errors.fullName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.fullName}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="your.email@example.com" /></div>{errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.email}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit mobile number" /></div>{errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.phone}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label><div className="relative"><FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="ABCDE1234F" maxLength="10" /></div>{errors.panNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.panNumber}</p>}</div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Notice Details</h3>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notice Type *</label><select name="noticeType" value={applicationForm.noticeType} onChange={handleApplicationChange} onBlur={() => handleBlur('noticeType')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.noticeType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Notice Type</option><option value="143(1)">Section 143(1) - Intimation</option><option value="148">Section 148 - Reassessment</option><option value="156">Section 156 - Demand Notice</option><option value="245">Section 245 - Set-off of Refund</option><option value="Other">Other</option></select>{errors.noticeType && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.noticeType}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notice Date *</label><div className="relative"><FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="date" name="noticeDate" value={applicationForm.noticeDate} onChange={handleApplicationChange} onBlur={() => handleBlur('noticeDate')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.noticeDate ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} /></div>{errors.noticeDate && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.noticeDate}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Assessment Year *</label><select name="assessmentYear" value={applicationForm.assessmentYear} onChange={handleApplicationChange} onBlur={() => handleBlur('assessmentYear')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.assessmentYear ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Assessment Year</option><option value="2023-24">2023-24</option><option value="2022-23">2022-23</option><option value="2021-22">2021-22</option><option value="2020-21">2020-21</option><option value="2019-20">2019-20</option></select>{errors.assessmentYear && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.assessmentYear}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notice Reference Number *</label><input type="text" name="noticeReferenceNumber" value={applicationForm.noticeReferenceNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('noticeReferenceNumber')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.noticeReferenceNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter reference number from notice" />{errors.noticeReferenceNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.noticeReferenceNumber}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Notice Issued By *</label><div className="flex gap-6"><label className="flex items-center"><input type="radio" name="cpcOrAO" value="CPC" checked={applicationForm.cpcOrAO === 'CPC'} onChange={handleApplicationChange} className="mr-2" /><span>CPC (Centralized Processing Centre)</span></label><label className="flex items-center"><input type="radio" name="cpcOrAO" value="AO" checked={applicationForm.cpcOrAO === 'AO'} onChange={handleApplicationChange} className="mr-2" /><span>AO (Assessing Officer)</span></label></div>{errors.cpcOrAO && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.cpcOrAO}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Notice Details *</label><textarea name="noticeDetails" value={applicationForm.noticeDetails} onChange={handleApplicationChange} onBlur={() => handleBlur('noticeDetails')} rows="4" className={`w-full px-4 py-3 border-2 rounded-lg ${errors.noticeDetails ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Describe the notice details (minimum 20 characters)"></textarea>{errors.noticeDetails && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.noticeDetails}</p>}</div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Address Information</h3>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" /><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="3" className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter your complete address"></textarea></div>{errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.address}</p>}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="City" />{errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.city}</p>}</div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="State" />{errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.state}</p>}</div></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><div className="relative"><FaHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="6-digit pincode" maxLength="6" /></div>{errors.pincode && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.pincode}</p>}</div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Document Uploads</h3>
                    <p className="text-sm text-gray-600 mb-4">Upload required documents (Max 5MB each, JPG/PNG/PDF only)</p>
                    {[{name: 'noticeCopy', label: 'Notice Copy *', required: true},{name: 'itrCopy', label: 'ITR Copy *', required: true},{name: 'form26AS', label: 'Form 26AS', required: false},{name: 'supportingDocuments', label: 'Supporting Documents', required: false},{name: 'correspondence', label: 'Previous Correspondence', required: false}].map(doc => (
                      <div key={doc.name}><label className="block text-sm font-medium text-gray-700 mb-2">{doc.label}</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors"><input type="file" name={doc.name} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" className="hidden" id={doc.name} /><label htmlFor={doc.name} className="cursor-pointer flex flex-col items-center"><Upload className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm text-gray-600">{applicationForm[doc.name] ? applicationForm[doc.name].name : 'Click to upload or drag and drop'}</span><span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (max 5MB)</span></label></div></div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (<button type="button" onClick={prevStep} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Previous</button>)}
                  {currentStep < 4 ? (<button type="button" onClick={nextStep} className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all transform hover:scale-105">Next Step</button>) : (<button type="submit" disabled={isSubmitting} className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit Application'}</button>)}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="text-center"><CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" /><h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3><p className="text-gray-600 mb-6">Thank you for your application. Our team will review your notice and contact you within 24 hours with a comprehensive response plan.</p><button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all">Close</button></div>
          </div>
        </div>
      )}

      {/* How We Help Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              How We Help You
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Thorough analysis of the notice and its implications',
                'Gathering and organizing necessary documentation',
                'Preparing comprehensive and legally sound response',
                'Representing you before Income Tax authorities',
                'Professional communication with IT Department',
                'Ensuring compliance with all legal requirements',
                'Timely filing within stipulated deadlines',
                'Follow-up on response status and updates'
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

      {/* Why Act Quickly Section */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Quick Response is Critical
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-red-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-600 w-8 h-8 mr-3" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Consequences of Delay</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Heavy penalties and interest charges',
                  'Possible prosecution in severe cases',
                  'Additional tax liability',
                  'Freezing of bank accounts',
                  'Asset attachment by tax authorities'
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm sm:text-base">
                    <span className="text-red-600 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border-l-4 border-green-600">
              <div className="flex items-center mb-4">
                <Shield className="text-green-600 w-8 h-8 mr-3" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Benefits of Quick Action</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Avoid penalties and interest',
                  'Time to gather proper documentation',
                  'Better chances of favorable outcome',
                  'Prevent unnecessary tax liability',
                  'Peace of mind and compliance'
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm sm:text-base">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Standard Response Deadlines</h3>
            <p className="text-sm sm:text-base text-green-100 mb-4">Most notices require response within 15-30 days from the date of receipt</p>
            <p className="text-base sm:text-lg font-semibold">Don't wait until the last minute - Contact us immediately!</p>
          </div>
        </div>
      </section>}

      {/* CTA Section */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Received an ITR Notice?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-green-50 mb-6 sm:mb-8 leading-relaxed">
            Get expert help to respond correctly and avoid penalties
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

      <Footer />
      {!isPopupMode && <Footer />}
    </div>
  );
};

export default ReplyITRNotice;
