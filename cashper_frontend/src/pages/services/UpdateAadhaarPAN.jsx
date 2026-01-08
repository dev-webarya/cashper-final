import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaIdCard, FaEdit, FaCheckCircle, FaUserShield, FaClock, FaMobileAlt, FaHome, FaCalendarAlt, FaLink, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { CheckCircle, FileText, X, Phone, Mail, Upload, AlertCircle, User, IdCard as IdCardIcon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitDocumentUpdateApplication } from '../../services/retailServicesApi';

const UpdateAadhaarPAN = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    const pendingStep = sessionStorage.getItem('update_aadhaar_pan_pending_step');
    const savedFormData = sessionStorage.getItem('update_aadhaar_pan_form_data');
    if (token && pendingStep && savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        const step = parseInt(pendingStep);
        setApplicationForm(formData);
        setCurrentStep(step);
        setTimeout(() => { toast.success('Welcome back! Continuing your update application...', { position: 'top-center', autoClose: 2000 }); }, 100);
        sessionStorage.removeItem('update_aadhaar_pan_pending_step');
        sessionStorage.removeItem('update_aadhaar_pan_form_data');
      } catch (error) {
        console.error('Error restoring form data:', error);
        toast.error('Failed to restore your form. Please start again.');
        sessionStorage.removeItem('update_aadhaar_pan_pending_step');
        sessionStorage.removeItem('update_aadhaar_pan_form_data');
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

  // Application Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '', email: '', phone: '', aadhaarNumber: '',
    panNumber: '', updateType: '', currentAddress: '', newAddress: '',
    updateReason: '', dateOfBirth: '',
    address: '', city: '', state: '', pincode: '',
    aadhaarCard: null, panCard: null, addressProof: null, photograph: null, dobProof: null
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    switch(name) {
      case 'fullName': if (!value || value.trim().length < 3) error = 'Full name must be at least 3 characters'; break;
      case 'email': if (!value) error = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format'; break;
      case 'phone': if (!value) error = 'Phone number is required'; else if (!/^[0-9]{10}$/.test(value.replace(/\D/g, ''))) error = 'Phone must be 10 digits'; break;
      case 'aadhaarNumber': if (!value) error = 'Aadhaar is required'; else if (!/^[0-9]{12}$/.test(value.replace(/\s/g, ''))) error = 'Aadhaar must be 12 digits'; break;
      case 'panNumber': if (!value) error = 'PAN is required'; else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) error = 'Invalid PAN format (e.g., ABCDE1234F)'; break;
      case 'updateType': if (!value) error = 'Update type is required'; break;
      case 'currentAddress': if (!value || value.trim().length < 10) error = 'Current address is required (min 10 characters)'; break;
      case 'newAddress': if (!value || value.trim().length < 10) error = 'New address is required (min 10 characters)'; break;
      case 'updateReason': if (!value || value.trim().length < 20) error = 'Please provide detailed reason (min 20 characters)'; break;
      case 'dateOfBirth': if (!value) error = 'Date of birth is required'; break;
      case 'address': if (!value || value.trim().length < 10) error = 'Address must be at least 10 characters'; break;
      case 'city': if (!value) error = 'City is required'; break;
      case 'state': if (!value) error = 'State is required'; break;
      case 'pincode': if (!value) error = 'Pincode is required'; else if (!/^[0-9]{6}$/.test(value)) error = 'Pincode must be 6 digits'; break;
      default: break;
    }
    return error;
  };

  const handleApplicationChange = (e) => { const { name, value } = e.target; setApplicationForm(prev => ({ ...prev, [name]: value })); if (touched[name]) { const error = validateField(name, value); setErrors(prev => ({ ...prev, [name]: error })); } };
  const handleBlur = (fieldName) => { setTouched(prev => ({ ...prev, [fieldName]: true })); const error = validateField(fieldName, applicationForm[fieldName]); setErrors(prev => ({ ...prev, [fieldName]: error })); };

  const handleFileChange = (e) => {
    const { name, files } = e.target; const file = files[0];
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
    if (step === 1) ['fullName', 'email', 'phone', 'aadhaarNumber', 'panNumber'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 2) ['updateType', 'currentAddress', 'newAddress', 'updateReason', 'dateOfBirth'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 3) ['address', 'city', 'state', 'pincode'].forEach(field => { const error = validateField(field, applicationForm[field]); if (error) stepErrors[field] = error; });
    else if (step === 4) {
      if (!applicationForm.aadhaarCard) stepErrors.aadhaarCard = 'Aadhaar Card Copy is required';
      if (!applicationForm.panCard) stepErrors.panCard = 'PAN Card Copy is required';
      if (!applicationForm.addressProof) stepErrors.addressProof = 'Address Proof is required';
      if (!applicationForm.photograph) stepErrors.photograph = 'Recent Photograph is required';
      if (!applicationForm.dobProof) stepErrors.dobProof = 'Date of Birth Proof is required';
    }
    return stepErrors;
  };

  const nextStep = () => { if (currentStep === 1 && !isAuthenticated) { sessionStorage.setItem('update_aadhaar_pan_pending_step', '2'); sessionStorage.setItem('update_aadhaar_pan_form_data', JSON.stringify(applicationForm)); toast.warning('Please login to continue with your update application', { position: 'top-center', autoClose: 3000 }); navigate(`/login?redirect=/services/update-aadhaar-pan&step=2`, { state: { from: '/services/update-aadhaar-pan', returnStep: 2 } }); return; } const stepErrors = validateStep(currentStep); if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); Object.keys(stepErrors).forEach(key => setTouched(prev => ({ ...prev, [key]: true }))); toast.error('Please fix all errors before proceeding'); return; } setCurrentStep(prev => prev + 1); window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' }); };
  const prevStep = () => { setCurrentStep(prev => prev - 1); window.scrollTo({ top: document.getElementById('application-form-section')?.offsetTop - 100 || 0, behavior: 'smooth' }); };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { sessionStorage.setItem('update_aadhaar_pan_pending_step', '4'); sessionStorage.setItem('update_aadhaar_pan_form_data', JSON.stringify(applicationForm)); toast.error('Please login to submit your application'); navigate('/login?redirect=/services/update-aadhaar-pan&step=4', { state: { from: '/services/update-aadhaar-pan', returnStep: 4 } }); return; }
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
      await submitDocumentUpdateApplication(applicationForm);
      toast.success('Document Update Application submitted successfully!');
      setShowSuccessModal(true);
      setApplicationForm({ fullName: '', email: '', phone: '', aadhaarNumber: '', panNumber: '', updateType: '', currentAddress: '', newAddress: '', updateReason: '', dateOfBirth: '', address: '', city: '', state: '', pincode: '', aadhaarCard: null, panCard: null, addressProof: null, photograph: null, dobProof: null });
      setCurrentStep(1); setErrors({}); setTouched({});
      setTimeout(() => navigate('/dashboard/retail-services'), 2000);
    } catch (error) { toast.error(error.message || 'Failed to submit application'); } finally { setIsSubmitting(false); }
  };

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
      const response = await fetch('http://127.0.0.1:8000/api/applications/update-aadhaar-pan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heroFormData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Thank you! Your inquiry (${data.inquiryId}) has been submitted. Our document expert will contact you soon.`);
        setHeroFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmittingHero(false);
    }
  };

  const features = [
    { icon: FaIdCard, title: "Aadhaar Updates", desc: "Name, DOB, address corrections" },
    { icon: FaEdit, title: "PAN Corrections", desc: "All PAN details modification" },
    { icon: FaLink, title: "Aadhaar-PAN Link", desc: "Mandatory linking service" },
    { icon: FaCheckCircle, title: "Quick Process", desc: "Fast & hassle-free updates" },
  ];

  const aadhaarServices = [
    { icon: FaUserShield, title: "Name Correction", desc: "Update or correct your name" },
    { icon: FaCalendarAlt, title: "DOB Update", desc: "Date of birth correction" },
    { icon: FaHome, title: "Address Change", desc: "Current & permanent address" },
    { icon: FaMobileAlt, title: "Mobile/Email", desc: "Contact details update" },
  ];

  return (
    <>
      {!isPopupMode && <Navbar />}
      <div className="min-h-screen bg-gray-50">
      
      {!isPopupMode && (
      <>
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
                Update Aadhaar & <span className="text-yellow-300">PAN Details</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                Seamlessly update your Aadhaar and PAN card information. Expert assistance for corrections, modifications, and mandatory Aadhaar-PAN linking.
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

      {/* Features Grid */}
      <div className="py-8 md:py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-green-50 to-teal-50 p-4 md:p-6 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-2 border border-green-100">
                <feature.icon className="text-3xl md:text-4xl text-green-600 mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-xs md:text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          {/* Aadhaar Services Grid */}
          <div id="services" className="mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-center text-gray-800">
              Aadhaar Update Services
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {aadhaarServices.map((service, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <service.icon className="text-4xl text-green-600 mb-4" />
                  <h3 className="text-lg font-bold mb-2 text-gray-800">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">All Aadhaar Updates</h2>
              <div className="space-y-4">
                {[
                  "Name correction or update",
                  "Date of birth correction",
                  "Address change (current & permanent)",
                  "Mobile number and email update",
                  "Gender correction",
                  "Biometric update (fingerprints, iris, photo)"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <FaCheckCircle className="text-green-600 text-lg flex-shrink-0 mt-1" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">PAN Card Updates</h2>
              <div className="space-y-4">
                {[
                  "Name correction or change",
                  "Date of birth correction",
                  "Father's/Mother's name update",
                  "Address change",
                  "Contact details update",
                  "Photograph update",
                  "Signature update"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <FaCheckCircle className="text-green-600 text-lg flex-shrink-0 mt-1" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aadhaar-PAN Linking */}
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white mb-8">
            <div className="text-center mb-8">
              <FaLink className="text-5xl md:text-6xl mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Aadhaar-PAN Linking Service</h2>
              <p className="text-green-50 text-base md:text-lg max-w-3xl mx-auto">
                Mandatory linking as per Income Tax rules. We make it simple and error-free.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {[
                "Online linking through Income Tax portal",
                "Resolve name/DOB mismatch issues",
                "Verification of successful linking",
                "Download Aadhaar-linked PAN confirmation"
              ].map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-300 text-xl flex-shrink-0 mt-1" />
                  <span className="text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Update Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">Why Update Your Details?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[
                { icon: FaCheckCircle, text: "Avoid rejection of financial transactions" },
                { icon: FaIdCard, text: "Ensure ITR filing doesn't get rejected" },
                { icon: FaClock, text: "Prevent delays in subsidy disbursement" },
                { icon: FaUserShield, text: "Comply with KYC requirements" },
                { icon: FaLink, text: "Avoid penalties for non-linking" },
                { icon: FaMobileAlt, text: "Smooth digital transactions" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="bg-green-600 text-white p-3 rounded-lg">
                    <item.icon className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
      )}

          {/* Application Form Section */}
          <section id="application-form-section" className={isPopupMode ? "py-4 bg-white" : "py-12 sm:py-16 md:py-20 bg-gradient-to-br from-white via-green-50 to-white"}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">Document Update Application</h2>
                  <p className="text-green-50 text-center mt-2">Complete the form to update your Aadhaar/PAN details</p>
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
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="fullName" value={applicationForm.fullName} onChange={handleApplicationChange} onBlur={() => handleBlur('fullName')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.fullName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter your full name" /></div>{errors.fullName && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.fullName}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label><div className="relative"><FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="email" name="email" value={applicationForm.email} onChange={handleApplicationChange} onBlur={() => handleBlur('email')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="your.email@example.com" /></div>{errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.email}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label><div className="relative"><FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="tel" name="phone" value={applicationForm.phone} onChange={handleApplicationChange} onBlur={() => handleBlur('phone')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="10-digit mobile number" /></div>{errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.phone}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number *</label><div className="relative"><IdCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="aadhaarNumber" value={applicationForm.aadhaarNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('aadhaarNumber')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.aadhaarNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="12-digit Aadhaar" maxLength="12" /></div>{errors.aadhaarNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.aadhaarNumber}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label><div className="relative"><IdCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="panNumber" value={applicationForm.panNumber} onChange={handleApplicationChange} onBlur={() => handleBlur('panNumber')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg uppercase ${errors.panNumber ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="ABCDE1234F" maxLength="10" /></div>{errors.panNumber && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.panNumber}</p>}</div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Update Details</h3>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Update Type *</label><select name="updateType" value={applicationForm.updateType} onChange={handleApplicationChange} onBlur={() => handleBlur('updateType')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.updateType ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`}><option value="">Select Update Type</option><option value="Aadhaar">Aadhaar Update Only</option><option value="PAN">PAN Update Only</option><option value="Both">Both Aadhaar & PAN</option><option value="Linking">Aadhaar-PAN Linking</option></select>{errors.updateType && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.updateType}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Address *</label><textarea name="currentAddress" value={applicationForm.currentAddress} onChange={handleApplicationChange} onBlur={() => handleBlur('currentAddress')} rows="3" className={`w-full px-4 py-3 border-2 rounded-lg ${errors.currentAddress ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter current address (min 10 characters)"></textarea>{errors.currentAddress && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.currentAddress}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">New Address *</label><textarea name="newAddress" value={applicationForm.newAddress} onChange={handleApplicationChange} onBlur={() => handleBlur('newAddress')} rows="3" className={`w-full px-4 py-3 border-2 rounded-lg ${errors.newAddress ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter new address (min 10 characters)"></textarea>{errors.newAddress && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.newAddress}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Update Reason *</label><textarea name="updateReason" value={applicationForm.updateReason} onChange={handleApplicationChange} onBlur={() => handleBlur('updateReason')} rows="3" className={`w-full px-4 py-3 border-2 rounded-lg ${errors.updateReason ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Describe reason for update (min 20 characters)"></textarea>{errors.updateReason && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.updateReason}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label><input type="date" name="dateOfBirth" value={applicationForm.dateOfBirth} onChange={handleApplicationChange} onBlur={() => handleBlur('dateOfBirth')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} />{errors.dateOfBirth && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.dateOfBirth}</p>}</div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Address Information</h3>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" /><textarea name="address" value={applicationForm.address} onChange={handleApplicationChange} onBlur={() => handleBlur('address')} rows="3" className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="Enter complete address"></textarea></div>{errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.address}</p>}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={applicationForm.city} onChange={handleApplicationChange} onBlur={() => handleBlur('city')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="City" />{errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.city}</p>}</div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={applicationForm.state} onChange={handleApplicationChange} onBlur={() => handleBlur('state')} className={`w-full px-4 py-3 border-2 rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="State" />{errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.state}</p>}</div></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><div className="relative"><FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" name="pincode" value={applicationForm.pincode} onChange={handleApplicationChange} onBlur={() => handleBlur('pincode')} className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${errors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-green-500'}`} placeholder="6-digit pincode" maxLength="6" /></div>{errors.pincode && <p className="mt-1 text-sm text-red-600 flex items-center"><span className="mr-1">⚠</span>{errors.pincode}</p>}</div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Document Uploads</h3>
                        <p className="text-sm text-gray-600 mb-4">Upload required documents (Max 5MB each, JPG/PNG/PDF only)</p>
                        {[{name: 'aadhaarCard', label: 'Aadhaar Card Copy *', required: true},{name: 'panCard', label: 'PAN Card Copy *', required: true},{name: 'addressProof', label: 'Address Proof *', required: true},{name: 'photograph', label: 'Recent Photograph *', required: true},{name: 'dobProof', label: 'Date of Birth Proof *', required: true}].map(doc => (
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
                <div className="text-center"><CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" /><h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3><p className="text-gray-600 mb-6">Your document update application has been received. We'll process it and contact you within 2-3 business days.</p><button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-medium transition-all">Close</button></div>
              </div>
            </div>
          )}

          {!isPopupMode && (
          <>
          {/* CTA Section */}
          <div className="text-center bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gray-800">Ready to Update Your Documents?</h2>
            <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              Get expert assistance for all Aadhaar and PAN updates. Fast, secure, and hassle-free service.
            </p>
            <button
              onClick={handleContactClick}
              className="inline-block bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 md:px-12 py-4 md:py-5 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all text-base md:text-lg font-bold shadow-lg transform hover:scale-105"
            >
              Contact Us Now →
            </button>
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
      </>
      )}

      </div>
      {!isPopupMode && <Footer />}
    </>
  );
};

export default UpdateAadhaarPAN;
