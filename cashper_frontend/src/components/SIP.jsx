import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaCalculator, 
  FaChartLine, 
  FaShieldAlt,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaRupeeSign,
  FaRegClock,
  FaHandHoldingUsd,
  FaPiggyBank,
  FaLightbulb,
  FaUserShield,
  FaClock,
  FaChartBar,
  FaArrowRight,
  FaCoins,
  FaPercentage,
  FaTrophy,
  FaUpload,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaHome,
  FaCamera,
  FaFileAlt,
  FaWallet
} from 'react-icons/fa';
import { 
  submitContactInquiry, 
  calculateSIPReturns, 
  submitSIPApplication 
} from '../services/sipApi';
import Navbar from './Navbar';
import Footer from './Footer';

const SIP = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investmentAmount: '',
    duration: ''
  });

  const [activeAccordion, setActiveAccordion] = useState(null);

  const [sipCalculator, setSipCalculator] = useState({
    monthlyInvestment: 5000,
    expectedReturn: 12,
    timePeriod: 10
  });
  const [calculatorResults, setCalculatorResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Application Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    panNumber: '',
    sipAmount: '',
    sipFrequency: '',
    investmentGoal: '',
    riskProfile: '',
    tenure: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    documents: {
      pan: null,
      aadhaar: null,
      photo: null,
      bankProof: null
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await submitContactInquiry(formData);
      toast.success(response.message || 'Thank you! Our investment advisor will contact you soon.');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        investmentAmount: '',
        duration: ''
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.detail || 'Failed to submit inquiry. Please try again.');
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

  // Handle navigation to contact page with scroll to hero section
  const handleContactNavigation = () => {
    navigate('/contact');
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const scrollToCalculator = () => {
    const element = document.getElementById('sip-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCalculatorChange = (field, value) => {
    setSipCalculator({
      ...sipCalculator,
      [field]: parseFloat(value) || 0
    });
  };

  // Application Form Handlers
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!value || !phoneRegex.test(value)) {
          error = 'Please enter a valid 10-digit mobile number';
        }
        break;
      case 'age':
        const ageNum = parseInt(value);
        if (!value || ageNum < 18 || ageNum > 100) {
          error = 'Age must be between 18 and 100';
        }
        break;
      case 'panNumber':
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!value || !panRegex.test(value.toUpperCase())) {
          error = 'PAN must be in format: ABCDE1234F';
        }
        break;
      case 'sipAmount':
        const amount = parseFloat(value);
        if (!value || amount < 500) {
          error = 'Minimum SIP amount is ₹500';
        }
        break;
      case 'tenure':
        const tenureNum = parseInt(value);
        if (!value || tenureNum < 1 || tenureNum > 30) {
          error = 'Tenure must be between 1 and 30 years';
        }
        break;
      case 'pincode':
        const pincodeRegex = /^\d{6}$/;
        if (!value || !pincodeRegex.test(value)) {
          error = 'Pincode must be 6 digits';
        }
        break;
      case 'address':
        if (!value || value.trim().length < 10) {
          error = 'Address must be at least 10 characters';
        }
        break;
      case 'city':
      case 'state':
        if (!value || value.trim().length < 2) {
          error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        }
        break;
      case 'sipFrequency':
      case 'investmentGoal':
      case 'riskProfile':
        if (!value) {
          error = 'Please select an option';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    
    // Update form value
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate and update errors
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFileUpload = (field, file) => {
    if (!file) return;
    
    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setFormErrors(prev => ({
        ...prev,
        [field]: 'File size must be less than 5MB'
      }));
      toast.error('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFormErrors(prev => ({
        ...prev,
        [field]: 'Only JPG, PNG, and PDF files are allowed'
      }));
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    
    // Clear error and set file
    setFormErrors(prev => ({
      ...prev,
      [field]: ''
    }));
    
    setApplicationForm(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
    
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} document selected successfully`);
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch(step) {
      case 1: // Personal Information
        ['name', 'email', 'phone', 'age', 'panNumber'].forEach(field => {
          const error = validateField(field, applicationForm[field]);
          if (error) errors[field] = error;
        });
        break;
      case 2: // SIP Details
        ['sipAmount', 'sipFrequency', 'tenure', 'investmentGoal', 'riskProfile'].forEach(field => {
          const error = validateField(field, applicationForm[field]);
          if (error) errors[field] = error;
        });
        break;
      case 3: // Address & KYC
        ['address', 'city', 'state', 'pincode'].forEach(field => {
          const error = validateField(field, applicationForm[field]);
          if (error) errors[field] = error;
        });
        break;
      case 4: // Documents
        if (!applicationForm.documents.pan) errors.pan = 'PAN Card is required';
        if (!applicationForm.documents.aadhaar) errors.aadhaar = 'Aadhaar Card is required';
        if (!applicationForm.documents.photo) errors.photo = 'Photograph is required';
        if (!applicationForm.documents.bankProof) errors.bankProof = 'Bank Proof is required';
        break;
      default:
        break;
    }
    
    return errors;
  };

  const nextStep = () => {
    // Validate current step before moving forward
    const errors = validateStep(currentStep);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setFormErrors({}); // Clear errors when moving to next step
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFormErrors({}); // Clear errors when going back
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check
    const errors = validateStep(4);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    try {
      // Show loading toast for document uploads
      const uploadingToast = toast.loading('Uploading documents and submitting application...');
      
      const response = await submitSIPApplication(applicationForm);
      
      // Dismiss loading toast
      toast.dismiss(uploadingToast);
      
      toast.success(response.message || 'Your SIP application has been submitted successfully!');
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(1);
        setFormErrors({});
        setApplicationForm({
          name: '', email: '', phone: '', age: '', panNumber: '',
          sipAmount: '', sipFrequency: '', investmentGoal: '', riskProfile: '', tenure: '',
          address: '', city: '', state: '', pincode: '',
          documents: { pan: null, aadhaar: null, photo: null, bankProof: null }
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.detail) {
        errorMessage = error.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if error is authentication related
      if (errorMessage.includes('login') || errorMessage.includes('authenticate') || errorMessage.includes('token')) {
        errorMessage = 'Please login to submit your SIP application';
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
      toast.error(errorMessage);
    }
  };

  // SIP Calculation with API
  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await calculateSIPReturns(sipCalculator);
      setCalculatorResults(response);
      toast.success('Returns calculated successfully!');
    } catch (error) {
      console.error('Error calculating returns:', error);
      toast.error(error.detail || 'Failed to calculate returns. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };
  
  // SIP Calculation - Local for display
  const calculateSIP = () => {
    // Use API results if available, otherwise use local calculation
    if (calculatorResults) {
      return {
        futureValue: Math.round(calculatorResults.futureValue),
        invested: Math.round(calculatorResults.totalInvestment),
        returns: Math.round(calculatorResults.estimatedReturns)
      };
    }
    
    // Local calculation for initial display
    const P = sipCalculator.monthlyInvestment;
    const r = sipCalculator.expectedReturn / 12 / 100;
    const n = sipCalculator.timePeriod * 12;
    
    const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const invested = P * n;
    const returns = futureValue - invested;
    
    return {
      futureValue: Math.round(futureValue),
      invested: Math.round(invested),
      returns: Math.round(returns)
    };
  };

  const sipResults = calculateSIP();

  const benefits = [
    {
      icon: <FaRupeeSign />,
      title: "Start Small",
      description: "Begin your investment journey with as little as ₹500 per month"
    },
    {
      icon: <FaRegClock />,
      title: "Disciplined Investing",
      description: "Automate your investments and build wealth systematically"
    },
    {
      icon: <FaChartLine />,
      title: "Power of Compounding",
      description: "Earn returns on your returns and grow wealth exponentially"
    },
    {
      icon: <FaShieldAlt />,
      title: "Rupee Cost Averaging",
      description: "Reduce market timing risk by investing regularly"
    }
  ];

  const whyChooseSIP = [
    {
      title: "Low Initial Investment",
      description: "Start your wealth creation journey with minimal investment, making it accessible for everyone",
      icon: <FaRupeeSign />
    },
    {
      title: "Convenient Mode",
      description: "Automated monthly deductions make investing hassle-free and consistent",
      icon: <FaClock />
    },
    {
      title: "Power of Compounding",
      description: "Your returns generate their own returns, accelerating wealth growth over time",
      icon: <FaChartLine />
    },
    {
      title: "Rupee Cost Averaging",
      description: "Invest systematically to average out market highs and lows effectively",
      icon: <FaPercentage />
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Choose Your Fund",
      description: "Select a mutual fund based on your risk profile and investment goals"
    },
    {
      step: "2",
      title: "Set Investment Amount",
      description: "Decide how much you want to invest monthly - starting from ₹500"
    },
    {
      step: "3",
      title: "Select Date & Duration",
      description: "Pick a monthly date and investment tenure that suits you"
    },
    {
      step: "4",
      title: "Auto-Invest Monthly",
      description: "Amount gets automatically debited and invested each month"
    }
  ];

  const sipTypes = [
    {
      title: "Top-up SIP",
      description: "With Top-up SIP, investors have the option to increase their investment amount periodically. This flexibility is beneficial for investors who experience increases in income or have surplus funds available for investment."
    },
    {
      title: "Flexible SIP",
      description: "Flexible SIP offers investors the freedom to adjust the investment amount according to their cash flow needs. Investors can increase or decrease the investment amount as per their financial situation or changing investment goals."
    },
    {
      title: "Perpetual SIP",
      description: "Unlike traditional SIPs, which typically have a fixed investment period, perpetual SIPs do not have a mandate end date. Investors can choose to continue their investments indefinitely, aligning with their long-term financial goals."
    }
  ];

  const considerations = [
    {
      title: "Financial Goals",
      description: "Define your investment objectives, whether it's wealth creation, retirement planning, or saving for specific goals",
      icon: <FaTrophy />
    },
    {
      title: "Risk Tolerance",
      description: "Assess your risk appetite to determine the type of mutual funds (equity, debt, hybrid) suitable for you",
      icon: <FaShieldAlt />
    },
    {
      title: "Time Horizon",
      description: "Determine your investment horizon, whether short-term, medium-term, or long-term, to align with your financial goals",
      icon: <FaClock />
    },
    {
      title: "Fund Selection",
      description: "Research and select mutual funds that match your investment goals, track record, fund manager expertise, and expense ratios",
      icon: <FaChartBar />
    }
  ];

  const requiredDocuments = [
    {
      title: "PAN Card",
      description: "Mandatory for all SIP investments as per KYC norms",
      icon: <FaIdCard />,
      items: ["Original PAN card or verified copy", "Must be valid and active"]
    },
    {
      title: "Identity Proof",
      description: "Government-issued ID for verification purposes",
      icon: <FaUser />,
      items: ["Aadhaar Card", "Passport", "Voter ID", "Driving License"]
    },
    {
      title: "Address Proof",
      description: "Document confirming current residential address",
      icon: <FaHome />,
      items: ["Aadhaar Card", "Recent utility bills", "Bank statement", "Rent agreement"]
    },
    {
      title: "Bank Account Proof",
      description: "Bank details for SIP auto-debit setup",
      icon: <FaWallet />,
      items: ["Cancelled cheque", "Bank statement", "Passbook copy with IFSC"]
    },
    {
      title: "Passport Size Photos",
      description: "Recent photographs for folio creation",
      icon: <FaCamera />,
      items: ["2 recent passport size photos", "Clear and against white background"]
    },
    {
      title: "Signature Proof",
      description: "For verification and transaction processing",
      icon: <FaFileAlt />,
      items: ["Sign on application form", "As per bank records"]
    }
  ];

  const faqs = [
    {
      question: "What is a SIP? How is it different from a Lump Sum investment?",
      answer: "SIP or Systematic Investment Planning is considered as an ideal way for investing in mutual funds. With SIP, an investor can invest the amount they want to invest monthly with an auto-debit facility. For a person investing in equity funds and looking for a long-term investment, SIP is highly recommended. Not only this, SIP investment works well in a falling market. This is because the investor can accumulate a large number of mutual fund units when the price is low. Lump Sum investment suits investors who want to invest for the short-term in debt mutual funds."
    },
    {
      question: "What are the benefits I can get from investing via SIP?",
      answer: "SIP offers multiple benefits including disciplined investing, rupee cost averaging, power of compounding, affordability with low entry barriers, flexibility to start/stop/modify investments, long-term wealth creation potential, access to professionally managed mutual funds, and convenience through automated investments. SIPs help you build wealth systematically while managing risk effectively."
    },
    {
      question: "What if I want to stop my SIP, is it possible?",
      answer: "Yes, you can stop your SIP anytime without any penalty (except for ELSS funds which have a 3-year lock-in period). SIPs are completely flexible. You can pause, modify your SIP amount, or stop it entirely based on your financial situation. You can also restart your SIP whenever you want. This flexibility makes SIP a convenient investment option."
    },
    {
      question: "Is SIP & Mutual funds the same thing?",
      answer: "No, SIP and Mutual Funds are not the same. Mutual Funds are investment vehicles that pool money from multiple investors to invest in diversified portfolios of stocks, bonds, or other securities. SIP is a method or mode of investing in mutual funds where you invest a fixed amount regularly (monthly/quarterly) instead of investing a lump sum at once. Think of Mutual Fund as the destination and SIP as the journey to reach that destination."
    },
    {
      question: "What exactly is NAV in SIP?",
      answer: "NAV stands for Net Asset Value. It is the per-unit market value of all the securities held by a mutual fund scheme. NAV is calculated by dividing the total value of all assets in the portfolio, minus liabilities, by the number of units outstanding. When you invest through SIP, you buy mutual fund units at the prevailing NAV on the investment date. Since NAV fluctuates with market conditions, you buy more units when NAV is low and fewer units when NAV is high, benefiting from rupee cost averaging."
    },
    {
      question: "Can I withdraw SIP anytime?",
      answer: "Yes, you can withdraw your SIP investments anytime, except for ELSS (Equity Linked Savings Scheme) funds which have a mandatory 3-year lock-in period. For other mutual funds, you can redeem your units partially or fully at any time. However, for optimal returns, it's recommended to stay invested for the long term to benefit from compounding and to ride out market volatility. Some funds may charge an exit load if you withdraw within a specified period (usually 1 year)."
    }
  ];

  return (
    <>
      {!isPopupMode && <Navbar />}
      <div className="w-full overflow-x-hidden bg-white">
        
        {!isPopupMode && (
        <>
        {/* Hero Section with Background Image */}
        <section 
          className="relative pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-4 sm:pb-6 md:pb-8 min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:h-[600px] bg-cover bg-center bg-no-repeat flex items-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundAttachment: "scroll",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/85 to-green-700/80"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 items-center">
              <div className="space-y-2 sm:space-y-3 md:space-y-4 text-center md:text-left">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-white">
                  Invest in SIP with Cashper: Secure Your Future with a SIP Planner
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                  Start small, grow steadily, and achieve your long-term goals with ease. Let our SIP investment planner, advisor, and SIP consultant simplify your journey toward financial independence.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center md:justify-start pt-2">
                  <button 
                    onClick={scrollToApplyForm}
                    className="bg-white text-green-700 px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm md:text-base">
                    Start SIP Now
                  </button>
                  <button 
                    onClick={scrollToCalculator}
                    className="border-2 border-white text-white px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-xs sm:text-sm md:text-base">
                    Calculate Returns
                  </button>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="bg-white rounded-xl shadow-2xl p-3 sm:p-4 md:p-5 mt-6 md:mt-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                  GET IN TOUCH
                </h3>
                <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <input
                    type="number"
                    name="investmentAmount"
                    placeholder="Monthly Investment Amount (₹)"
                    value={formData.investmentAmount}
                    onChange={handleInputChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  >
                    <option value="">Select Investment Duration</option>
                    <option value="1">1 Year</option>
                    <option value="3">3 Years</option>
                    <option value="5">5 Years</option>
                    <option value="10">10 Years</option>
                    <option value="15">15+ Years</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg text-xs sm:text-sm"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* What is SIP Section */}
        <section className="py-6 md:py-8 lg:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  What is SIP Investment? A Smart Way to Grow Your Wealth
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  A Systematic Investment Plan is a simple and disciplined way to invest in mutual fund schemes. It allows investors to invest a fixed amount regularly and provides them with the opportunity to slowly build wealth over time with the power of compounding and rupee cost averaging.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  Investors can customise the instalment amount and frequency of their SIPs to suit their financial goals and convenience. As an alternative to lump sum investments, they offer investors an affordable and powerful way to enter the market.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                  SIPs are ideally suited for long-term wealth creation as they encourage regular and disciplined investing, allowing investors to benefit from the potential growth of the underlying investments in the mutual fund scheme over time.
                </p>
              </div>
              <div className="order-1 lg:order-2 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80" 
                  alt="SIP Investment Growth" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-6 md:py-8 lg:py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Benefits of Investing in SIP
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                SIP offers multiple benefits that make it the preferred investment choice for millions of Indians
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-green-700">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 bg-green-700 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl">
                    {benefit.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How SIP Works */}
        <section className="py-6 md:py-8 lg:py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                How Does Systematic Investment Plans Work?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Through SIPs, mutual fund houses enable investors to make regular, fixed investments over a period instead of a one-time lump sum investment
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 border-green-200 hover:border-green-700 hover:shadow-xl transition-all duration-300 h-full">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 bg-green-700 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-lg">
                      {step.step}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <FaArrowRight className="text-green-700 text-2xl" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose SIP */}
        <section className="py-6 md:py-8 lg:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Why Choose SIP for Investment?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Systematic Investment Planning or SIP is a disciplined approach to investment that doesn't time the market
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {whyChooseSIP.map((item, index) => (
                <div key={index} className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-gray-50 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-200 hover:border-green-700">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 bg-green-700 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Types of SIP */}
        <section className="py-6 md:py-8 lg:py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Types of SIP Investment: Customize Your Strategy to Your Needs
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Here are the different types of SIP investment plans available
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {sipTypes.map((type, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-green-700 hover:-translate-y-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{type.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{type.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 md:mt-8 text-center">
              <button className="bg-green-700 hover:bg-green-800 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base md:text-lg">
                Get Your Financial Plan
              </button>
            </div>
          </div>
        </section>

        {/* Things to Consider */}
        <section className="py-6 md:py-8 lg:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Things to Consider Before Investing in SIP
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Make informed investment decisions by considering these important factors
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {considerations.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-200">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 mx-auto mb-3 sm:mb-4 bg-green-700 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl">
                    {item.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced SIP Calculator Section */}
        <section id="calculator" className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-green-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <FaCalculator className="text-3xl md:text-4xl text-green-700" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                SIP Calculator - Calculate Your Returns
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                See how your monthly SIP can grow over time with the power of compounding
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Calculator Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-green-200">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Monthly Investment
                      </label>
                      <span className="text-lg font-bold text-green-700">
                        ₹{sipCalculator.monthlyInvestment.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={sipCalculator.monthlyInvestment}
                      onChange={(e) => handleCalculatorChange('monthlyInvestment', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-2"
                      min="500"
                      step="500"
                    />
                    <input
                      type="range"
                      min="500"
                      max="100000"
                      step="500"
                      value={sipCalculator.monthlyInvestment}
                      onChange={(e) => handleCalculatorChange('monthlyInvestment', e.target.value)}
                      className="w-full accent-green-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₹500</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Expected Return Rate (% p.a.)
                      </label>
                      <span className="text-lg font-bold text-green-700">
                        {sipCalculator.expectedReturn}%
                      </span>
                    </div>
                    <input
                      type="number"
                      value={sipCalculator.expectedReturn}
                      onChange={(e) => handleCalculatorChange('expectedReturn', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-2"
                      min="1"
                      max="30"
                      step="0.5"
                    />
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.5"
                      value={sipCalculator.expectedReturn}
                      onChange={(e) => handleCalculatorChange('expectedReturn', e.target.value)}
                      className="w-full accent-green-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1%</span>
                      <span>30%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Time Period (Years)
                      </label>
                      <span className="text-lg font-bold text-green-700">
                        {sipCalculator.timePeriod} Years
                      </span>
                    </div>
                    <input
                      type="number"
                      value={sipCalculator.timePeriod}
                      onChange={(e) => handleCalculatorChange('timePeriod', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none mb-2"
                      min="1"
                      max="40"
                    />
                    <input
                      type="range"
                      min="1"
                      max="40"
                      step="1"
                      value={sipCalculator.timePeriod}
                      onChange={(e) => handleCalculatorChange('timePeriod', e.target.value)}
                      className="w-full accent-green-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 Year</span>
                      <span>40 Years</span>
                    </div>
                  </div>
                  
                  {/* Calculate Button */}
                  <button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <FaCalculator />
                        Calculate Returns
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results Display */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-6">Investment Summary</h3>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                    <p className="text-green-100 text-sm mb-2">Total Investment</p>
                    <p className="text-2xl md:text-3xl font-bold">
                      ₹{sipResults.invested.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-green-100 mt-2">
                      ₹{sipCalculator.monthlyInvestment.toLocaleString('en-IN')} × {sipCalculator.timePeriod * 12} months
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                    <p className="text-green-100 text-sm mb-2">Estimated Returns</p>
                    <p className="text-2xl md:text-3xl font-bold">
                      ₹{sipResults.returns.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-green-100 mt-2">
                      @ {sipCalculator.expectedReturn}% p.a. growth
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6 border-2 border-white/30">
                    <p className="text-green-50 text-sm mb-2">Total Value (Maturity)</p>
                    <p className="text-3xl md:text-4xl font-bold">
                      ₹{sipResults.futureValue.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <FaChartLine className="text-green-100" />
                      <p className="text-xs text-green-100">
                        Wealth Growth: {((sipResults.returns / sipResults.invested) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <p className="text-xs text-green-100 leading-relaxed">
                      * Returns are indicative and based on assumed rate. Actual returns may vary based on market performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Required Documents Section */}
        <section className="py-8 md:py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <FaFileAlt className="text-3xl md:text-4xl text-green-700" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Documents Required for SIP Investment
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Keep these documents ready for hassle-free SIP registration
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {requiredDocuments.map((doc, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl mb-4 shadow-md">
                    {doc.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{doc.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                  <ul className="space-y-2">
                    {doc.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-gray-700">
                        <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 md:mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Ready to Start Your SIP?</h3>
                  <p className="text-sm md:text-base text-green-50">
                    Our team will help you complete your KYC and start investing
                  </p>
                </div>
                <button 
                  onClick={scrollToApplyForm}
                  className="bg-white text-green-700 px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        </>
        )}

        <section id="apply-form" className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-green-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <FaFileAlt className="text-3xl md:text-4xl text-green-700" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Start Your SIP Investment
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Complete your SIP application in 4 simple steps
              </p>
            </div>

            {!showSuccess ? (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Progress Steps */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 md:px-8 py-6">
                  <div className="flex justify-between items-center max-w-2xl mx-auto">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          currentStep >= step 
                            ? 'bg-white text-green-700 shadow-lg' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {currentStep > step ? <FaCheckCircle /> : step}
                        </div>
                        {step < 4 && (
                          <div className={`hidden sm:block w-12 md:w-20 h-1 mx-2 transition-all ${
                            currentStep > step ? 'bg-white' : 'bg-green-500'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-white font-semibold text-sm md:text-base">
                      {currentStep === 1 && 'Personal Information'}
                      {currentStep === 2 && 'SIP Details'}
                      {currentStep === 3 && 'Address & KYC'}
                      {currentStep === 4 && 'Document Upload'}
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleApplicationSubmit} className="p-6 md:p-8">
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4 md:space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaUser className="inline mr-2 text-green-600" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={applicationForm.name}
                            onChange={handleApplicationChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.name ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Enter your full name"
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaEnvelope className="inline mr-2 text-green-600" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={applicationForm.email}
                            onChange={handleApplicationChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.email ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="your.email@example.com"
                          />
                          {formErrors.email && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaPhone className="inline mr-2 text-green-600" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={applicationForm.phone}
                            onChange={handleApplicationChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.phone ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="10-digit mobile number"
                          />
                          {formErrors.phone && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Age *
                          </label>
                          <input
                            type="number"
                            name="age"
                            value={applicationForm.age}
                            onChange={handleApplicationChange}
                            required
                            min="18"
                            max="100"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.age ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Your age"
                          />
                          {formErrors.age && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.age}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaIdCard className="inline mr-2 text-green-600" />
                          PAN Number *
                        </label>
                        <input
                          type="text"
                          name="panNumber"
                          value={applicationForm.panNumber}
                          onChange={handleApplicationChange}
                          required
                          maxLength="10"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                            formErrors.panNumber ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="ABCDE1234F"
                          style={{ textTransform: 'uppercase' }}
                        />
                        {formErrors.panNumber && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.panNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: SIP Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4 md:space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaRupeeSign className="inline mr-2 text-green-600" />
                            Monthly SIP Amount *
                          </label>
                          <input
                            type="number"
                            name="sipAmount"
                            value={applicationForm.sipAmount}
                            onChange={handleApplicationChange}
                            required
                            min="500"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.sipAmount ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Minimum ₹500"
                          />
                          {formErrors.sipAmount && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.sipAmount}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            SIP Frequency *
                          </label>
                          <select
                            name="sipFrequency"
                            value={applicationForm.sipFrequency}
                            onChange={handleApplicationChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.sipFrequency ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                          >
                            <option value="">Select Frequency</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                          </select>
                          {formErrors.sipFrequency && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.sipFrequency}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Investment Tenure (Years) *
                          </label>
                          <input
                            type="number"
                            name="tenure"
                            value={applicationForm.tenure}
                            onChange={handleApplicationChange}
                            required
                            min="1"
                            max="30"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.tenure ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Investment duration"
                          />
                          {formErrors.tenure && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.tenure}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Investment Goal *
                          </label>
                          <select
                            name="investmentGoal"
                            value={applicationForm.investmentGoal}
                            onChange={handleApplicationChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.investmentGoal ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                          >
                            <option value="">Select Goal</option>
                            <option value="wealth">Wealth Creation</option>
                            <option value="retirement">Retirement Planning</option>
                            <option value="education">Child Education</option>
                            <option value="home">Home Purchase</option>
                            <option value="marriage">Marriage Planning</option>
                          </select>
                          {formErrors.investmentGoal && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.investmentGoal}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Risk Profile *
                        </label>
                        <select
                          name="riskProfile"
                          value={applicationForm.riskProfile}
                          onChange={handleApplicationChange}
                          required
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                            formErrors.riskProfile ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select Risk Profile</option>
                          <option value="conservative">Conservative (Low Risk)</option>
                          <option value="moderate">Moderate (Balanced Risk)</option>
                          <option value="aggressive">Aggressive (High Risk)</option>
                        </select>
                        {formErrors.riskProfile && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.riskProfile}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Address & KYC */}
                  {currentStep === 3 && (
                    <div className="space-y-4 md:space-y-6 animate-fadeIn">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <FaMapMarkerAlt className="inline mr-2 text-green-600" />
                          Address *
                        </label>
                        <textarea
                          name="address"
                          value={applicationForm.address}
                          onChange={handleApplicationChange}
                          required
                          rows="3"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                            formErrors.address ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter your complete address"
                        />
                        {formErrors.address && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={applicationForm.city}
                            onChange={handleApplicationChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.city ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="City"
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={applicationForm.state}
                            onChange={handleApplicationChange}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.state ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="State"
                          />
                          {formErrors.state && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={applicationForm.pincode}
                            onChange={handleApplicationChange}
                            required
                            pattern="[0-9]{6}"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none ${
                              formErrors.pincode ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="6-digit PIN"
                          />
                          {formErrors.pincode && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Document Upload */}
                  {currentStep === 4 && (
                    <div className="space-y-4 md:space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaUpload className="inline mr-2 text-green-600" />
                            PAN Card *
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload('pan', e.target.files[0])}
                            accept="image/*,.pdf"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                          {formErrors.pan && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.pan}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaUpload className="inline mr-2 text-green-600" />
                            Aadhaar Card *
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload('aadhaar', e.target.files[0])}
                            accept="image/*,.pdf"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                          {formErrors.aadhaar && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.aadhaar}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaUpload className="inline mr-2 text-green-600" />
                            Passport Photo *
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload('photo', e.target.files[0])}
                            accept="image/*"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                          {formErrors.photo && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.photo}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaUpload className="inline mr-2 text-green-600" />
                            Bank Proof (Cancelled Cheque) *
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload('bankProof', e.target.files[0])}
                            accept="image/*,.pdf"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                          />
                          {formErrors.bankProof && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.bankProof}</p>
                          )}
                        </div>
                      </div>

                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          <FaCheckCircle className="inline text-green-600 mr-2" />
                          All documents should be clear and readable. Accepted formats: JPG, PNG, PDF (Max 5MB per file)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all"
                      >
                        Previous
                      </button>
                    )}
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="ml-auto px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
                      >
                        Start My SIP
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-5xl text-green-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  SIP Application Submitted Successfully!
                </h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  Your SIP application reference number is: <span className="font-bold text-green-600">SIP{Date.now()}</span>
                </p>
                <p className="text-gray-600 text-sm md:text-base">
                  Our investment advisor will review your application and contact you within 24 hours to complete the process.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-6 md:py-8 lg:py-10 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                FAQ's on SIP Investment
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Get answers to commonly asked questions about SIP investments
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden border-2 border-gray-200 hover:border-green-700 transition-all duration-300">
                  <button 
                    className={`w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left transition-all duration-300 ${
                      activeAccordion === index 
                        ? 'bg-green-700 text-white' 
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleAccordion(index)}
                  >
                    <span className="flex-1 pr-3 sm:pr-4 font-semibold text-sm sm:text-base md:text-lg">{faq.question}</span>
                    {activeAccordion === index ? (
                      <FaChevronUp className="text-lg sm:text-xl flex-shrink-0" />
                    ) : (
                      <FaChevronDown className="text-lg sm:text-xl flex-shrink-0" />
                    )}
                  </button>
                  {activeAccordion === index && (
                    <div className="p-4 sm:p-5 md:p-6 bg-gray-50 border-t-2 border-green-200 animate-fadeIn">
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 md:py-8 lg:py-10 bg-green-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Ready to Start Your SIP Journey?
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white/95 leading-relaxed">
              Start small, grow steadily, and achieve your long-term financial goals with Cashper's expert SIP advisory services
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button 
                onClick={scrollToApplyForm}
                className="bg-white text-green-700 px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base md:text-lg">
                Start SIP Investment
              </button>
              <button 
                onClick={handleContactNavigation}
                className="border-2 border-white text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-sm sm:text-base md:text-lg">
                Talk to Expert
              </button>
            </div>
          </div>
        </section>
      </div>
      {!isPopupMode && <Footer />}
    </>
  );
};

export default SIP;
