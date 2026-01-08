import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaCalculator, FaUsers, FaFileAlt, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { CheckCircle, FileText, IdCard, Home, TrendingUp, Target, Building, Users, Award, X, Phone, Mail, ArrowLeft, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitPayrollServices } from '../../services/businessServicesApi';

const PayrollServices = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [heroFormData, setHeroFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Application Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    numberOfEmployees: '',
    industryType: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    companyPAN: '',
    gstNumber: '',
    pfNumber: '',
    esiNumber: ''
  });
  const [documents, setDocuments] = useState({
    employeeData: null,
    companyDocuments: null,
    registrationProofs: null
  });
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    const savedFormData = sessionStorage.getItem('payroll_services_form_data');
    const savedStep = sessionStorage.getItem('payroll_services_pending_step');
    
    if (savedFormData && token) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        sessionStorage.removeItem('payroll_services_form_data');
        sessionStorage.removeItem('payroll_services_pending_step');
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
      const response = await fetch('http://localhost:8000/api/corporate-inquiry/payroll-services', {
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
        toast.success(data.message || 'Thank you! We will contact you soon.');
        setHeroFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(data.detail || 'Failed to submit inquiry.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmittingHero(false);
    }
  };

  // Application Form Handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setDocuments(prev => ({ ...prev, [docType]: file }));
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.name.trim()) {
          toast.error('⚠️ Full name is required');
          return false;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('⚠️ Please enter a valid email address');
          return false;
        }
        if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
          toast.error('⚠️ Please enter a valid 10-digit phone number');
          return false;
        }
        if (!formData.companyName) {
          toast.error('⚠️ Company name is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.numberOfEmployees) {
          toast.error('⚠️ Number of employees is required');
          return false;
        }
        if (!formData.industryType) {
          toast.error('⚠️ Industry type is required');
          return false;
        }
        if (!formData.companyPAN || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.companyPAN)) {
          toast.error('⚠️ Please enter a valid PAN number');
          return false;
        }
        return true;
      case 3:
        if (!formData.address || !formData.address.trim()) {
          toast.error('⚠️ Address is required');
          return false;
        }
        if (!formData.city) {
          toast.error('⚠️ City is required');
          return false;
        }
        if (!formData.state) {
          toast.error('⚠️ State is required');
          return false;
        }
        if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode)) {
          toast.error('⚠️ Please enter a valid 6-digit PIN code');
          return false;
        }
        return true;
      case 4:
        const hasAnyDocument = documents.employeeData || documents.companyDocuments || documents.registrationProofs;
        if (!hasAnyDocument) {
          toast.error('⚠️ Please upload at least one document to proceed');
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !isAuthenticated) {
      sessionStorage.setItem('payroll_services_pending_step', '2');
      sessionStorage.setItem('payroll_services_form_data', JSON.stringify(formData));
      toast.warning('Please login to continue with your payroll services application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login?redirect=/services/payroll-services&step=2', {
        state: { from: '/services/payroll-services', returnStep: 2 }
      });
      return;
    }

    if (validateStep(currentStep)) {
      const newCompleted = [...completedSteps];
      if (!newCompleted.includes(currentStep)) {
        newCompleted.push(currentStep);
      }
      setCompletedSteps(newCompleted);
      setCurrentStep(currentStep + 1);
      
      const formSection = document.getElementById('application-form-section');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
    
    const formSection = document.getElementById('application-form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if not on step 4
    if (currentStep < 4) {
      console.log('Form submission prevented - not on step 4');
      return;
    }
    
    if (!isAuthenticated) {
      sessionStorage.setItem('payroll_services_pending_step', '4');
      sessionStorage.setItem('payroll_services_form_data', JSON.stringify(formData));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/payroll-services&step=4', {
        state: { from: '/services/payroll-services', returnStep: 4 }
      });
      return;
    }

    if (!validateStep(4)) return;

    setIsSubmittingApplication(true);
    try {
      // Call API to submit payroll services application
      const submissionData = { ...formData, ...documents };
      const response = await submitPayrollServices(submissionData);
      
      if (response.success) {
        const appNumber = 'PAY' + Date.now();
        if (isPopupMode) {
          setShowSuccessModal(true);
        } else {
          toast.success('Payroll services application submitted successfully!');
          setCurrentStep(5);
        }
        setFormData(prev => ({ ...prev, applicationNumber: appNumber }));
      } else {
        toast.error(response.error || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  // If in popup mode, only render the application form section
  if (isPopupMode) {
    return (
      <>
        <section id="application-form-section" className="py-4 sm:py-6 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 sm:px-8 py-4 sm:py-6 rounded-t-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">Payroll Services Application</h2>
                <p className="text-orange-50 text-center mt-1 text-sm">Complete the form for payroll management services</p>
              </div>

              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>
                      {step < 4 && <div className={`w-8 sm:w-12 md:w-16 h-1 ${currentStep > step ? 'bg-orange-600' : 'bg-gray-200'}`}></div>}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="space-y-5">
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Personal & Company Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                            maxLength="10"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Your company name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Company Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Employees <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="numberOfEmployees"
                            value={formData.numberOfEmployees}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          >
                            <option value="">Select range</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-100">51-100 employees</option>
                            <option value="101-500">101-500 employees</option>
                            <option value="500+">500+ employees</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Industry Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="industryType"
                            value={formData.industryType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            required
                          >
                            <option value="">Select industry</option>
                            <option value="IT & Software">IT & Software</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Retail">Retail</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Finance">Finance</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company PAN <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="companyPAN"
                            value={formData.companyPAN}
                            onChange={handleInputChange}
                            placeholder="ABCDE1234F"
                            maxLength="10"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all uppercase"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            GST Number (Optional)
                          </label>
                          <input
                            type="text"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                            placeholder="GST number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            PF Number (if registered)
                          </label>
                          <input
                            type="text"
                            name="pfNumber"
                            value={formData.pfNumber}
                            onChange={handleInputChange}
                            placeholder="PF registration number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ESI Number (if registered)
                          </label>
                          <input
                            type="text"
                            name="esiNumber"
                            value={formData.esiNumber}
                            onChange={handleInputChange}
                            placeholder="ESI registration number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Address Information</h3>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter complete address"
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="City"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              State <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="State"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              PIN Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              placeholder="6-digit PIN code"
                              maxLength="6"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-600 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Documents</h3>
                      <p className="text-sm text-gray-600 mb-4">Please upload the following documents (JPG, PNG, PDF - Max 5MB each)</p>

                      <div className="space-y-4">
                        {[{name: 'employeeData', label: 'Employee Data'}, {name: 'companyDocuments', label: 'Company Documents'}, {name: 'registrationProofs', label: 'Registration Proofs'}].map(doc => (
                          <div key={doc.name}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {doc.label}
                            </label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-all cursor-pointer group">
                              <input
                                type="file"
                                name={doc.name}
                                onChange={(e) => handleFileUpload(e, doc.name)}
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                id={doc.name}
                              />
                              <label htmlFor={doc.name} className="cursor-pointer flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-600 transition-colors" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                                  {documents[doc.name] ? documents[doc.name].name : 'Click to upload or drag and drop'}
                                </span>
                                <span className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between gap-3 pt-4">
                    {currentStep > 1 && (<button type="button" onClick={handlePreviousStep} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">← Previous</button>)}
                    {currentStep < 4 ? (<button type="button" onClick={handleNextStep} className="ml-auto px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 font-medium text-sm transition-all">Next →</button>) : (<button type="submit" disabled={isSubmittingApplication} className="ml-auto px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 font-medium text-sm transition-all disabled:opacity-50">{isSubmittingApplication ? 'Submitting...' : 'Submit'}</button>)}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-orange-600" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 text-sm mb-4">Your application has been submitted.</p>
              <button onClick={() => { setShowSuccessModal(false); if (onPopupClose) onPopupClose(); }} className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 font-medium text-sm">Close</button>
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
            backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3")',
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
                Payroll Processing Services
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-green-50 leading-relaxed">
                Streamline your payroll operations with our comprehensive services. We handle everything from salary calculations to statutory compliance, ensuring accurate and timely payroll processing.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">100% Accurate</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Statutory Compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Secure & Confidential</span>
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
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Get Started Today</h3>
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

      {/* What is Payroll Processing Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              What is Payroll Processing?
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Payroll processing involves calculating employee salaries, managing statutory deductions, and ensuring timely payments while maintaining full compliance with labor laws and tax regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FaCalculator className="text-white text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Core Components</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Gross salary calculation with all components</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Statutory deductions (PF, ESI, PT, TDS)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Net salary computation and disbursement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Payslip generation and distribution</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FaShieldAlt className="text-white text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Compliance Management</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Timely statutory filings and returns</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Form 16 and Form 12BA issuance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Audit trail maintenance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Regulatory updates implementation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose Our Payroll Services?
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'Accuracy & Compliance',
                description: '100% accurate calculations with full statutory compliance to avoid penalties and legal issues.'
              },
              {
                icon: <FaChartLine className="text-3xl sm:text-4xl" />,
                title: 'Time-Saving',
                description: 'Free up your HR team to focus on strategic initiatives instead of repetitive payroll processing.'
              },
              {
                icon: <FaShieldAlt className="text-3xl sm:text-4xl" />,
                title: 'Data Security',
                description: 'Bank-level encryption and secure data handling with strict confidentiality agreements.'
              },
              {
                icon: <Users className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'Expert Support',
                description: 'Dedicated payroll specialists available for queries and support throughout the month.'
              },
              {
                icon: <Target className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'Scalable Solution',
                description: 'Flexible payroll processing that grows with your organization, from 10 to 10,000+ employees.'
              },
              {
                icon: <Award className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'Cost-Effective',
                description: 'Reduce overhead costs of maintaining in-house payroll team and software infrastructure.'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-white">
                  {item.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.description}</p>
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
              Our Payroll Services Include
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive payroll solutions from salary calculation to employee self-service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'Monthly Payroll Processing',
                items: [
                  'Salary structure design and implementation',
                  'Attendance and leave management integration',
                  'Net salary calculation with deductions',
                  'Payslip generation and distribution',
                  'Bank transfer file preparation'
                ]
              },
              {
                title: 'Statutory Compliance',
                items: [
                  'EPF and ESI calculation and filing',
                  'Professional Tax (PT) management',
                  'TDS on salary computation and deposit',
                  'Labour Welfare Fund (LWF) compliance',
                  'Form 16 and Form 12BA generation'
                ]
              },
              {
                title: 'Reporting & Analytics',
                items: [
                  'Department and cost center-wise reports',
                  'Employee-wise salary registers',
                  'Variance analysis (actual vs. budget)',
                  'Statutory compliance reports',
                  'Year-end payroll reconciliation'
                ]
              },
              {
                title: 'Employee Self-Service',
                items: [
                  'Online payslip access',
                  'Tax declaration portal',
                  'Investment proof submission',
                  'Reimbursement claim management',
                  'Salary certificate download'
                ]
              },
              {
                title: 'Tax Management',
                items: [
                  'Income tax calculation as per regime',
                  'Tax optimization guidance',
                  'Quarterly TDS return filing',
                  'Annual tax statement (Form 16)',
                  'Tax projection for employees'
                ]
              },
              {
                title: 'Final Settlement',
                items: [
                  'Full and final settlement processing',
                  'Gratuity calculation',
                  'Leave encashment computation',
                  'Exit formalities documentation',
                  'Form 16 for resigned employees'
                ]
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all border-t-4 border-green-600"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{service.title}</h3>
                <ul className="space-y-2 sm:space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-gray-600 text-sm sm:text-base">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
                  <Building className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Company Documents</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'PF, ESI, and PT registration numbers',
                  'TAN and PAN of the company',
                  'Bank account details for salary transfer',
                  'Salary structure and components',
                  'Attendance and leave policy',
                  'Bonus and incentive policy',
                  'Reimbursement policy'
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
                  <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Employee Data</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Employee master data with personal details',
                  'Bank account and IFSC code',
                  'PAN card copies',
                  'Aadhaar card copies',
                  'Attendance and leave records',
                  'Income tax declarations (Form 12BB)',
                  'Investment proofs for tax deduction',
                  'Loan and advance details'
                ].map((doc, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm sm:text-base">
                    <IdCard className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center">Payroll Processing Timeline</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm sm:text-base">
              <div className="text-center">
                <p className="font-semibold mb-1">Data Collection</p>
                <p className="text-green-100">1st-5th of month</p>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1">Processing</p>
                <p className="text-green-100">6th-10th of month</p>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1">Approval</p>
                <p className="text-green-100">11th-15th of month</p>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-1">Compliance</p>
                <p className="text-green-100">Within due dates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form-section" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentStep < 5 && (
            <>
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                  <FileText className="w-5 h-5 text-green-700" />
                  <span className="text-green-700 font-semibold">Payroll Services Application</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Apply for Payroll Services
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Fill out this form to get professional payroll processing services
                </p>
              </div>

              {/* Progress Steps */}
              <div className="mb-12">
                <div className="flex justify-between items-center max-w-3xl mx-auto">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                          currentStep === step 
                            ? 'bg-green-600 text-white scale-110 shadow-lg' 
                            : completedSteps.includes(step)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {completedSteps.includes(step) ? <CheckCircle className="w-6 h-6" /> : step}
                        </div>
                        <span className={`text-xs sm:text-sm mt-2 font-medium ${
                          currentStep === step ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step === 1 && 'Personal'}
                          {step === 2 && 'Company'}
                          {step === 3 && 'Address'}
                          {step === 4 && 'Documents'}
                        </span>
                      </div>
                      {step < 4 && (
                        <div className={`h-1 flex-1 transition-all duration-300 ${
                          completedSteps.includes(step) ? 'bg-green-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <IdCard className="w-7 h-7 text-green-600" />
                        Personal & Company Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                            maxLength="10"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Your company name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Company Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Building className="w-7 h-7 text-green-600" />
                        Company Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Number of Employees <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="numberOfEmployees"
                            value={formData.numberOfEmployees}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            required
                          >
                            <option value="">Select range</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-100">51-100 employees</option>
                            <option value="101-500">101-500 employees</option>
                            <option value="500+">500+ employees</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Industry Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="industryType"
                            value={formData.industryType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            required
                          >
                            <option value="">Select industry</option>
                            <option value="IT & Software">IT & Software</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Retail">Retail</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Finance">Finance</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company PAN <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="companyPAN"
                            value={formData.companyPAN}
                            onChange={handleInputChange}
                            placeholder="ABCDE1234F"
                            maxLength="10"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all uppercase"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            GST Number (Optional)
                          </label>
                          <input
                            type="text"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                            placeholder="GST number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            PF Number (if registered)
                          </label>
                          <input
                            type="text"
                            name="pfNumber"
                            value={formData.pfNumber}
                            onChange={handleInputChange}
                            placeholder="PF registration number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ESI Number (if registered)
                          </label>
                          <input
                            type="text"
                            name="esiNumber"
                            value={formData.esiNumber}
                            onChange={handleInputChange}
                            placeholder="ESI registration number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Address */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Home className="w-7 h-7 text-green-600" />
                        Address Information
                      </h3>

                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Company Address <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter complete address"
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="City"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              State <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="State"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              PIN Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              placeholder="6-digit PIN"
                              maxLength="6"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Documents */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <Upload className="w-7 h-7 text-green-600" />
                        Upload Documents
                      </h3>

                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Employee Data File <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                <Upload className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-600">
                                  {documents.employeeData ? documents.employeeData.name : 'Choose file...'}
                                </span>
                              </div>
                              <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'employeeData')}
                                accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx"
                                className="hidden"
                              />
                            </label>
                            {documents.employeeData && (
                              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Company Documents
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                <Upload className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-600">
                                  {documents.companyDocuments ? documents.companyDocuments.name : 'Choose file...'}
                                </span>
                              </div>
                              <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'companyDocuments')}
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                              />
                            </label>
                            {documents.companyDocuments && (
                              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            PF/ESI Registration Proofs
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                <Upload className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-600">
                                  {documents.registrationProofs ? documents.registrationProofs.name : 'Choose file...'}
                                </span>
                              </div>
                              <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, 'registrationProofs')}
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                              />
                            </label>
                            {documents.registrationProofs && (
                              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Accepted formats: JPG, PNG, PDF, XLS, XLSX (Max 5MB each)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-100">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Previous
                      </button>
                    )}
                    
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold ml-auto shadow-lg"
                      >
                        Next Step
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmittingApplication}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold ml-auto shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingApplication ? 'Submitting...' : 'Submit Application'}
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

          {/* Success Screen */}
          {currentStep === 5 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h3>
              <p className="text-lg text-gray-600 mb-6">
                Your application number is: <span className="font-bold text-green-600">{formData.applicationNumber}</span>
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-2xl mx-auto mb-8">
                <h4 className="font-bold text-gray-900 mb-3">What's Next?</h4>
                <ul className="space-y-2 text-left">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Our payroll team will review your application within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">You'll receive a confirmation email with service agreement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">We'll schedule an onboarding call to set up your payroll process</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Streamline Your Payroll?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-green-50 mb-6 sm:mb-8 leading-relaxed">
            Let us handle your payroll while you focus on growing your business
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

export default PayrollServices;
