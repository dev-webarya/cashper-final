import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaBalanceScale, FaGavel, FaHandshake, FaFileContract, FaShieldAlt } from 'react-icons/fa';
import { CheckCircle, FileText, IdCard, Home, Building, Users, Award, Scale, X, Phone, Mail, ArrowLeft, ArrowRight, Upload, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { submitLegalAdvice } from '../../services/businessServicesApi';

const LegalAdvice = ({ isPopupMode = false, onPopupClose }) => {
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
    legalIssueType: '',
    caseDescription: '',
    urgency: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    companyPAN: ''
  });
  const [documents, setDocuments] = useState({
    companyDocuments: null,
    caseDocuments: null,
    legalNotices: null
  });
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);

    const savedFormData = sessionStorage.getItem('legal_advice_form_data');
    const savedStep = sessionStorage.getItem('legal_advice_pending_step');
    
    if (savedFormData && token) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        if (savedStep) {
          setCurrentStep(parseInt(savedStep));
        }
        sessionStorage.removeItem('legal_advice_form_data');
        sessionStorage.removeItem('legal_advice_pending_step');
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
      const response = await fetch('http://localhost:8000/api/corporate-inquiry/legal-advice', {
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
        if (!formData.legalIssueType) {
          toast.error('⚠️ Please select legal issue type');
          return false;
        }
        if (!formData.caseDescription || !formData.caseDescription.trim()) {
          toast.error('⚠️ Case description is required');
          return false;
        }
        if (!formData.urgency) {
          toast.error('⚠️ Please select urgency level');
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
        const hasAnyDocument = documents.companyDocuments || documents.caseDocuments || documents.legalNotices;
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
      sessionStorage.setItem('legal_advice_pending_step', '2');
      sessionStorage.setItem('legal_advice_form_data', JSON.stringify(formData));
      toast.warning('Please login to continue with your legal advice application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/login?redirect=/services/legal-advice&step=2', {
        state: { from: '/services/legal-advice', returnStep: 2 }
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
    
    if (!isAuthenticated) {
      sessionStorage.setItem('legal_advice_pending_step', '4');
      sessionStorage.setItem('legal_advice_form_data', JSON.stringify(formData));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/legal-advice&step=4', {
        state: { from: '/services/legal-advice', returnStep: 4 }
      });
      return;
    }

    if (!validateStep(4)) return;

    setIsSubmittingApplication(true);
    try {
      // Call API to submit legal advice application
      const submissionData = { ...formData, ...documents };
      const response = await submitLegalAdvice(submissionData);
      
      if (response.success) {
        const appNumber = 'LEG' + Date.now();
        if (isPopupMode) {
          setShowSuccessModal(true);
        } else {
          toast.success('Legal advice application submitted successfully!');
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
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 sm:px-8 py-4 sm:py-6 rounded-t-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">Legal Advice Application</h2>
                <p className="text-purple-50 text-center mt-1 text-sm">Complete the form for legal consultation services</p>
              </div>

              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{step}</div>
                      {step < 4 && <div className={`w-8 sm:w-12 md:w-16 h-1 ${currentStep > step ? 'bg-purple-600' : 'bg-gray-200'}`}></div>}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="space-y-5">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="Your full name" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="your@email.com" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="10-digit number" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label><input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="Company name" /></div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Legal Issue Details</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Type of Legal Issue *</label><select name="legalIssueType" value={formData.legalIssueType} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none"><option value="">Select Type</option><option value="Contract Review">Contract Review</option><option value="Dispute Resolution">Dispute Resolution</option><option value="Compliance">Compliance</option><option value="Others">Others</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Case Description *</label><textarea name="caseDescription" value={formData.caseDescription} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="Describe your legal issue" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level *</label><select name="urgency" value={formData.urgency} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none"><option value="">Select Level</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Address & Tax Information</h3>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Address *</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="Full address" /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="City" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">State *</label><input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="State" /></div></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label><input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="6-digit" maxLength="6" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Company PAN</label><input type="text" name="companyPAN" value={formData.companyPAN} onChange={handleInputChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-purple-500 outline-none" placeholder="PAN" maxLength="10" /></div></div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">Upload Documents</h3>
                      {[{name: 'companyDocuments', label: 'Company Documents'}, {name: 'caseDocuments', label: 'Case Documents'}, {name: 'legalNotices', label: 'Legal Notices'}].map(doc => (
                        <div key={doc.name}><label className="block text-sm font-medium text-gray-700 mb-1">{doc.label}</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-purple-500 transition-colors"><input type="file" name={doc.name} onChange={(e) => handleFileUpload(e, doc.name)} accept=".pdf,.jpg,.jpeg,.png" className="hidden" id={doc.name} /><label htmlFor={doc.name} className="cursor-pointer block text-xs text-gray-600">{documents[doc.name] ? documents[doc.name].name : 'Click to upload'}</label></div></div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between gap-3 pt-4">
                    {currentStep > 1 && (<button type="button" onClick={handlePreviousStep} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">← Previous</button>)}
                    {currentStep < 4 ? (<button type="button" onClick={handleNextStep} className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium text-sm transition-all">Next →</button>) : (<button type="submit" disabled={isSubmittingApplication} className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium text-sm transition-all disabled:opacity-50">{isSubmittingApplication ? 'Submitting...' : 'Submit'}</button>)}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-purple-600" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 text-sm mb-4">Your application has been submitted.</p>
              <button onClick={() => { setShowSuccessModal(false); if (onPopupClose) onPopupClose(); }} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium text-sm">Close</button>
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
            backgroundImage: 'url("https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3")',
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
                Legal Advice Services
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-green-50 leading-relaxed">
                Navigate complex legal matters with confidence. Our network of experienced corporate lawyers provides comprehensive legal support for businesses, helping you make informed decisions and maintain compliance.
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Expert Lawyers</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Business Law</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-300 text-xl flex-shrink-0" />
                  <span className="text-sm sm:text-base">Contract Drafting</span>
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
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Get Legal Consultation</h3>
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

      {/* What is Legal Advisory Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              What is Corporate Legal Advisory?
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Corporate legal advisory involves providing expert legal guidance on business operations, compliance, contracts, and governance, helping companies navigate complex legal landscapes and minimize risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FaBalanceScale className="text-white text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Business Law Expertise</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Company incorporation and structuring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Shareholder agreements and governance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Mergers, acquisitions, and restructuring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Regulatory compliance and reporting</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FaFileContract className="text-white text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Contract Management</h3>
              <ul className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Contract drafting and review</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Vendor and supplier agreements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Employment contracts and policies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2 flex-shrink-0">✓</span>
                  <span>Intellectual property protection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Important Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Legal Advisory is Critical
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <FaShieldAlt className="text-3xl sm:text-4xl" />,
                title: 'Risk Mitigation',
                description: 'Identify and minimize legal risks before they become costly problems. Proactive legal advice saves time, money, and reputation.'
              },
              {
                icon: <Scale className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'Compliance Assurance',
                description: 'Stay compliant with ever-changing laws and regulations. Avoid penalties, sanctions, and legal disputes through expert guidance.'
              },
              {
                icon: <FaHandshake className="text-3xl sm:text-4xl" />,
                title: 'Contract Protection',
                description: 'Well-drafted contracts protect your interests and prevent disputes. Expert review ensures favorable terms and conditions.'
              },
              {
                icon: <Building className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'Business Growth',
                description: 'Sound legal advice enables confident business decisions, partnerships, and expansions without legal roadblocks.'
              },
              {
                icon: <FaGavel className="text-3xl sm:text-4xl" />,
                title: 'Dispute Resolution',
                description: 'Expert legal representation in negotiations, arbitration, and litigation to protect your business interests.'
              },
              {
                icon: <Award className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'IP Protection',
                description: 'Safeguard your intellectual property, trademarks, copyrights, and trade secrets with proper legal frameworks.'
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

      {/* Our Legal Services Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our Legal Services Coverage
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-green-600 to-green-700 mx-auto mb-4 sm:mb-6"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive legal advisory services for businesses of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'Company Law Matters',
                items: [
                  'Incorporation and registration guidance',
                  'Director duties and liabilities',
                  'Shareholder agreements and disputes',
                  'Board resolutions and corporate governance',
                  'Merger, acquisition, and restructuring'
                ]
              },
              {
                title: 'Contract & Agreement Drafting',
                items: [
                  'Vendor and supplier agreements',
                  'Service level agreements (SLA)',
                  'Non-disclosure agreements (NDA)',
                  'Employment contracts',
                  'Partnership and joint venture agreements'
                ]
              },
              {
                title: 'Compliance & Regulatory',
                items: [
                  'SEBI and RBI compliance',
                  'FEMA and foreign investment regulations',
                  'Competition law and anti-trust matters',
                  'Data privacy and protection (DPDP Act)',
                  'Environmental and labor law compliance'
                ]
              },
              {
                title: 'Intellectual Property',
                items: [
                  'Trademark registration and protection',
                  'Copyright and patent filing',
                  'Licensing and franchising agreements',
                  'IP infringement and enforcement',
                  'Trade secret protection'
                ]
              },
              {
                title: 'Dispute Resolution',
                items: [
                  'Commercial arbitration and mediation',
                  'Civil and commercial litigation',
                  'Recovery and debt collection',
                  'Contractual dispute resolution',
                  'Shareholder and partnership disputes'
                ]
              },
              {
                title: 'Employment Law',
                items: [
                  'Employment contract drafting',
                  'Employee handbooks and policies',
                  'Termination and severance matters',
                  'Industrial disputes and labor law',
                  'Sexual harassment policies (POSH)'
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
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Documents for Legal Consultation
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
                  'Certificate of Incorporation',
                  'Memorandum and Articles of Association',
                  'Shareholder and board resolutions',
                  'Director and shareholder details',
                  'Existing contracts and agreements',
                  'Compliance certificates and filings',
                  'PAN and TAN of the company'
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
                  <Scale className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Case-Specific Documents</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Relevant contracts and agreements',
                  'Correspondence and communications',
                  'Invoices and financial records',
                  'Regulatory notices or orders',
                  'Previous legal opinions (if any)',
                  'Court orders or tribunal decisions',
                  'Evidence and supporting documents'
                ].map((doc, index) => (
                  <li key={index} className="flex items-start text-gray-700 text-sm sm:text-base">
                    <FileText className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Consultation Process</h3>
            <p className="text-base sm:text-lg mb-2 text-green-50">Initial consultation within 24-48 hours of request</p>
            <p className="text-sm sm:text-base text-green-100">Detailed legal opinion provided within 7-10 working days</p>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form-section" className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 sm:px-8 py-6 sm:py-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Legal Advice Application</h2>
                  <p className="text-green-50 text-sm sm:text-base mt-1">Complete the form below to submit your legal inquiry</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              {currentStep < 5 && (
                <>
                  {/* Progress Steps */}
                  <div className="mb-8 sm:mb-10">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                        <div 
                          className="h-full bg-green-600 transition-all duration-500"
                          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        ></div>
                      </div>
                      
                      {[
                        { num: 1, label: 'Personal' },
                        { num: 2, label: 'Legal Details' },
                        { num: 3, label: 'Address' },
                        { num: 4, label: 'Documents' }
                      ].map((step) => (
                        <div key={step.num} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                            currentStep >= step.num 
                              ? 'bg-green-600 text-white shadow-lg' 
                              : 'bg-gray-200 text-gray-500'
                          } ${completedSteps.includes(step.num) ? 'ring-4 ring-green-200' : ''}`}>
                            {completedSteps.includes(step.num) ? <CheckCircle className="w-5 h-5" /> : step.num}
                          </div>
                          <span className="text-xs mt-2 font-medium text-gray-600 hidden sm:block">{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-5 sm:space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                              placeholder="your.email@example.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              maxLength="10"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                              placeholder="10-digit mobile number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                            <input
                              type="text"
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                              placeholder="Your company name"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Legal Details */}
                    {currentStep === 2 && (
                      <div className="space-y-5 sm:space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Legal Issue Type *</label>
                            <select
                              name="legalIssueType"
                              value={formData.legalIssueType}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                            >
                              <option value="">Select issue type</option>
                              <option value="Corporate Law">Corporate Law</option>
                              <option value="Contract Disputes">Contract Disputes</option>
                              <option value="Labor Law">Labor Law</option>
                              <option value="Intellectual Property">Intellectual Property Rights</option>
                              <option value="Regulatory Compliance">Regulatory Compliance</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level *</label>
                            <select
                              name="urgency"
                              value={formData.urgency}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                            >
                              <option value="">Select urgency</option>
                              <option value="High">High - Immediate attention needed</option>
                              <option value="Medium">Medium - Within this week</option>
                              <option value="Low">Low - Can wait 1-2 weeks</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Case Description *</label>
                          <textarea
                            name="caseDescription"
                            value={formData.caseDescription}
                            onChange={handleInputChange}
                            rows="5"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors resize-none"
                            placeholder="Describe your legal issue in detail..."
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Address Information */}
                    {currentStep === 3 && (
                      <div className="space-y-5 sm:space-y-6 animate-fadeIn">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Address *</label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors resize-none"
                            placeholder="Building, street, landmark..."
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code *</label>
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              maxLength="6"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                              placeholder="6-digit PIN"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Company PAN (Optional)</label>
                          <input
                            type="text"
                            name="companyPAN"
                            value={formData.companyPAN}
                            onChange={handleInputChange}
                            maxLength="10"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                            placeholder="AAAA0000A"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 4: Document Upload */}
                    {currentStep === 4 && (
                      <div className="space-y-5 sm:space-y-6 animate-fadeIn">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-blue-800 font-medium">Upload at least one document to proceed</p>
                              <p className="text-xs text-blue-600 mt-1">Maximum file size: 5MB per document</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Company Documents</label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-300 transition-colors">
                                  <Upload className="w-5 h-5 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {documents.companyDocuments ? documents.companyDocuments.name : 'Choose File'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'companyDocuments')}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Case Documents</label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-300 transition-colors">
                                  <Upload className="w-5 h-5 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {documents.caseDocuments ? documents.caseDocuments.name : 'Choose File'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'caseDocuments')}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition-colors">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Legal Notices (if any)</label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg border border-gray-300 transition-colors">
                                  <Upload className="w-5 h-5 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {documents.legalNotices ? documents.legalNotices.name : 'Choose File'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'legalNotices')}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={handlePreviousStep}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                          Previous
                        </button>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isSubmittingApplication}
                        className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl ${
                          currentStep === 1 ? 'ml-auto' : ''
                        } ${isSubmittingApplication ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isSubmittingApplication ? (
                          <>Processing...</>
                        ) : currentStep === 4 ? (
                          <>
                            Submit Application
                            <CheckCircle className="w-5 h-5" />
                          </>
                        ) : (
                          <>
                            Next Step
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Success Screen */}
              {currentStep === 5 && (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Application Submitted Successfully!</h3>
                    <p className="text-gray-600 mb-6">Your legal consultation request has been received.</p>
                    
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
                      <p className="text-sm text-gray-600 mb-2">Your Application Number</p>
                      <p className="text-3xl font-bold text-green-600">LEG{Date.now()}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      What's Next?
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Our legal team will review your case within 24 hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>You'll receive a consultation schedule via email/phone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Initial consultation is free of charge</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    Back to Home
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Need Expert Legal Advice?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-green-50 mb-6 sm:mb-8 leading-relaxed">
            Connect with experienced corporate lawyers today. Protect your business with sound legal guidance.
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

export default LegalAdvice;
