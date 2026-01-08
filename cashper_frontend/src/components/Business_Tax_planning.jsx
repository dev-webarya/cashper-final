import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { 
  bookBusinessTaxConsultation, 
  calculateBusinessTaxSavings, 
  submitBusinessTaxPlanningApplication 
} from '../services/businessTaxApi';

const Business_Tax_planning = ({ isPopupMode = false, onPopupClose }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessType: '',
    annualTurnover: '',
    businessPAN: '',
    contactNumber: '',
    businessEmail: '',
    gstNumber: '',
    businessStructure: '',
    industryType: '',
    turnoverRange: '',
    numberOfEmployees: '',
    businessDetails: ''
  });

  const [activeAccordion, setActiveAccordion] = useState(null);

  // Business Tax Calculator State
  const [businessTaxCalc, setBusinessTaxCalc] = useState({
    businessType: 'private',
    annualTurnover: '',
    annualProfit: '',
    depreciation: '',
    salaryExpenses: '',
    rdExpenses: ''
  });

  const [businessTaxResults, setBusinessTaxResults] = useState({
    turnover: 0,
    netProfit: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    taxWithoutPlanning: 0,
    taxAfterPlanning: 0,
    totalSavings: 0
  });

  const [isCalculating, setIsCalculating] = useState(false);
  
  // Handler for calculator inputs
  const handleCalculatorChange = (e) => {
    const { name, value } = e.target;
    setBusinessTaxCalc(prev => ({
      ...prev,
      [name]: name === 'businessType' ? value : (value === '' ? '' : parseFloat(value) || 0)
    }));
  };

  // Calculate business tax
  const handleCalculateBusinessTax = async () => {
    setIsCalculating(true);
    
    try {
      const response = await calculateBusinessTaxSavings(businessTaxCalc);
      
      setBusinessTaxResults({
        turnover: response.turnover,
        netProfit: response.netProfit,
        totalDeductions: response.totalDeductions,
        taxableIncome: response.taxableIncome,
        taxWithoutPlanning: response.taxWithoutPlanning,
        taxAfterPlanning: response.taxAfterPlanning,
        totalSavings: response.totalSavings
      });
      
      console.log('Business tax calculation:', response);
    } catch (error) {
      console.error('Error calculating business tax:', error);
      const errorMessage = error?.detail || error?.message || 'Failed to calculate tax. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Handler for hero section consultation form
  const handleHeroConsultationSubmit = async (e) => {
    e.preventDefault();
    
    const consultationData = {
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      businessType: formData.businessType,
      annualTurnover: formData.annualTurnover
    };
    
    try {
      const response = await bookBusinessTaxConsultation(consultationData);
      console.log('Consultation booked:', response);
      
      alert(`Thank you ${formData.ownerName}! Your consultation has been booked successfully. Booking ID: ${response.id}. We'll contact you soon.`);
      
      // Reset only hero form fields
      setFormData(prev => ({
        ...prev,
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        businessType: '',
        annualTurnover: ''
      }));
    } catch (error) {
      console.error('Error booking consultation:', error);
      const errorMessage = error?.detail || error?.message || 'Failed to book consultation. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const validationErrors = [];
      
      if (!formData.businessName || formData.businessName.trim().length < 3) {
        validationErrors.push('Business Name must be at least 3 characters');
      }
      if (!formData.ownerName || formData.ownerName.trim().length < 3) {
        validationErrors.push('Owner Name must be at least 3 characters');
      }
      if (!formData.businessPAN || formData.businessPAN.trim().length !== 10) {
        validationErrors.push('Business PAN must be 10 characters (Format: ABCDE1234F)');
      }
      if (!formData.businessEmail || !formData.businessEmail.includes('@')) {
        validationErrors.push('Valid business email address is required');
      }
      if (!formData.contactNumber || formData.contactNumber.replace(/\D/g, '').length < 10) {
        validationErrors.push('Contact number must have at least 10 digits');
      }
      if (!formData.businessStructure) {
        validationErrors.push('Business Structure is required');
      }
      if (!formData.industryType) {
        validationErrors.push('Industry Type is required');
      }
      if (!formData.turnoverRange) {
        validationErrors.push('Annual Turnover Range is required');
      }
      
      if (validationErrors.length > 0) {
        alert(`❌ Please Complete All Required Fields:\n\n${validationErrors.join('\n')}\n\n✓ Fill all fields marked with * to proceed.`);
        return;
      }
      
      const response = await submitBusinessTaxPlanningApplication(formData);
      console.log('Business Tax Application submitted:', response);
      
      alert(`✅ Thank you ${formData.ownerName}! Your business tax planning application has been submitted successfully.\n\nApplication ID: ${response.id}\n\nOur business tax expert will contact you within 24 hours at ${formData.email} or ${formData.phone}.`);
      
      // Reset form
      setFormData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        businessType: '',
        annualTurnover: '',
        businessPAN: '',
        contactNumber: '',
        businessEmail: '',
        gstNumber: '',
        businessStructure: '',
        industryType: '',
        turnoverRange: '',
        numberOfEmployees: '',
        businessDetails: ''
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error?.detail || error?.message || 'Failed to submit application. Please try again.';
      
      // Enhanced error messages
      if (errorMessage.includes('PAN') && errorMessage.includes('already exists')) {
        alert(`⚠️ Duplicate Application\n\n${errorMessage}\n\nIf this is your application, please contact our support team.`);
      } else if (errorMessage.includes('Invalid')) {
        alert(`❌ Validation Error\n\n${errorMessage}\n\nPlease check your input and try again.`);
      } else {
        alert(`❌ Submission Error\n\n${errorMessage}\n\nPlease try again or contact support.`);
      }
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const faqs = [
    {
      question: "What is business tax planning and why is it crucial for my company?",
      answer: "Business tax planning is a strategic process of analyzing your business operations, structure, income, and expenses to minimize corporate tax liability while ensuring full compliance with tax regulations. It's crucial because effective tax planning can save your business 15-30% on taxes annually, improve cash flow, help with better financial forecasting, and avoid costly penalties. It transforms tax from a burden into a strategic advantage."
    },
    {
      question: "What are the main tax benefits available for businesses in India?",
      answer: "Businesses in India can avail multiple tax benefits: Section 80C deductions for employer contributions, Section 35 for R&D expenses (100-200% weighted deduction), Section 80JJAA for employment generation (30% deduction on additional employee costs), Depreciation on assets, Section 32AD for investment in new plant & machinery, Section 10AA for SEZ units, MAT credit, and various industry-specific incentives. The key is strategic planning to maximize these benefits."
    },
    {
      question: "How can I reduce corporate tax liability legally?",
      answer: "Legal ways to reduce corporate tax include: Claim all eligible business expenses (salaries, rent, utilities, marketing), maximize depreciation on business assets, invest in tax-saving instruments, utilize presumptive taxation schemes (Section 44AD/44ADA) if eligible, set up business in tax-advantaged zones (SEZ), structure employee compensation efficiently, claim R&D and CSR deductions, and maintain proper documentation. Professional tax planning helps identify opportunities specific to your business."
    },
    {
      question: "What is the difference between tax planning, tax avoidance, and tax evasion?",
      answer: "Tax Planning is the legal arrangement of business affairs to minimize tax liability using legitimate deductions and exemptions - it's encouraged. Tax Avoidance uses loopholes in tax laws to reduce taxes - it's legal but may be challenged. Tax Evasion is the illegal non-payment or underpayment of taxes through misrepresentation - it's a criminal offense with severe penalties. Our services focus strictly on legal tax planning and compliance."
    },
    {
      question: "When should a business start tax planning?",
      answer: "Ideally, tax planning should begin at business inception - choosing the right business structure (Proprietorship, Partnership, LLP, Pvt Ltd, Public Ltd) has long-term tax implications. For existing businesses, plan at the start of the financial year (April) to implement strategies throughout the year. However, quarterly reviews are recommended to adjust strategies based on business performance. Avoid last-minute March tax planning which limits options."
    },
    {
      question: "What are the penalties for incorrect business tax filing?",
      answer: "Penalties for incorrect business tax filing can be severe: Late ITR filing - ₹5,000 to ₹10,000, Delay in advance tax - Interest @1% per month, Underreporting income - 50% of tax on underreported income, Misreporting income - 200% of tax on misreported income, Not maintaining books of accounts - 0.25% of turnover or ₹1 lakh (whichever is higher). Professional tax planning and timely filing prevent these costly penalties."
    },
    {
      question: "How does GST planning integrate with income tax planning?",
      answer: "GST and income tax planning are interconnected: GST input credit directly impacts business expenses and profitability, proper GST invoicing ensures deductibility for income tax purposes, GST compliance affects presumptive taxation eligibility, and integrated planning optimizes both indirect and direct tax benefits. Coordinated GST and income tax planning ensures maximum tax efficiency across your business operations."
    },
    {
      question: "Can startups and small businesses benefit from tax planning?",
      answer: "Absolutely! Startups and small businesses often benefit most from tax planning: Startups get 3-year tax holiday under Section 80-IAC (if DPIIT recognized), presumptive taxation (Section 44AD/44ADA) simplifies compliance for small businesses, proper expense categorization maximizes deductions, strategic asset purchases optimize depreciation, and early-stage tax planning prevents costly mistakes. Small investments in tax advisory can save 5-10x in taxes."
    },
    {
      question: "What documents are needed for business tax planning?",
      answer: "Essential documents include: Previous 2-3 years' ITRs and audited financials, GST returns, TDS certificates and payment receipts, bank statements and loan documents, investment proofs and asset purchase receipts, salary registers and employee details, rent agreements and utility bills, partnership deed/MOA/AOA, and any notices from tax authorities. Our team will guide you on specific documents needed based on your business structure."
    },
    {
      question: "How can business structure choice impact tax liability?",
      answer: "Business structure significantly impacts taxes: Proprietorship - taxed as individual (up to 30%+cess), Partnership/LLP - taxed at flat 30%+cess with no dividend distribution tax, Private Limited - 25-30% corporate tax plus dividend distribution tax. Each structure offers different deductions, compliance requirements, and tax advantages. Choosing the right structure based on turnover, number of partners, growth plans, and funding needs can save substantial taxes over time."
    }
  ];

  const businessTaxServices = [
    {
      icon: "🏢",
      title: "Corporate Tax Planning",
      description: "Comprehensive tax strategy for Private Limited, Public Limited companies to minimize corporate tax and maximize profitability"
    },
    {
      icon: "📊",
      title: "Business Structure Advisory",
      description: "Expert guidance on choosing tax-efficient business entity - Proprietorship, Partnership, LLP, Pvt Ltd based on your goals"
    },
    {
      icon: "📈",
      title: "Startup Tax Solutions",
      description: "Specialized tax planning for startups including Section 80-IAC benefits, DPIIT recognition, and investor-ready compliance"
    },
    {
      icon: "💼",
      title: "Business ITR Filing",
      description: "Accurate preparation and filing of business ITR (ITR-3, ITR-5, ITR-6) with tax audit compliance and TDS reconciliation"
    },
    {
      icon: "🎯",
      title: "Tax Audit & Compliance",
      description: "Complete tax audit services under Section 44AB, transfer pricing documentation, and regulatory compliance management"
    },
    {
      icon: "💰",
      title: "Business Expense Optimization",
      description: "Strategic categorization and documentation of business expenses to maximize legitimate deductions and tax savings"
    },
    {
      icon: "🔄",
      title: "GST & Income Tax Integration",
      description: "Coordinated GST and income tax planning for seamless compliance and optimization of input credits"
    },
    {
      icon: "📋",
      title: "Advance Tax Management",
      description: "Strategic calculation and payment of advance tax for businesses to avoid interest penalties and optimize cash flow"
    },
    {
      icon: "🏭",
      title: "Manufacturing Tax Incentives",
      description: "Specialized tax planning for manufacturing businesses including depreciation strategies and capital investment benefits"
    },
    {
      icon: "💻",
      title: "IT/Service Industry Tax",
      description: "Tax optimization for IT companies, consultants, and service providers including Section 10AA and export benefits"
    },
    {
      icon: "🏪",
      title: "Retail & E-commerce Tax",
      description: "Comprehensive tax solutions for retail chains and e-commerce businesses including inventory management tax strategies"
    },
    {
      icon: "📄",
      title: "Notice & Litigation Support",
      description: "Expert representation in tax assessments, appeals, and litigation before Income Tax and GST authorities"
    }
  ];

  const taxSavingStrategies = [
    {
      icon: "💡",
      title: "Depreciation Planning",
      description: "Maximize depreciation claims on business assets",
      benefit: "Save 15-20% on asset costs"
    },
    {
      icon: "👥",
      title: "Salary Structure Planning",
      description: "Optimize employee compensation for tax efficiency",
      benefit: "Reduce payroll tax burden"
    },
    {
      icon: "🔬",
      title: "R&D Tax Benefits",
      description: "Claim 100-200% weighted deduction on R&D expenses",
      benefit: "Section 35 benefits"
    },
    {
      icon: "🏗️",
      title: "Capital Investment Benefits",
      description: "Strategic timing of capital asset purchases",
      benefit: "Additional depreciation benefits"
    },
    {
      icon: "📚",
      title: "Business Expense Claims",
      description: "Identify all legitimate business expense deductions",
      benefit: "Maximize deductible expenses"
    },
    {
      icon: "🌍",
      title: "Export Incentives",
      description: "Leverage export promotion schemes and SEZ benefits",
      benefit: "Tax holidays and exemptions"
    }
  ];

  const whyChooseUs = [
    {
      icon: "🎓",
      title: "Certified Tax Experts",
      description: "CA, CS, and CMA professionals with 10+ years experience in business taxation and corporate compliance"
    },
    {
      icon: "🏆",
      title: "Industry Specialization",
      description: "Deep expertise across Manufacturing, IT, Retail, Healthcare, Real Estate, and Service industries"
    },
    {
      icon: "💡",
      title: "Proactive Tax Strategies",
      description: "Forward-thinking tax planning that anticipates regulatory changes and maximizes future benefits"
    },
    {
      icon: "🔒",
      title: "100% Compliance Focus",
      description: "All tax strategies are fully compliant with Income Tax Act, Companies Act, and SEBI regulations"
    },
    {
      icon: "💰",
      title: "Proven Tax Savings",
      description: "Our clients save 15-30% on taxes annually through strategic planning and legitimate optimization"
    },
    {
      icon: "📱",
      title: "Technology-Enabled",
      description: "Cloud-based document management, real-time tax tracking, and digital compliance monitoring"
    },
    {
      icon: "⚡",
      title: "Year-Round Support",
      description: "Continuous tax advisory, quarterly compliance reviews, and immediate response to tax notices"
    },
    {
      icon: "🤝",
      title: "Dedicated Account Manager",
      description: "Single point of contact for all your business tax needs with personalized service and quick turnaround"
    }
  ];

  const businessDeductions = [
    {
      category: "Operating Expenses",
      icon: "💼",
      items: [
        "Employee salaries & benefits",
        "Rent & utilities",
        "Marketing & advertising",
        "Office supplies & equipment",
        "Travel & conveyance",
        "Professional fees",
        "Insurance premiums",
        "Repairs & maintenance"
      ]
    },
    {
      category: "Special Deductions",
      icon: "⭐",
      items: [
        "Section 35: R&D expenses (100-200%)",
        "Section 80JJAA: Employment generation",
        "Section 32AD: New plant investment",
        "Section 35AD: Specified businesses",
        "Section 10AA: SEZ units",
        "CSR expenses (2% of profit)",
        "Bad debts write-off",
        "Depreciation on assets"
      ]
    },
    {
      category: "Investment Incentives",
      icon: "🎯",
      items: [
        "Capital asset depreciation",
        "Additional depreciation @20%",
        "Investment allowance",
        "New manufacturing setup benefits",
        "Technology upgradation incentives",
        "Green energy investments",
        "Skill development expenses",
        "Export promotion benefits"
      ]
    }
  ];

  const planningSteps = [
    {
      step: "01",
      title: "Business Analysis",
      description: "Comprehensive review of your business structure, financials, operations, industry, growth plans, and current tax position"
    },
    {
      step: "02",
      title: "Strategy Development",
      description: "Create customized tax-saving strategies including entity optimization, expense planning, and investment timing"
    },
    {
      step: "03",
      title: "Implementation Support",
      description: "Execute tax strategies with proper documentation, coordinate with accountants, and ensure regulatory compliance"
    },
    {
      step: "04",
      title: "Ongoing Management",
      description: "Quarterly reviews, advance tax calculation, ITR filing, audit support, and continuous optimization throughout the year"
    }
  ];

  const businessTypes = [
    {
      type: "Startups",
      description: "Tax-free profits for 3 years under Section 80-IAC for DPIIT-recognized startups",
      taxRate: "0% (if eligible)"
    },
    {
      type: "Small Businesses",
      description: "Presumptive taxation under Section 44AD (8% of turnover) for turnover up to ₹2 crore",
      taxRate: "Simplified"
    },
    {
      type: "Partnership/LLP",
      description: "Flat tax rate with no dividend distribution tax, profit distribution to partners",
      taxRate: "30% + cess"
    },
    {
      type: "Private Limited",
      description: "Lower corporate tax for companies with turnover up to ₹400 crore",
      taxRate: "25% + cess"
    },
    {
      type: "Manufacturing",
      description: "New manufacturing companies can opt for concessional rate without exemptions",
      taxRate: "15% + cess"
    },
    {
      type: "Professional Services",
      description: "Presumptive taxation under Section 44ADA (50% of receipts) for professionals",
      taxRate: "Simplified"
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-x-hidden">
      {!isPopupMode && <Navbar />}
      {!isPopupMode && (
      <>
      {/* Hero Section */}
      <section className="relative pt-20 xs:pt-22 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36 pb-6 xs:pb-7 sm:pb-8 md:pb-10 lg:pb-12 min-h-[450px] xs:min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] bg-cover bg-center bg-no-repeat text-white flex items-center overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'scroll',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-black/40 xs:bg-black/45 sm:bg-black/50"></div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 xs:gap-6 sm:gap-7 md:gap-8 lg:gap-10 items-center">
            <div className="space-y-3 xs:space-y-4 text-center md:text-left">
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight px-2 xs:px-0">
                Business Tax Planning & Corporate Tax Strategy
              </h1>
              <p className="text-xs xs:text-sm sm:text-base md:text-base lg:text-lg text-blue-100 px-2 xs:px-0 leading-relaxed">
                Expert business tax planning to reduce corporate tax liability by 15-30%. Our certified tax consultants help businesses of all sizes optimize taxes through strategic planning, maximize legitimate deductions, and ensure full compliance with tax regulations.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 xs:gap-3 sm:gap-4 justify-center md:justify-start pt-1 xs:pt-2 px-2 xs:px-0">
                <button 
                  onClick={() => document.getElementById('business-contact-form').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold px-5 xs:px-6 sm:px-7 md:px-8 lg:px-10 py-2.5 xs:py-3 sm:py-3.5 md:py-4 rounded-4xl shadow-xl hover:shadow-2xl transition-all duration-300 text-xs xs:text-sm sm:text-base md:text-lg text-center transform hover:scale-105 active:scale-95 touch-manipulation">
                  Get Business Tax Strategy
                </button>
                <Link 
                  to="/contact"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 active:bg-white/30 text-white font-semibold px-5 xs:px-6 sm:px-7 md:px-8 lg:px-10 py-2.5 xs:py-3 sm:py-3.5 md:py-4 rounded-4xl shadow-xl hover:shadow-2xl transition-all duration-300 text-xs xs:text-sm sm:text-base md:text-lg text-center transform hover:scale-105 active:scale-95 touch-manipulation">
                  Reduce Corporate Tax
                </Link>
              </div>
            </div>
            
            {/* Business Contact Form */}
            <div id="business-contact-form" className="bg-white rounded-4xl shadow-2xl p-3 xs:p-4 sm:p-5 md:p-6 mt-5 xs:mt-6 md:mt-0 mx-2 xs:mx-0">
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 text-center">
                FREE BUSINESS TAX CONSULTATION
              </h3>
              <form onSubmit={handleHeroConsultationSubmit} className="space-y-2 xs:space-y-2.5 sm:space-y-3">
                <input
                  type="text"
                  name="businessName"
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 rounded-4xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-gray-800 text-xs xs:text-sm sm:text-sm"
                  required
                />
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Owner/Director Name"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 rounded-4xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-gray-800 text-xs xs:text-sm sm:text-sm"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 rounded-4xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-gray-800 text-xs xs:text-sm sm:text-sm"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Contact Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 rounded-4xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-gray-800 text-xs xs:text-sm sm:text-sm"
                  required
                />
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 rounded-4xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-gray-800 text-xs xs:text-sm sm:text-sm"
                  required
                >
                  <option value="" disabled>Select Business Type</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="llp">LLP</option>
                  <option value="private-limited">Private Limited</option>
                  <option value="public-limited">Public Limited</option>
                  <option value="startup">Startup</option>
                </select>
                <select
                  name="annualTurnover"
                  value={formData.annualTurnover}
                  onChange={handleInputChange}
                  className="w-full px-2.5 xs:px-3 sm:px-3 py-1.5 xs:py-2 sm:py-2 rounded-4xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-gray-800 text-xs xs:text-sm sm:text-sm"
                  required
                >
                  <option value="" disabled>Select Annual Turnover</option>
                  <option value="below-20">Below ₹20 Lakhs</option>
                  <option value="20-1cr">₹20 Lakhs - ₹1 Crore</option>
                  <option value="1-5cr">₹1-5 Crore</option>
                  <option value="5-10cr">₹5-10 Crore</option>
                  <option value="10-50cr">₹10-50 Crore</option>
                  <option value="above-50cr">Above ₹50 Crore</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-4xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg text-sm transform hover:scale-105"
                >
                  GET FREE CONSULTATION
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* What is Business Tax Planning */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="relative order-1 md:order-1">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600" 
                  alt="Business Tax Planning" 
                  className="w-full h-64 sm:h-80 md:h-96 object-cover"
                />
              </div>
              {/* Decorative Elements - Hidden on mobile */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-24 h-24 sm:w-32 sm:h-32 bg-green-700 rounded-2xl opacity-20 -z-10"></div>
              <div className="hidden sm:block absolute -top-6 -left-6 w-24 h-24 sm:w-32 sm:h-32 bg-green-700 rounded-2xl opacity-20 -z-10"></div>
            </div>
            <div className="space-y-4 text-center lg:text-left order-2 md:order-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                What is <span className="text-green-700">Business Tax Planning?</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Business tax planning is a comprehensive strategic service designed for businesses of all sizes - from startups and SMEs to large corporations. It involves analyzing your business operations, financial structure, industry dynamics, and future goals to legally minimize corporate tax liability while ensuring full compliance with tax regulations.
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Unlike personal tax planning which focuses on individual deductions, business tax planning encompasses corporate tax optimization, GST management, transfer pricing, international taxation, business structure advisory, depreciation strategies, employee compensation planning, and strategic timing of capital investments. It's a year-round process that transforms tax from a cost center into a competitive advantage.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-5 rounded-xl border-l-4 border-green-700">
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                  💡 Business Tax Fact: Companies with professional tax planning save an average of 15-30% on their annual tax liability - that's ₹15-30 lakhs saved for every ₹1 crore profit!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Business Tax Planning is Important */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Business Tax Planning is Essential for Growth
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Strategic tax planning transforms your business finances and drives sustainable growth
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-3">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Reduce Corporate Tax Burden
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Save 15-30% on corporate taxes through strategic planning, legitimate deductions, depreciation optimization, and choosing the right tax regime for your business.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-3">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Improve Cash Flow Management
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Better cash flow through optimized advance tax payments, timely refund claims, strategic expense timing, and avoiding interest penalties on tax payments.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-3">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Ensure Full Compliance
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Stay compliant with Income Tax Act, Companies Act, GST regulations, TDS provisions, and avoid costly penalties, interest, or prosecution.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white mb-3">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Strategic Business Decisions
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Make informed decisions on business expansion, mergers & acquisitions, capital investments, and restructuring with clear tax implications.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white mb-3">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Investor & Lender Confidence
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Clean tax records and compliant financials attract investors, improve credit ratings, facilitate loans, and enhance business valuation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white mb-3">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Risk Mitigation
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Proactive tax planning reduces audit risks, minimizes disputes with tax authorities, and protects business reputation through proper documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Tax Services */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Comprehensive Business Tax Planning Services
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              End-to-end tax solutions for businesses across all industries and structures
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {businessTaxServices.map((service, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 p-5"
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tax Saving Strategies */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Proven Business Tax-Saving Strategies
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Strategic approaches to legally minimize corporate tax and maximize profitability
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {taxSavingStrategies.map((strategy, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-4xl mb-3">{strategy.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {strategy.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {strategy.description}
                </p>
                <div className="bg-gradient-to-r from-blue-100 to-green-100 px-3 py-2 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700">
                    {strategy.benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => document.getElementById('business-contact-form').scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base inline-block">
              Get Custom Tax Strategy
            </button>
          </div>
        </div>
      </section>

      {/* Business Deductions */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Business Tax Deductions & Incentives
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive list of tax deductions available to businesses in India
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {businessDeductions.map((section, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {section.category}
                  </h3>
                  <span className="text-3xl">{section.icon}</span>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                      <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-5 sm:p-6 rounded-xl border-l-4 border-green-700">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
              💡 Business Tax Planning Tip: Document Everything
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              The key to maximizing business deductions is <strong>proper documentation</strong>. Maintain detailed records of all business expenses with valid invoices, payment proofs, and business justification. During tax audits, <strong>documentation is your strongest defense</strong>. Our tax planning service includes setting up robust documentation systems to ensure you can claim every legitimate deduction while being audit-ready at all times.
            </p>
          </div>
        </div>
      </section>

      {/* Business Types & Tax Rates */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tax Rates for Different Business Structures
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the right business structure for optimal tax efficiency
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businessTypes.map((business, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {business.type}
                  </h3>
                  <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {business.taxRate}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {business.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                🤔 Not sure which business structure is most tax-efficient?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-5">
                Our experts analyze your business goals, turnover projections, funding needs, and risk tolerance to recommend the optimal business structure that minimizes tax and maximizes growth potential.
              </p>
              <button 
                onClick={() => document.getElementById('business-contact-form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-base inline-block">
                Get Business Structure Advisory
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our Business Tax Planning Process
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Structured 4-step approach to optimize your business taxes
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {planningSteps.map((step, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 relative border border-gray-100"
              >
                <div className="absolute -top-4 left-4 bg-gradient-to-r from-green-600 to-green-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.step}
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Choose Us for Business Tax Planning?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted business tax advisors with proven track record across industries
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our Business Tax Planning Impact
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Proven results for businesses across India
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center text-white shadow-xl">
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-base">Businesses Served</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center text-white shadow-xl">
              <div className="text-4xl font-bold mb-2">₹50Cr+</div>
              <p className="text-base">Tax Saved for Clients</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-center text-white shadow-xl">
              <div className="text-4xl font-bold mb-2">95%</div>
              <p className="text-base">Client Retention Rate</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-center text-white shadow-xl">
              <div className="text-4xl font-bold mb-2">10+</div>
              <p className="text-base">Years of Expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Required Documents for Business Tax Planning
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Essential documents needed for comprehensive business tax planning and compliance
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mr-3">
                  🏢
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Company Registration</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Company PAN Card</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Certificate of Incorporation</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>MOA & AOA / Partnership Deed</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>GST Registration Certificate</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>TAN & TDS Registration</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mr-3">
                  📊
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Financial Documents</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Previous 3 Years ITR & Audit Reports</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Balance Sheet & P&L Statement</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Books of Accounts (Digital/Physical)</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Bank Statements (All accounts)</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Trial Balance</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mr-3">
                  📑
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">GST & Tax Records</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>GST Returns (GSTR-1, 3B, 9)</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>TDS Returns (24Q, 26Q, 27Q)</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Form 26AS & AIS</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Advance Tax Payment Challans</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Previous Assessment Orders</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mr-3">
                  💼
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Business Operations</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Sales & Purchase Invoices</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Expense Bills & Vouchers</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Asset Purchase Documents</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Depreciation Schedule</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Inventory Records</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mr-3">
                  👥
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Employee Records</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Salary Register & Payslips</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>PF & ESI Contribution Records</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Professional Tax Returns</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Employee PAN & Aadhaar Details</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Form 16 issued to employees</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mr-3">
                  🏦
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Loans & Investments</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Business Loan Agreements</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Loan Repayment Schedules</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Investment in Business Assets</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Share Capital & Equity Documents</span>
                </li>
                <li className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Fixed Deposit Receipts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 p-5 sm:p-6 rounded-xl border-l-4 border-green-700">
            <p className="text-sm sm:text-base text-gray-800 text-center">
              <strong>📌 Important:</strong> Keep all documents organized digitally and physically. Our business tax experts will guide you on specific requirements based on your business structure, industry, and turnover.
            </p>
          </div>
        </div>
      </section>

      {/* Business Tax Calculator Section */}
      <section id="calculator" className="py-10 sm:py-12 md:py-16 bg-gradient-to-b from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Business Tax Savings Calculator
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Estimate your potential tax savings with strategic business tax planning
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-5 sm:p-6 md:p-8 shadow-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Business Details</h3>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select 
                    name="businessType"
                    value={businessTaxCalc.businessType}
                    onChange={handleCalculatorChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base">
                    <option value="">Select business type</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership/LLP</option>
                    <option value="private">Private Limited</option>
                    <option value="public">Public Limited</option>
                    <option value="startup">Startup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Annual Business Turnover (₹)
                  </label>
                  <input
                    type="number"
                    name="annualTurnover"
                    value={businessTaxCalc.annualTurnover}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 10000000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Annual Business Profit (₹)
                  </label>
                  <input
                    type="number"
                    name="annualProfit"
                    value={businessTaxCalc.annualProfit}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 2000000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Depreciation on Assets (₹)
                  </label>
                  <input
                    type="number"
                    name="depreciation"
                    value={businessTaxCalc.depreciation}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 200000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Plant, machinery, vehicles, etc.</p>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Employee Salary Expenses (₹/year)
                  </label>
                  <input
                    type="number"
                    name="salaryExpenses"
                    value={businessTaxCalc.salaryExpenses}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 500000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    R&D Expenses (if any) - Section 35 (₹)
                  </label>
                  <input
                    type="number"
                    name="rdExpenses"
                    value={businessTaxCalc.rdExpenses}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 100000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">100-200% weighted deduction available</p>
                </div>

                <button 
                  onClick={handleCalculateBusinessTax}
                  disabled={isCalculating}
                  className="w-full bg-gradient-to-r from-green-700 to-green-800 text-white py-3 sm:py-4 rounded-lg font-semibold hover:from-green-800 hover:to-green-900 transition-all duration-300 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {isCalculating ? 'Calculating...' : 'Calculate Business Tax'}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-5 sm:p-6 md:p-8 shadow-xl border-2 border-green-300">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Tax Analysis</h3>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Business Turnover</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      ₹{businessTaxResults.turnover.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Net Business Profit</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      ₹{businessTaxResults.netProfit.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Total Deductions</span>
                    <span className="text-base sm:text-lg font-bold text-green-600">
                      ₹{businessTaxResults.totalDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Taxable Income</span>
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      ₹{businessTaxResults.taxableIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 sm:p-4 shadow border-2 border-red-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">Tax Without Planning</span>
                    <span className="text-base sm:text-lg font-bold text-red-600">
                      ₹{businessTaxResults.taxWithoutPlanning.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 shadow border-2 border-green-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">Tax After Planning</span>
                    <span className="text-base sm:text-lg font-bold text-green-600">
                      ₹{businessTaxResults.taxAfterPlanning.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-lg p-5 sm:p-6 text-center text-white shadow-xl">
                <p className="text-xs sm:text-sm mb-2 opacity-90">Your Potential Tax Savings</p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  ₹{businessTaxResults.totalSavings.toLocaleString('en-IN')}
                </p>
                <p className="text-xs sm:text-sm opacity-90">Save 15-30% with expert planning!</p>
              </div>

              <div className="mt-5 sm:mt-6 text-center">
                <button 
                  onClick={() => document.getElementById('business-contact-form').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-green-700 px-5 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-xs sm:text-sm">
                  Get Expert Business Tax Plan
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white p-5 sm:p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center">
              <strong>Disclaimer:</strong> This calculator provides indicative tax estimates. Actual tax liability depends on your complete business profile, applicable deductions, industry-specific benefits, and tax regime chosen. Consult our certified business tax experts for accurate planning.
            </p>
          </div>
        </div>
      </section>

      </>
      )}

      {/* Business Tax Application Form */}
      <section id="apply-form" className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Apply for Business Tax Planning Service
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Get expert business tax consultation - Our team will reach out within 24 hours
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 sm:p-6 md:p-8 shadow-2xl border-2 border-green-200">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter your business name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Business PAN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessPAN"
                    value={formData.businessPAN}
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Owner/Director Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Business Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    placeholder="business@company.com"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    GST Number (if registered)
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Business Structure <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="businessStructure"
                    value={formData.businessStructure}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base" 
                    required
                  >
                    <option value="">Select structure</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="llp">LLP</option>
                    <option value="private">Private Limited</option>
                    <option value="public">Public Limited</option>
                    <option value="startup">Startup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Industry Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="industryType"
                    value={formData.industryType}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base" 
                    required
                  >
                    <option value="">Select industry</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="it-services">IT & Services</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="construction">Construction & Real Estate</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="finance">Finance & Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Annual Turnover Range <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="turnoverRange"
                    value={formData.turnoverRange}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base" 
                    required
                  >
                    <option value="">Select turnover</option>
                    <option value="below-20">Below ₹20 Lakhs</option>
                    <option value="20-1cr">₹20 Lakhs - ₹1 Crore</option>
                    <option value="1-5cr">₹1-5 Crore</option>
                    <option value="5-10cr">₹5-10 Crore</option>
                    <option value="10-50cr">₹10-50 Crore</option>
                    <option value="above-50cr">Above ₹50 Crore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Number of Employees
                  </label>
                  <select 
                    name="numberOfEmployees"
                    value={formData.numberOfEmployees}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  >
                    <option value="">Select range</option>
                    <option value="0-10">0-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-100">51-100</option>
                    <option value="101-500">101-500</option>
                    <option value="above-500">Above 500</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Services Required
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    Corporate Tax Planning
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    Business ITR Filing
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    Tax Audit & Compliance
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    GST Integration
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    Business Structure Advisory
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    Notice Response Support
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Business Details / Specific Requirements
                </label>
                <textarea
                  name="businessDetails"
                  value={formData.businessDetails}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about your business tax planning needs, challenges, or specific questions..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-700 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                ></textarea>
              </div>

              <div className="flex items-start">
                <input type="checkbox" className="mr-2 mt-1 w-4 h-4 text-green-600" required />
                <p className="text-xs sm:text-sm text-gray-600">
                  I agree to the Terms & Conditions and authorize the team to contact me for business tax planning services. <span className="text-red-500">*</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-700 to-green-800 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:from-green-800 hover:to-green-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Submit Business Tax Application
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                <strong>Need Immediate Assistance?</strong> Call us at <a href="tel:+919876543210" className="text-green-700 font-semibold hover:underline">6200755759<br/>7393080847</a> or email <a href="mailto:business@ Cashper.com" className="text-green-700 font-semibold hover:underline">business@ Cashper.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {!isPopupMode && (
      <>
      {/* FAQ Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about business tax planning
            </p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-base font-semibold text-gray-900 pr-6">
                    {faq.question}
                  </h3>
                  <span className="text-2xl text-green-700 flex-shrink-0 font-bold">
                    {activeAccordion === index ? '−' : '+'}
                  </span>
                </button>
                {activeAccordion === index && (
                  <div className="px-5 pb-4 bg-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Explore Our Other Carporate Services
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Complete business financial solutions for growth and compliance
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link 
              to="/personal-tax-planning"
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200 group">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                Personal Tax Planning
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Maximize individual tax savings and deductions
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Learn More →
              </div>
            </Link>

            <Link 
              to="/business-loan"
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-orange-200 group">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">
                Business Loan
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Quick funding from ₹1L to ₹50 Crores for business
              </p>
              <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Get Funded →
              </div>
            </Link>

            <Link 
              to="/gst-registration"
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-purple-200 group">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                GST Services
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                GST registration, filing and compliance support
              </p>
              <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Get Started →
              </div>
            </Link>

            <Link 
              to="/company-registration"
              className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-teal-200 group">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                Company Registration
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Register your Pvt Ltd, LLP or Partnership firm
              </p>
              <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Register Now →
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-r from-green-700 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Ready to Reduce Your Business Tax by 15-30%?
          </h2>
          <p className="text-base sm:text-lg mb-6">
            Get expert business tax planning strategies from certified professionals. Start saving lakhs in corporate taxes today!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
            <button 
              onClick={() => document.getElementById('business-contact-form').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-base text-center transform hover:scale-105 active:scale-95">
              Get Free Tax Consultation
            </button>
            <Link
              to="/contact"
              className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-base text-center transform hover:scale-105 active:scale-95">
              Schedule Strategy Call
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-white/30">
            <p className="text-sm">
              ✓ Free business tax consultation • ✓ Corporate tax strategies • ✓ Structure advisory • ✓ Compliance included
            </p>
          </div>
        </div>
      </section>
      </>
      )}

      {!isPopupMode && <Footer />}
    </div>
  );
};

export default Business_Tax_planning;
