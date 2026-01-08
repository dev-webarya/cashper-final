import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  FaChartLine,
  FaPiggyBank,
  FaUmbrella,
  FaGraduationCap,
  FaHome,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendar,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaCalculator,
  FaUsers,
  FaHandHoldingUsd
} from 'react-icons/fa';
import {
  Upload,
  X,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  Home,
  MapPin,
  IdCard,
  CreditCard,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { submitFinancialPlanningApplication } from '../../services/retailServicesApi';

const FinancialPlanning = ({ isPopupMode = false, onPopupClose = null }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
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
    age: '',
    currentIncome: '',
    investmentGoal: ''
  });

  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  // Application form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    occupation: '',
    annualIncome: '',
    existingInvestments: '',
    riskProfile: '',
    investmentGoal: '',
    timeHorizon: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    applicationNumber: ''
  });

  const [documents, setDocuments] = useState({
    panCard: null,
    aadharCard: null,
    salarySlips: null,
    bankStatements: null,
    investmentProofs: null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    const pendingStep = sessionStorage.getItem('financial_planning_pending_step');
    const savedFormData = sessionStorage.getItem('financial_planning_form_data');
    if (token && pendingStep && savedFormData) {
      try {
        const formData = JSON.parse(savedFormData);
        const step = parseInt(pendingStep);
        setApplicationForm(formData);
        setCurrentStep(step);
        setTimeout(() => { toast.success('Welcome back! Continuing your financial planning application...', { position: 'top-center', autoClose: 2000 }); }, 100);
        sessionStorage.removeItem('financial_planning_pending_step');
        sessionStorage.removeItem('financial_planning_form_data');
      } catch (error) {
        console.error('Error restoring form data:', error);
        toast.error('Failed to restore your form. Please start again.');
        sessionStorage.removeItem('financial_planning_pending_step');
        sessionStorage.removeItem('financial_planning_form_data');
      }
    }
  }, []);

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
      const response = await fetch('http://127.0.0.1:8000/api/applications/financial-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(heroFormData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Thank you! Your inquiry (${data.inquiryId}) has been submitted. Our financial advisor will contact you soon.`);
        setHeroFormData({ name: '', email: '', phone: '', age: '', currentIncome: '', investmentGoal: '' });
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
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
        if (!formData.age || formData.age < 18 || formData.age > 100) {
          toast.error('⚠️ Please enter a valid age (18-100 years)');
          return false;
        }
        if (!formData.occupation) {
          toast.error('⚠️ Occupation is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.annualIncome) {
          toast.error('⚠️ Annual income is required');
          return false;
        }
        if (!formData.riskProfile) {
          toast.error('⚠️ Risk profile is required');
          return false;
        }
        if (!formData.investmentGoal) {
          toast.error('⚠️ Investment goal is required');
          return false;
        }
        if (!formData.timeHorizon) {
          toast.error('⚠️ Time horizon is required');
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
        if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
          toast.error('⚠️ Please enter a valid PAN number');
          return false;
        }
        return true;
      case 4:
        const hasAnyDocument = documents.panCard || documents.aadharCard || documents.salarySlips;
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
      sessionStorage.setItem('financial_planning_pending_step', '2');
      sessionStorage.setItem('financial_planning_form_data', JSON.stringify(applicationForm));
      toast.warning('Please login to continue with your financial planning application', {
        position: 'top-center',
        autoClose: 3000
      });
      navigate(`/login?redirect=/services/financial-planning&step=2`, { 
        state: { from: '/services/financial-planning', returnStep: 2 } 
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
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      sessionStorage.setItem('financial_planning_pending_step', '4');
      sessionStorage.setItem('financial_planning_form_data', JSON.stringify(formData));
      toast.error('Please login to submit your application');
      navigate('/login?redirect=/services/financial-planning&step=4', { 
        state: { from: '/services/financial-planning', returnStep: 4 } 
      });
      return;
    }
    if (!validateStep(4)) return;

    setIsSubmittingApplication(true);
    try {
      const applicationData = {
        ...formData,
        ...documents
      };
      await submitFinancialPlanningApplication(applicationData);
      const appNumber = 'FP' + Date.now();
      toast.success('Financial Planning Application submitted successfully!');
      setFormData(prev => ({ ...prev, applicationNumber: appNumber }));
      setCurrentStep(5);
      setTimeout(() => navigate('/dashboard/retail-services'), 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const scrollToApplyForm = () => {
    const element = document.getElementById('apply-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const faqs = [
    {
      question: "What is financial planning and why do I need it?",
      answer: "Financial planning is a comprehensive approach to managing your finances to achieve your life goals. It covers investment planning, retirement planning, tax planning, insurance, and estate planning. It helps you make informed decisions about your money and secure your financial future."
    },
    {
      question: "How much does financial planning cost?",
      answer: "Our financial planning fees vary based on the complexity of your financial situation and the services you need. We offer transparent pricing with no hidden charges. Contact us for a personalized quote."
    },
    {
      question: "What's the difference between a financial advisor and financial planner?",
      answer: "A financial planner provides comprehensive financial planning covering all aspects of your finances, while a financial advisor may focus on specific areas like investments. Our certified financial planners (CFP) offer holistic planning services."
    },
    {
      question: "How often should I review my financial plan?",
      answer: "We recommend reviewing your financial plan at least annually or whenever there's a significant life event (marriage, childbirth, job change, inheritance). Regular reviews ensure your plan stays aligned with your goals."
    },
    {
      question: "Can you help with tax-saving investments?",
      answer: "Yes! Tax planning is a key part of our financial planning services. We help you maximize deductions under Section 80C, 80D, and other sections, and choose between old and new tax regimes based on your situation."
    }
  ];

  return (
    <>
      {!isPopupMode && <Navbar />}
      <div className="w-full overflow-x-hidden bg-white">
        
        {/* Hero Section */}
        {!isPopupMode && <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-6 sm:pb-8 md:pb-10 lg:pb-12 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1600&q=80')",
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
                  Comprehensive Financial Planning & Advisory
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                  Achieve your financial goals with expert guidance from certified financial planners. We offer personalized investment planning, retirement strategies, tax optimization, and wealth management solutions tailored to your unique needs.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      const element = document.getElementById('apply-form');
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
        }

        {/* What is Financial Planning Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  What is Financial Planning?
                </h2>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  Financial planning is a systematic approach to managing your finances to achieve short-term and long-term financial goals. It involves analyzing your current financial situation, setting realistic objectives, and creating a roadmap to reach those goals through strategic investment, tax planning, risk management, and wealth preservation.
                </p>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Our certified financial planners (CFP) work with you to create personalized strategies covering retirement planning, investment management, insurance planning, tax optimization, and estate planning—ensuring your financial security at every life stage.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80" 
                  alt="Financial Planning" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        }
        {/* Planning Benefits Section */}
        {!isPopupMode && <section className="py-8 md:py-10 lg:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 md:mb-6 text-gray-900">
              What You Get with Our Financial Planning Service
            </h2>
            <p className="text-base md:text-lg text-gray-600 text-center max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed">
              Our comprehensive financial planning covers all aspects of your financial life, ensuring nothing is left to chance:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center border-2 border-gray-200 hover:border-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 text-gray-900">Financial Health Checkup</h3>
                <p className="text-xs sm:text-sm text-gray-600">Complete analysis of your current financial status</p>
              </div>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center border-2 border-gray-200 hover:border-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <Target className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 text-gray-900">Goal Setting & Prioritization</h3>
                <p className="text-xs sm:text-sm text-gray-600">Define and rank your short-term and long-term objectives</p>
              </div>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center border-2 border-gray-200 hover:border-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 text-gray-900">Investment Strategy</h3>
                <p className="text-xs sm:text-sm text-gray-600">Customized asset allocation based on your risk profile</p>
              </div>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center border-2 border-gray-200 hover:border-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <FaUsers className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 text-gray-900">Regular Review Meetings</h3>
                <p className="text-xs sm:text-sm text-gray-600">Quarterly portfolio reviews and strategy adjustments</p>
              </div>
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center border-2 border-gray-200 hover:border-green-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  <FileText className="text-2xl sm:text-3xl md:text-4xl text-white" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 text-gray-900">Comprehensive Reports</h3>
                <p className="text-xs sm:text-sm text-gray-600">Detailed financial plan document and progress tracking</p>
              </div>
            </div>
          </div>
        </section>
        }

        {/* Documents Required Section */}
        {!isPopupMode && <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <FileText className="w-5 h-5 text-green-700" />
                <span className="text-green-700 font-semibold">Documents Required</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Documents Needed for Financial Planning
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Keep these documents ready for a comprehensive financial assessment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Document 1 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <IdCard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Identity Proof</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Valid government-issued ID for KYC
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        PAN Card (Mandatory)
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Aadhar Card
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Passport / Driving License
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document 2 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Income Documents</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Proof of earnings and financial status
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Last 3 months salary slips
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Last 2 years ITR
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Form 16 / Income proof
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document 3 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Bank Statements</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Account statements for cash flow analysis
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Last 6 months statements
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        All savings accounts
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Credit card statements
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document 4 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Investment Documents</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Existing portfolio and holdings
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Mutual fund statements
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Demat account holdings
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        PPF, FD, bonds statements
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document 5 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <FaUmbrella className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Insurance Policies</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Current life and health insurance coverage
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Life insurance policies
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Health insurance documents
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Critical illness cover
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Document 6 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white p-3 rounded-xl">
                    <Home className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Property & Loan Details</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Assets and liabilities information
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Property documents
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Home/car loan statements
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                        Other liability details
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Now CTA */}
            <div className="mt-12 text-center bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Apply for Financial Planning Service
              </h3>
              <p className="text-green-50 text-lg mb-6 max-w-2xl mx-auto">
                We already have a comprehensive application form ready for you. Fill it out to get started with your personalized financial planning journey.
              </p>
              <button
                onClick={() => {
                  const formElement = document.getElementById('apply-form');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="inline-flex items-center gap-2 bg-white text-green-700 px-8 py-4 rounded-xl hover:bg-green-50 transition-all text-lg font-bold shadow-lg transform hover:scale-105"
              >
                <FaUser className="w-5 h-5" />
                Fill Application Form Now
              </button>
            </div>
          </div>
        </section>
        }

        {/* Application Form Section */}
        <section id="apply-form" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {currentStep < 5 && (
              <>
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                    <FileText className="w-5 h-5 text-green-700" />
                    <span className="text-green-700 font-semibold">Financial Planning Application</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Apply for Financial Planning Service
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Fill out this comprehensive form to get personalized financial planning services
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
                            {step === 2 && 'Financial'}
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
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <User className="w-7 h-7 text-green-600" />
                          Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your.email@example.com"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="10-digit mobile number"
                                maxLength="10"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Age <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                placeholder="Your age"
                                min="18"
                                max="100"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                required
                              />
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Occupation <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="occupation"
                              value={formData.occupation}
                              onChange={handleInputChange}
                              placeholder="Your current occupation"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Financial Information */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <TrendingUp className="w-7 h-7 text-green-600" />
                          Financial Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Annual Income <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="annualIncome"
                              value={formData.annualIncome}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            >
                              <option value="">Select income range</option>
                              <option value="Below 5 Lakhs">Below ₹5 Lakhs</option>
                              <option value="5-10 Lakhs">₹5-10 Lakhs</option>
                              <option value="10-20 Lakhs">₹10-20 Lakhs</option>
                              <option value="20-50 Lakhs">₹20-50 Lakhs</option>
                              <option value="50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                              <option value="Above 1 Crore">Above ₹1 Crore</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Existing Investments
                            </label>
                            <input
                              type="text"
                              name="existingInvestments"
                              value={formData.existingInvestments}
                              onChange={handleInputChange}
                              placeholder="e.g., Mutual Funds, FD, PPF"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Risk Profile <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="riskProfile"
                              value={formData.riskProfile}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            >
                              <option value="">Select risk profile</option>
                              <option value="Conservative">Conservative (Low Risk)</option>
                              <option value="Moderate">Moderate (Balanced)</option>
                              <option value="Aggressive">Aggressive (High Risk)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Investment Goal <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="investmentGoal"
                              value={formData.investmentGoal}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            >
                              <option value="">Select your goal</option>
                              <option value="Retirement Planning">Retirement Planning</option>
                              <option value="Wealth Creation">Wealth Creation</option>
                              <option value="Child Education">Child Education</option>
                              <option value="Home Purchase">Home Purchase</option>
                              <option value="Tax Saving">Tax Saving</option>
                              <option value="Emergency Fund">Emergency Fund</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Time Horizon <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="timeHorizon"
                              value={formData.timeHorizon}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                              required
                            >
                              <option value="">Select time horizon</option>
                              <option value="Less than 1 year">Less than 1 year</option>
                              <option value="1-3 years">1-3 years</option>
                              <option value="3-5 years">3-5 years</option>
                              <option value="5-10 years">5-10 years</option>
                              <option value="More than 10 years">More than 10 years</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Address & KYC */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <MapPin className="w-7 h-7 text-green-600" />
                          Address & KYC Information
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Home className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                              <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your complete address"
                                rows="3"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="Your city"
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
                                placeholder="Your state"
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
                                placeholder="6-digit PIN code"
                                maxLength="6"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                PAN Number <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                  type="text"
                                  name="panNumber"
                                  value={formData.panNumber}
                                  onChange={handleInputChange}
                                  placeholder="e.g., ABCDE1234F"
                                  maxLength="10"
                                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none transition-all uppercase"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Document Upload */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <Upload className="w-7 h-7 text-green-600" />
                          Upload Documents
                        </h3>

                        <div className="space-y-4">
                          {/* PAN Card */}
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              PAN Card <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                  <Upload className="w-5 h-5 text-gray-500" />
                                  <span className="text-gray-600">
                                    {documents.panCard ? documents.panCard.name : 'Choose file...'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'panCard')}
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  className="hidden"
                                />
                              </label>
                              {documents.panCard && (
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Aadhar Card */}
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Aadhar Card
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                  <Upload className="w-5 h-5 text-gray-500" />
                                  <span className="text-gray-600">
                                    {documents.aadharCard ? documents.aadharCard.name : 'Choose file...'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'aadharCard')}
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  className="hidden"
                                />
                              </label>
                              {documents.aadharCard && (
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Salary Slips */}
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Salary Slips / Income Proof
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                  <Upload className="w-5 h-5 text-gray-500" />
                                  <span className="text-gray-600">
                                    {documents.salarySlips ? documents.salarySlips.name : 'Choose file...'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'salarySlips')}
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  className="hidden"
                                />
                              </label>
                              {documents.salarySlips && (
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Bank Statements */}
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Bank Statements
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                  <Upload className="w-5 h-5 text-gray-500" />
                                  <span className="text-gray-600">
                                    {documents.bankStatements ? documents.bankStatements.name : 'Choose file...'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'bankStatements')}
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  className="hidden"
                                />
                              </label>
                              {documents.bankStatements && (
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Investment Proofs */}
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-green-600 transition-all">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Investment Proofs (Optional)
                            </label>
                            <div className="flex items-center gap-4">
                              <label className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                                  <Upload className="w-5 h-5 text-gray-500" />
                                  <span className="text-gray-600">
                                    {documents.investmentProofs ? documents.investmentProofs.name : 'Choose file...'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, 'investmentProofs')}
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  className="hidden"
                                />
                              </label>
                              {documents.investmentProofs && (
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Please upload clear, readable copies of your documents. Accepted formats: JPG, PNG, PDF (Max 5MB each)
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
                      <span className="text-gray-700">Our financial planner will review your application within 24-48 hours</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">You'll receive a confirmation email with further details</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Our team will schedule a consultation call with you</span>
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

        {/* Call to Action Section */}
        {!isPopupMode && <section className="py-8 sm:py-10 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Plan Your Financial Future?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
              Don't wait until the last minute. Get expert assistance and start your comprehensive financial planning today!
            </p>
            <button 
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              Contact Us Now →
            </button>
          </div>
        </section>
        }

        {/* FAQ Section */}
        {!isPopupMode && <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Common questions about our financial planning services
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-all"
                  >
                    <span className="text-left font-semibold text-gray-900">{faq.question}</span>
                    {activeAccordion === index ? (
                      <FaChevronUp className="text-green-600 flex-shrink-0 ml-4" />
                    ) : (
                      <FaChevronDown className="text-gray-400 flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {activeAccordion === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        }
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

      {!isPopupMode && <Footer />}
    </>
  );
};

export default FinancialPlanning;
