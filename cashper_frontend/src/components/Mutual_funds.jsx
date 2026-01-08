import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaChartLine, 
  FaShieldAlt,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaRupeeSign,
  FaHandHoldingUsd,
  FaPiggyBank,
  FaUsers,
  FaLock,
  FaChartBar,
  FaFileAlt,
  FaSearch,
  FaWallet,
  FaMoneyBillWave,
  FaLayerGroup,
  FaTrophy,
  FaRegEye,
  FaUpload,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaHome,
  FaCamera,
  FaCalculator
} from 'react-icons/fa';
import { 
  submitContactInquiry, 
  calculateInvestmentReturns, 
  submitMutualFundApplication 
} from '../services/mutualFundsApi';
import Navbar from './Navbar';
import Footer from './Footer';

const Mutual_funds = ({ isPopupMode = false, onPopupClose }) => {
  const navigate = useNavigate();
  
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
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investmentAmount: '',
    investmentGoal: ''
  });

  const [activeAccordion, setActiveAccordion] = useState(null);
  
  // Application Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    panNumber: '',
    investmentType: '',
    investmentAmount: '',
    investmentGoal: '',
    riskProfile: '',
    sipAmount: '',
    sipFrequency: '',
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Investment Calculator State
  const [calculator, setCalculator] = useState({
    investmentType: 'lumpsum',
    amount: 10000,
    sipAmount: 5000,
    returnRate: 12,
    timePeriod: 10
  });
  
  const [calculatorResults, setCalculatorResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

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
      toast.success(response.message || 'Thank you! Our mutual fund advisor will contact you soon.');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        investmentAmount: '',
        investmentGoal: ''
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

  const scrollToCalculator = () => {
    const element = document.getElementById('calculator-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Validation Functions
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (value.length > 100) {
          error = 'Name must not exceed 100 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Name should only contain letters';
        }
        break;
        
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'phone':
        if (!value) {
          error = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(value.replace(/\s/g, ''))) {
          error = 'Please enter a valid 10-digit phone number';
        }
        break;
        
      case 'age':
        const ageNum = parseInt(value);
        if (!value) {
          error = 'Age is required';
        } else if (isNaN(ageNum) || ageNum < 18) {
          error = 'You must be at least 18 years old';
        } else if (ageNum > 100) {
          error = 'Please enter a valid age';
        }
        break;
        
      case 'panNumber':
        if (!value) {
          error = 'PAN number is required';
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) {
          error = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
        }
        break;
        
      case 'investmentType':
        if (!value) {
          error = 'Please select an investment type';
        }
        break;
        
      case 'investmentAmount':
        const amount = parseFloat(value);
        if (!value) {
          error = 'Investment amount is required';
        } else if (isNaN(amount) || amount < 500) {
          error = 'Minimum investment amount is ₹500';
        }
        break;
        
      case 'investmentGoal':
        if (!value) {
          error = 'Please select an investment goal';
        }
        break;
        
      case 'riskProfile':
        if (!value) {
          error = 'Please select a risk profile';
        }
        break;
        
      case 'sipAmount':
        if (applicationForm.investmentType === 'sip') {
          const sipAmt = parseFloat(value);
          if (!value) {
            error = 'SIP amount is required for SIP investment';
          } else if (isNaN(sipAmt) || sipAmt < 500) {
            error = 'Minimum SIP amount is ₹500';
          }
        }
        break;
        
      case 'sipFrequency':
        if (applicationForm.investmentType === 'sip' && !value) {
          error = 'Please select SIP frequency';
        }
        break;
        
      case 'address':
        if (!value || value.trim().length < 10) {
          error = 'Address must be at least 10 characters';
        } else if (value.length > 500) {
          error = 'Address must not exceed 500 characters';
        }
        break;
        
      case 'city':
        if (!value || value.trim().length < 2) {
          error = 'City name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'City name should only contain letters';
        }
        break;
        
      case 'state':
        if (!value || value.trim().length < 2) {
          error = 'State name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'State name should only contain letters';
        }
        break;
        
      case 'pincode':
        if (!value) {
          error = 'Pincode is required';
        } else if (!/^[0-9]{6}$/.test(value)) {
          error = 'Please enter a valid 6-digit pincode';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      ['name', 'email', 'phone', 'age', 'panNumber'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) newErrors[field] = error;
      });
    } else if (step === 2) {
      ['investmentType', 'investmentAmount', 'investmentGoal', 'riskProfile'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) newErrors[field] = error;
      });
      
      if (applicationForm.investmentType === 'sip') {
        ['sipAmount', 'sipFrequency'].forEach(field => {
          const error = validateField(field, applicationForm[field]);
          if (error) newErrors[field] = error;
        });
      }
    } else if (step === 3) {
      ['address', 'city', 'state', 'pincode'].forEach(field => {
        const error = validateField(field, applicationForm[field]);
        if (error) newErrors[field] = error;
      });
    } else if (step === 4) {
      if (!applicationForm.documents.pan) {
        newErrors['documents.pan'] = 'PAN card document is required';
      }
      if (!applicationForm.documents.aadhaar) {
        newErrors['documents.aadhaar'] = 'Aadhaar card document is required';
      }
      if (!applicationForm.documents.photo) {
        newErrors['documents.photo'] = 'Passport photo is required';
      }
      if (!applicationForm.documents.bankProof) {
        newErrors['documents.bankProof'] = 'Bank proof document is required';
      }
    }
    
    return newErrors;
  };

  // Application Form Handlers
  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
      }
    }
  };
  
  const handleBlur = (name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, applicationForm[name]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleFileUpload = (field, file) => {
    // Validate file
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [`documents.${field}`]: 'Only JPG, PNG, or PDF files are allowed'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [`documents.${field}`]: 'File size must not exceed 5MB'
        }));
        return;
      }
      
      // Clear error if file is valid
      setErrors(prev => ({
        ...prev,
        [`documents.${field}`]: ''
      }));
    }
    
    setApplicationForm(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }));
  };

  const nextStep = () => {
    // Validate current step before moving to next
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix all errors before proceeding');
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation for step 4
    const stepErrors = validateStep(4);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please upload all required documents');
      return;
    }
    
    try {
      const response = await submitMutualFundApplication(applicationForm);
      toast.success(response.message || 'Application submitted successfully!');
      
      // Show success state
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(1);
        // Reset form
        setApplicationForm({
          name: '',
          email: '',
          phone: '',
          age: '',
          panNumber: '',
          investmentType: '',
          investmentAmount: '',
          investmentGoal: '',
          riskProfile: '',
          sipAmount: '',
          sipFrequency: '',
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
        setErrors({});
        setTouched({});
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.detail || 'Failed to submit application. Please try again.');
    }
  };

  // Calculator Handlers
  const handleCalculatorChange = (field, value) => {
    setCalculator(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };
  
  // API-based calculator - call this when user wants to calculate
  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await calculateInvestmentReturns(calculator);
      setCalculatorResults(response);
      toast.success('Returns calculated successfully!');
    } catch (error) {
      console.error('Error calculating returns:', error);
      toast.error(error.detail || 'Failed to calculate returns. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateReturns = () => {
    // Use API results if available, otherwise use local calculation for display
    if (calculatorResults) {
      return {
        invested: Math.round(calculatorResults.totalInvestment),
        returns: Math.round(calculatorResults.estimatedReturns),
        totalValue: Math.round(calculatorResults.maturityValue)
      };
    }
    
    // Local calculation for initial display
    if (calculator.investmentType === 'lumpsum') {
      const invested = calculator.amount;
      const futureValue = invested * Math.pow((1 + calculator.returnRate / 100), calculator.timePeriod);
      const returns = futureValue - invested;
      return {
        invested: Math.round(invested),
        returns: Math.round(returns),
        totalValue: Math.round(futureValue)
      };
    } else {
      // SIP Calculation
      const P = calculator.sipAmount;
      const r = calculator.returnRate / 12 / 100;
      const n = calculator.timePeriod * 12;
      const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
      const invested = P * n;
      const returns = futureValue - invested;
      return {
        invested: Math.round(invested),
        returns: Math.round(returns),
        totalValue: Math.round(futureValue)
      };
    }
  };

  const investmentResults = calculateReturns();

  const mutualFundTypes = [
    {
      title: "Equity Mutual Funds",
      description: "Primarily invest in stocks and equities of various companies. They aim to generate long-term capital appreciation by capitalizing on the growth potential of the stock market.",
      subTypes: [
        { name: "Large-Cap Funds", desc: "Invest in well-established and financially stable companies, offering relatively stable returns" },
        { name: "Mid-Cap Funds", desc: "Invest in companies with moderate market capitalization, potentially offering higher growth compared to large-cap funds" },
        { name: "Small-Cap Funds", desc: "Invest in small-sized companies, carrying higher growth potential and risk due to their volatility" }
      ],
      icon: <FaChartLine />
    },
    {
      title: "Debt Mutual Funds",
      description: "Invest in fixed-income securities like government bonds, corporate bonds, and other debt instruments. They aim to provide stable returns and are suitable for investors seeking regular income.",
      icon: <FaShieldAlt />
    },
    {
      title: "Gilt Funds",
      description: "Invest in government securities, considered low-risk due to the sovereign backing. Ideal for conservative investors seeking stable returns.",
      icon: <FaLock />
    },
    {
      title: "Corporate Bond Funds",
      description: "Invest in bonds issued by corporations, varying in risk based on the issuer's creditworthiness. Offer higher returns compared to government securities.",
      icon: <FaFileAlt />
    },
    {
      title: "Liquid Funds",
      description: "Invest in short-term money market instruments, providing high liquidity and safety. Perfect for parking surplus funds for short periods.",
      icon: <FaMoneyBillWave />
    },
    {
      title: "Hybrid Mutual Funds",
      description: "Also known as balanced funds, invest in a mix of both equity and debt instruments. They aim to balance risk and return, offering diversification.",
      subTypes: [
        { name: "Conservative Hybrid Funds", desc: "Predominantly invest in debt with a small equity component, suited for conservative investors" },
        { name: "Aggressive Hybrid Funds", desc: "Maintain a higher equity allocation while balancing with debt, suitable for moderate risk-takers" }
      ],
      icon: <FaLayerGroup />
    }
  ];

  const investmentSteps = [
    {
      step: "1",
      title: "Mutual Fund Investment Planning",
      description: "Start by clarifying your investment goals and risk tolerance. Determine whether you're investing for long-term wealth accumulation, short-term goals, retirement, or any specific purpose.",
      icon: <FaSearch />
    },
    {
      step: "2",
      title: "Research and Selection",
      description: "Research different mutual fund options that align with your investment goals. Look for funds that have a consistent track record of performance, low expense ratios, and well-managed portfolios.",
      icon: <FaChartBar />
    },
    {
      step: "3",
      title: "Choose the Right Type",
      description: "Based on your investment goals and risk profile, select the appropriate type of mutual fund. Consider factors like asset class (equity, debt, hybrid), investment style, and thematic preferences.",
      icon: <FaWallet />
    },
    {
      step: "4",
      title: "Choose Investment Amount",
      description: "Decide on the amount you want to invest. You can choose between lump-sum investment or a systematic investment plan (SIP), where you invest a fixed amount at regular intervals.",
      icon: <FaRupeeSign />
    },
    {
      step: "5",
      title: "Monitor and Review",
      description: "Regularly monitor your investments' performance and ensure they are in line with your goals. Periodically review your portfolio and make adjustments if necessary.",
      icon: <FaRegEye />
    },
    {
      step: "6",
      title: "KYC Documentation",
      description: "Complete your Know Your Customer (KYC) documentation as mandated by regulatory authorities. This involves providing identity proof, address proof, and other necessary documents.",
      icon: <FaFileAlt />
    }
  ];

  const whyInvestBenefits = [
    {
      title: "Diversification of Assets",
      description: "Spread your investments across various securities to minimize risk",
      icon: <FaLayerGroup />
    },
    {
      title: "Offer High Liquidity",
      description: "Easy to buy and sell units, providing flexibility for your financial needs",
      icon: <FaMoneyBillWave />
    },
    {
      title: "Safety and Transparency",
      description: "Regulated by SEBI ensuring investor protection and transparent operations",
      icon: <FaShieldAlt />
    },
    {
      title: "Lower Cost",
      description: "Cost-effective investment option with professional fund management",
      icon: <FaRupeeSign />
    },
    {
      title: "Tax Benefits",
      description: "ELSS funds offer tax deductions under Section 80C of Income Tax Act",
      icon: <FaTrophy />
    }
  ];

  const whyChooseCashper = [
    {
      title: "Expert Mutual Fund Advisors",
      description: "Fincart takes care of its client's investment requirements with the help of mutual fund advisors",
      icon: <FaUsers />
    },
    {
      title: "Mutual Fund Calculator",
      description: "Availability of a mutual fund calculator that evaluates all the risks and rates of return associated with the investment",
      icon: <FaChartBar />
    },
    {
      title: "Goal-Focused Approach",
      description: "We focus on extracting the benefits of mutual funds to meet their financial goals",
      icon: <FaTrophy />
    },
    {
      title: "Regular Supervision",
      description: "Regular supervision by mutual fund advisor and planner to keep your investments on track",
      icon: <FaRegEye />
    }
  ];

  const requiredDocuments = [
    {
      title: "PAN Card",
      description: "Mandatory for all mutual fund investments as per regulatory requirements",
      icon: <FaIdCard />,
      items: ["Original PAN card or PAN card photocopy", "Must be valid and not expired"]
    },
    {
      title: "Identity Proof",
      description: "Any government-issued identity document for verification",
      icon: <FaUser />,
      items: ["Aadhaar Card", "Passport", "Voter ID", "Driving License"]
    },
    {
      title: "Address Proof",
      description: "Document showing your current residential address",
      icon: <FaHome />,
      items: ["Aadhaar Card", "Utility bills (not older than 3 months)", "Bank statement", "Passport"]
    },
    {
      title: "Bank Account Proof",
      description: "Bank details for fund redemption and transactions",
      icon: <FaWallet />,
      items: ["Cancelled cheque leaf", "Bank statement", "Passbook first page copy"]
    },
    {
      title: "Passport Size Photographs",
      description: "Recent color photographs for account opening",
      icon: <FaCamera />,
      items: ["2-3 recent passport size photos", "White background preferred"]
    },
    {
      title: "Income Proof (Optional)",
      description: "For investments above certain threshold amounts",
      icon: <FaFileAlt />,
      items: ["Salary slips", "ITR acknowledgment", "Form 16"]
    }
  ];

  const faqs = [
    {
      question: "Do mutual funds guarantee returns?",
      answer: "Mutual fund is a market linked product. As per SEBI, their returns cannot be guaranteed. Mutual funds are subject to market risks. However, they offer the potential for higher returns compared to traditional investment options over the long term. The returns depend on the performance of the underlying securities in which the fund invests."
    },
    {
      question: "What are the types of mutual funds?",
      answer: "There are several types of mutual funds including Equity Mutual Funds (Large-Cap, Mid-Cap, Small-Cap), Debt Mutual Funds, Gilt Funds, Corporate Bond Funds, Liquid Funds, and Hybrid Mutual Funds (Conservative and Aggressive). Each type caters to different risk appetites, investment goals, and time horizons."
    },
    {
      question: "What are the key benefits of investing in a mutual fund?",
      answer: "Key benefits include: 1) Diversification of assets to minimize risk, 2) High liquidity for easy buying and selling, 3) Safety and transparency regulated by SEBI, 4) Lower costs with professional fund management, 5) Tax benefits through ELSS funds under Section 80C, 6) Professional management by experienced fund managers, and 7) Accessibility for investors with various budget levels starting from as low as ₹500."
    },
    {
      question: "How do mutual funds work?",
      answer: "Mutual funds pool money from multiple investors to invest in a diversified portfolio of stocks, bonds, or other assets. Professional fund managers make investment decisions on behalf of investors. Each investor owns shares proportional to their investment, and gains or losses are distributed among shareholders. This structure allows individual investors to access a diversified portfolio without directly managing investments."
    },
    {
      question: "What is the minimum investment amount for mutual funds?",
      answer: "The minimum investment amount varies across different mutual fund schemes. For SIP (Systematic Investment Plan), you can start with as little as ₹500 per month. For lump sum investments, the minimum amount typically ranges from ₹5,000 to ₹10,000 depending on the fund house and scheme. This makes mutual funds accessible to investors across different income levels."
    },
    {
      question: "How are mutual funds taxed in India?",
      answer: "Tax treatment depends on the type of mutual fund and holding period. For Equity Funds: Long-term capital gains (LTCG) above ₹1 lakh are taxed at 10%, short-term gains (STCG) at 15%. For Debt Funds: LTCG (held over 3 years) taxed at 20% with indexation benefit, STCG taxed as per your income tax slab. ELSS funds offer tax deduction up to ₹1.5 lakhs under Section 80C with 3-year lock-in period."
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
            backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80')",
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
                  Multiply Your Wealth: Start Investing in Mutual Funds Today
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/95 leading-relaxed">
                  Discover the potential of mutual funds with Cashper's expert guidance. Our mutual fund consultant and mutual fund advisor will design a strategy to maximize your wealth through carefully selected mutual fund investments.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 justify-center md:justify-start pt-2">
                  <button 
                    onClick={scrollToApplyForm}
                    className="bg-white text-green-700 px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm md:text-base">
                    Start Investing Now
                  </button>
                  <button 
                    onClick={scrollToCalculator}
                    className="border-2 border-white text-white px-4 sm:px-5 md:px-6 lg:px-7 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-xs sm:text-sm md:text-base">
                    Explore Funds
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
                    placeholder="Investment Amount (₹)"
                    value={formData.investmentAmount}
                    onChange={handleInputChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  />
                  <select
                    name="investmentGoal"
                    value={formData.investmentGoal}
                    onChange={handleInputChange}
                    className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                    required
                  >
                    <option value="">Select Investment Goal</option>
                    <option value="Wealth Creation">Wealth Creation</option>
                    <option value="Retirement Planning">Retirement Planning</option>
                    <option value="Child Education">Child Education</option>
                    <option value="Tax Saving">Tax Saving</option>
                    <option value="Short Term Goals">Short Term Goals</option>
                    <option value="Emergency Fund">Emergency Fund</option>
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

        {/* Understanding Mutual Funds Section */}
        <section className="py-6 md:py-8 lg:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-gray-900">
                  Understanding Mutual Fund with Cashper Mutual Fund Advisor
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  A mutual fund is a financial vehicle in which the investors pool money to invest in different markets and securities. Such funds are invested based on a particular fund scheme objective. Mutual fund investments are a great source to help you achieve your financial goals.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4">
                  Mutual funds aim to generate returns by investing in a diversified mix of assets, reducing the risk associated with single-stock investments. They cater to various risk profiles, from conservative to aggressive, offering options suitable for different investment objectives and time horizons.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                  Investing in mutual funds involves purchasing units of the fund, with each unit representing a portion of the total assets. As the fund's holdings appreciate or generate income, investors benefit proportionally. The inherent diversification helps spread risk, and investors can choose funds aligned with their financial goals.
                </p>
              </div>
              <div className="order-1 lg:order-2 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&q=80" 
                  alt="Mutual Fund Investment Growth" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How Do Mutual Funds Work */}
        <section className="py-6 md:py-8 lg:py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                How Do Mutual Funds Work?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Under mutual fund investment, funds are pooled from multiple investors to invest in a diversified portfolio of stocks, bonds, or other assets. Professional fund managers make investment decisions on behalf of investors. Each investor owns shares proportional to their investment, and gains or losses are distributed among shareholders.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border-t-4 border-green-700">
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                This structure allows individual investors to access a diversified portfolio without directly managing investments, making mutual funds a popular choice for those seeking convenience and diversification in their investments. Professional fund managers continuously monitor market conditions, rebalance portfolios, and make strategic decisions to optimize returns while managing risk according to the fund's investment objective.
              </p>
            </div>
          </div>
        </section>

        {/* Types of Mutual Funds */}
        <section className="py-6 md:py-8 lg:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Types of Mutual Fund Investment
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Explore various types of mutual fund investment plans tailored to your financial goals
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {mutualFundTypes.map((type, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-green-200 hover:border-green-700 hover:-translate-y-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-700 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl flex-shrink-0 shadow-lg">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">{type.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">{type.description}</p>
                  {type.subTypes && (
                    <div className="space-y-3 mt-4 pt-4 border-t-2 border-green-200">
                      {type.subTypes.map((subType, subIndex) => (
                        <div key={subIndex} className="flex items-start gap-2">
                          <FaCheckCircle className="text-green-700 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm sm:text-base font-semibold text-gray-800">{subType.name}:</p>
                            <p className="text-xs sm:text-sm text-gray-600">{subType.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 md:mt-12 text-center">
              <button 
                onClick={handleContactNavigation}
                className="bg-green-700 hover:bg-green-800 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base md:text-lg">
                Get Expert Advice Now
              </button>
            </div>
          </div>
        </section>

        {/* How To Invest in Mutual Funds */}
        <section className="py-6 md:py-8 lg:py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                How To Invest In Mutual Funds?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Investing in mutual funds involves a systematic approach to ensure you make informed decisions that align with your financial goals and risk tolerance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {investmentSteps.map((step, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-700 hover:-translate-y-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 bg-green-700 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl text-green-700 mb-3">
                    {step.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Mutual Funds Investment */}
        <section className="py-6 md:py-8 lg:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Why Mutual Funds Investment?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                We will delve into the advantages of mutual funds investment and why they are an excellent option for both novice and experienced investors
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {whyInvestBenefits.map((benefit, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-200">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 bg-green-700 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl shadow-lg">
                    {benefit.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Cashper */}
        <section className="py-6 md:py-8 lg:py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Why Choose Cashper For Mutual Funds Investment?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {whyChooseCashper.map((item, index) => (
                <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-green-700">
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

        {/* Investment Planning Process */}
        <section className="py-6 md:py-8 lg:py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Mutual Fund Investment Planning Process
              </h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-gray-50 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border-2 border-green-200">
              <div className="space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  The general investment planning process is followed to evaluate the product's suitability to the client's risk profile and actual requirements.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  However, if a client insists on knowing just the mutual fund scheme, we first evaluate his risk profile and try to understand when he will need the money.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  The system then picks the best-suited investment products based on the above two filters, ensuring optimal returns while managing risk effectively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Calculator Section */}
        <section id="calculator" className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-green-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                <FaCalculator className="text-3xl md:text-4xl text-green-700" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Mutual Fund Investment Calculator
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Calculate your potential returns from lumpsum or SIP investments
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Calculator Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-2 border-green-200">
                <div className="space-y-6">
                  {/* Investment Type Toggle */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => handleCalculatorChange('investmentType', 'lumpsum')}
                      className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                        calculator.investmentType === 'lumpsum'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Lumpsum
                    </button>
                    <button
                      onClick={() => handleCalculatorChange('investmentType', 'sip')}
                      className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                        calculator.investmentType === 'sip'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      SIP
                    </button>
                  </div>

                  {/* Investment Amount */}
                  {calculator.investmentType === 'lumpsum' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Investment Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={calculator.amount}
                        onChange={(e) => handleCalculatorChange('amount', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        min="500"
                        step="1000"
                      />
                      <input
                        type="range"
                        value={calculator.amount}
                        onChange={(e) => handleCalculatorChange('amount', e.target.value)}
                        className="w-full mt-2 accent-green-600"
                        min="500"
                        max="1000000"
                        step="1000"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Monthly SIP Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={calculator.sipAmount}
                        onChange={(e) => handleCalculatorChange('sipAmount', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                        min="500"
                        step="500"
                      />
                      <input
                        type="range"
                        value={calculator.sipAmount}
                        onChange={(e) => handleCalculatorChange('sipAmount', e.target.value)}
                        className="w-full mt-2 accent-green-600"
                        min="500"
                        max="100000"
                        step="500"
                      />
                    </div>
                  )}

                  {/* Expected Return Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expected Return Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      value={calculator.returnRate}
                      onChange={(e) => handleCalculatorChange('returnRate', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      min="1"
                      max="30"
                      step="0.5"
                    />
                    <input
                      type="range"
                      value={calculator.returnRate}
                      onChange={(e) => handleCalculatorChange('returnRate', e.target.value)}
                      className="w-full mt-2 accent-green-600"
                      min="1"
                      max="30"
                      step="0.5"
                    />
                  </div>

                  {/* Time Period */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time Period (Years)
                    </label>
                    <input
                      type="number"
                      value={calculator.timePeriod}
                      onChange={(e) => handleCalculatorChange('timePeriod', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      min="1"
                      max="40"
                    />
                    <input
                      type="range"
                      value={calculator.timePeriod}
                      onChange={(e) => handleCalculatorChange('timePeriod', e.target.value)}
                      className="w-full mt-2 accent-green-600"
                      min="1"
                      max="40"
                    />
                  </div>
                  
                  {/* Calculate Button */}
                  <button
                    type="button"
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate Returns'}
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
                      ₹{investmentResults.invested.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6">
                    <p className="text-green-100 text-sm mb-2">Estimated Returns</p>
                    <p className="text-2xl md:text-3xl font-bold">
                      ₹{investmentResults.returns.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6 border-2 border-white/30">
                    <p className="text-green-50 text-sm mb-2">Total Value</p>
                    <p className="text-3xl md:text-4xl font-bold">
                      ₹{investmentResults.totalValue.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-xs md:text-sm text-green-100 leading-relaxed">
                      * Returns are calculated based on the expected rate and may vary with actual market performance. Past performance is not indicative of future results.
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
                Documents Required for Mutual Fund Investment
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
                Keep these documents ready for a smooth investment process
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
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Need Help with Documentation?</h3>
                  <p className="text-sm md:text-base text-green-50">
                    Our experts will guide you through the entire process
                  </p>
                </div>
                <button 
                  onClick={scrollToApplyForm}
                  className="bg-white text-green-700 px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap">
                  Get Assistance
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
                Apply for Mutual Fund Investment
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Complete your application in 4 simple steps
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
                      {currentStep === 2 && 'Investment Details'}
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
                            onBlur={() => handleBlur('name')}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.name 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Enter your full name"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.name}
                            </p>
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
                            onBlur={() => handleBlur('email')}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.email 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="your.email@example.com"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.email}
                            </p>
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
                            onBlur={() => handleBlur('phone')}
                            required
                            maxLength="10"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.phone 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="10-digit mobile number"
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.phone}
                            </p>
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
                            onBlur={() => handleBlur('age')}
                            required
                            min="18"
                            max="100"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.age 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Your age"
                          />
                          {errors.age && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.age}
                            </p>
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
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            handleApplicationChange({ target: { name: 'panNumber', value } });
                          }}
                          onBlur={() => handleBlur('panNumber')}
                          required
                          maxLength="10"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.panNumber 
                              ? 'border-red-500 focus:border-red-600' 
                              : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="ABCDE1234F"
                          style={{ textTransform: 'uppercase' }}
                        />
                        {errors.panNumber && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.panNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Investment Details */}
                  {currentStep === 2 && (
                    <div className="space-y-4 md:space-y-6 animate-fadeIn">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Investment Type *
                        </label>
                        <select
                          name="investmentType"
                          value={applicationForm.investmentType}
                          onChange={handleApplicationChange}
                          onBlur={() => handleBlur('investmentType')}
                          required
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.investmentType 
                              ? 'border-red-500 focus:border-red-600' 
                              : 'border-gray-200 focus:border-green-500'
                          }`}
                        >
                          <option value="">Select Investment Type</option>
                          <option value="lumpsum">Lumpsum Investment</option>
                          <option value="sip">Systematic Investment Plan (SIP)</option>
                        </select>
                        {errors.investmentType && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.investmentType}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaRupeeSign className="inline mr-2 text-green-600" />
                            Investment Amount *
                          </label>
                          <input
                            type="number"
                            name="investmentAmount"
                            value={applicationForm.investmentAmount}
                            onChange={handleApplicationChange}
                            onBlur={() => handleBlur('investmentAmount')}
                            required
                            min="500"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.investmentAmount 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="Minimum ₹500"
                          />
                          {errors.investmentAmount && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.investmentAmount}
                            </p>
                          )}
                        </div>
                        {applicationForm.investmentType === 'sip' && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                SIP Amount (Monthly) *
                              </label>
                              <input
                                type="number"
                                name="sipAmount"
                                value={applicationForm.sipAmount}
                                onChange={handleApplicationChange}
                                onBlur={() => handleBlur('sipAmount')}
                                required={applicationForm.investmentType === 'sip'}
                                min="500"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                  errors.sipAmount 
                                    ? 'border-red-500 focus:border-red-600' 
                                    : 'border-gray-200 focus:border-green-500'
                                }`}
                                placeholder="Minimum ₹500"
                              />
                              {errors.sipAmount && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <span className="mr-1">⚠</span> {errors.sipAmount}
                                </p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                SIP Frequency *
                              </label>
                              <select
                                name="sipFrequency"
                                value={applicationForm.sipFrequency}
                                onChange={handleApplicationChange}
                                onBlur={() => handleBlur('sipFrequency')}
                                required={applicationForm.investmentType === 'sip'}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                                  errors.sipFrequency 
                                    ? 'border-red-500 focus:border-red-600' 
                                    : 'border-gray-200 focus:border-green-500'
                                }`}
                              >
                                <option value="">Select Frequency</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Half-Yearly">Half-Yearly</option>
                                <option value="Yearly">Yearly</option>
                              </select>
                              {errors.sipFrequency && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <span className="mr-1">⚠</span> {errors.sipFrequency}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Investment Goal *
                          </label>
                          <select
                            name="investmentGoal"
                            value={applicationForm.investmentGoal}
                            onChange={handleApplicationChange}
                            onBlur={() => handleBlur('investmentGoal')}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.investmentGoal 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                          >
                            <option value="">Select Investment Goal</option>
                            <option value="Wealth Creation">Wealth Creation</option>
                            <option value="Retirement Planning">Retirement Planning</option>
                            <option value="Child Education">Child Education</option>
                            <option value="Tax Saving">Tax Saving</option>
                            <option value="Short Term Goals">Short Term Goals</option>
                            <option value="Emergency Fund">Emergency Fund</option>
                          </select>
                          {errors.investmentGoal && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.investmentGoal}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Risk Profile *
                          </label>
                          <select
                            name="riskProfile"
                            value={applicationForm.riskProfile}
                            onChange={handleApplicationChange}
                            onBlur={() => handleBlur('riskProfile')}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.riskProfile 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                          >
                            <option value="">Select Risk Profile</option>
                            <option value="Low">Low</option>
                            <option value="Moderate">Moderate</option>
                            <option value="High">High</option>
                            <option value="Very High">Very High</option>
                          </select>
                          {errors.riskProfile && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.riskProfile}
                            </p>
                          )}
                        </div>
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
                          onBlur={() => handleBlur('address')}
                          required
                          rows="3"
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                            errors.address 
                              ? 'border-red-500 focus:border-red-600' 
                              : 'border-gray-200 focus:border-green-500'
                          }`}
                          placeholder="Enter your complete address"
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <span className="mr-1">⚠</span> {errors.address}
                          </p>
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
                            onBlur={() => handleBlur('city')}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.city 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="City"
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.city}
                            </p>
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
                            onBlur={() => handleBlur('state')}
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.state 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="State"
                          />
                          {errors.state && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.state}
                            </p>
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
                            onBlur={() => handleBlur('pincode')}
                            required
                            maxLength="6"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors.pincode 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                            placeholder="6-digit PIN"
                          />
                          {errors.pincode && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors.pincode}
                            </p>
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
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors['documents.pan'] 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                          />
                          {applicationForm.documents.pan && !errors['documents.pan'] && (
                            <p className="mt-1 text-sm text-green-600 flex items-center">
                              <FaCheckCircle className="mr-1" /> {applicationForm.documents.pan.name}
                            </p>
                          )}
                          {errors['documents.pan'] && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors['documents.pan']}
                            </p>
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
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors['documents.aadhaar'] 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                          />
                          {applicationForm.documents.aadhaar && !errors['documents.aadhaar'] && (
                            <p className="mt-1 text-sm text-green-600 flex items-center">
                              <FaCheckCircle className="mr-1" /> {applicationForm.documents.aadhaar.name}
                            </p>
                          )}
                          {errors['documents.aadhaar'] && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors['documents.aadhaar']}
                            </p>
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
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors['documents.photo'] 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                          />
                          {applicationForm.documents.photo && !errors['documents.photo'] && (
                            <p className="mt-1 text-sm text-green-600 flex items-center">
                              <FaCheckCircle className="mr-1" /> {applicationForm.documents.photo.name}
                            </p>
                          )}
                          {errors['documents.photo'] && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors['documents.photo']}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FaUpload className="inline mr-2 text-green-600" />
                            Bank Proof *
                          </label>
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload('bankProof', e.target.files[0])}
                            accept="image/*,.pdf"
                            required
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                              errors['documents.bankProof'] 
                                ? 'border-red-500 focus:border-red-600' 
                                : 'border-gray-200 focus:border-green-500'
                            }`}
                          />
                          {applicationForm.documents.bankProof && !errors['documents.bankProof'] && (
                            <p className="mt-1 text-sm text-green-600 flex items-center">
                              <FaCheckCircle className="mr-1" /> {applicationForm.documents.bankProof.name}
                            </p>
                          )}
                          {errors['documents.bankProof'] && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <span className="mr-1">⚠</span> {errors['documents.bankProof']}
                            </p>
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
                        Submit Application
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
                  Application Submitted Successfully!
                </h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">
                  Your application reference number is: <span className="font-bold text-green-600">MF{Date.now()}</span>
                </p>
                <p className="text-gray-600 text-sm md:text-base">
                  Our mutual fund advisor will review your application and contact you within 24-48 hours.
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
                FAQ's on Mutual Funds
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Get answers to commonly asked questions about mutual fund investments
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
              Ready to Start Your Mutual Fund Investment Journey?
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white/95 leading-relaxed">
              Get personalized mutual fund recommendations from our expert advisors and start building wealth today
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button 
                onClick={scrollToApplyForm}
                className="bg-white text-green-700 px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base md:text-lg">
                Start Investing
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

export default Mutual_funds;
