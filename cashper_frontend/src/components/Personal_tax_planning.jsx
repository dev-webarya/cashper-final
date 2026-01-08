import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { bookTaxConsultation, calculateTaxSavings, submitTaxPlanningApplication } from '../services/personalTaxApi';

const Personal_tax_planning = ({ isPopupMode = false, onPopupClose = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    income: '',
    taxRegime: '',
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    panNumber: '',
    annualIncome: '',
    employmentType: '',
    preferredTaxRegime: '',
    additionalInfo: ''
  });

  const [activeAccordion, setActiveAccordion] = useState(null);

  // Tax Calculator State
  const [taxCalculator, setTaxCalculator] = useState({
    grossIncome: '',
    section80C: '',
    section80D: '',
    nps80CCD1B: '',
    homeLoanInterest: ''
  });

  const [taxResults, setTaxResults] = useState({
    grossIncome: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    taxWithoutPlanning: 0,
    taxAfterPlanning: 0,
    totalSavings: 0
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Determine which form is being submitted based on which fields are filled
      if (formData.fullName && formData.panNumber) {
        // Validate main application form
        const validationErrors = [];
        
        if (!formData.fullName || formData.fullName.trim().length < 3) {
          validationErrors.push('Full Name must be at least 3 characters');
        }
        if (!formData.emailAddress || !formData.emailAddress.includes('@')) {
          validationErrors.push('Valid email address is required');
        }
        if (!formData.phoneNumber || formData.phoneNumber.replace(/\D/g, '').length < 10) {
          validationErrors.push('Phone number must have at least 10 digits');
        }
        if (!formData.panNumber || formData.panNumber.length !== 10) {
          validationErrors.push('PAN number must be 10 characters (Format: ABCDE1234F)');
        }
        if (!formData.annualIncome) {
          validationErrors.push('Annual Income Range is required');
        }
        if (!formData.employmentType) {
          validationErrors.push('Employment Type is required');
        }
        
        if (validationErrors.length > 0) {
          alert(`❌ Validation Errors:\n\n${validationErrors.join('\n')}`);
          return;
        }
        
        // Main application form
        const response = await submitTaxPlanningApplication({
          fullName: formData.fullName,
          emailAddress: formData.emailAddress,
          phoneNumber: formData.phoneNumber,
          panNumber: formData.panNumber,
          annualIncome: formData.annualIncome,
          employmentType: formData.employmentType,
          preferredTaxRegime: formData.preferredTaxRegime || null,
          additionalInfo: formData.additionalInfo || null
        });
        alert(`✅ Thank you ${formData.fullName}! Your application has been submitted successfully.\n\nApplication ID: ${response.id}\n\nOur tax experts will contact you within 24 hours at ${formData.emailAddress} or ${formData.phoneNumber}.`);
        // Reset main form
        setFormData({
          ...formData,
          fullName: '',
          emailAddress: '',
          phoneNumber: '',
          panNumber: '',
          annualIncome: '',
          employmentType: '',
          preferredTaxRegime: '',
          additionalInfo: ''
        });
      } else {
        // Hero section consultation form - validate
        const validationErrors = [];
        
        if (!formData.name || formData.name.trim().length < 3) {
          validationErrors.push('Name must be at least 3 characters');
        }
        if (!formData.email || !formData.email.includes('@')) {
          validationErrors.push('Valid email address is required');
        }
        if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
          validationErrors.push('Phone number must have at least 10 digits');
        }
        if (!formData.income) {
          validationErrors.push('Income range is required');
        }
        if (!formData.taxRegime) {
          validationErrors.push('Tax regime preference is required');
        }
        
        if (validationErrors.length > 0) {
          alert(`❌ Validation Errors:\n\n${validationErrors.join('\n')}`);
          return;
        }
        
        const response = await bookTaxConsultation({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          income: formData.income,
          taxRegime: formData.taxRegime
        });
        alert(`✅ Thank you ${formData.name}! Your consultation has been booked successfully.\n\nBooking ID: ${response.id}\n\nOur tax expert will contact you soon at ${formData.email} or ${formData.phone}.`);
        // Reset hero form
        setFormData({
          ...formData,
          name: '',
          email: '',
          phone: '',
          income: '',
          taxRegime: ''
        });
      }
    } catch (error) {
      // Enhanced error handling with specific messages
      const errorMessage = error.message || 'An unexpected error occurred';
      if (errorMessage.includes('PAN') && errorMessage.includes('already exists')) {
        alert(`⚠️ Duplicate Application\n\n${errorMessage}\n\nIf this is your application and you need to update it, please contact our support team.`);
      } else if (errorMessage.includes('Invalid')) {
        alert(`❌ Validation Error\n\n${errorMessage}\n\nPlease check your input and try again.`);
      } else {
        alert(`❌ Submission Failed\n\n${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      }
      console.error('Form submission error:', error);
    }
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // Tax Calculator Functions
  const handleCalculatorChange = (e) => {
    const { name, value } = e.target;
    setTaxCalculator(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  const calculateIncomeTax = (income) => {
    const standardDeduction = 50000;
    const taxableIncome = Math.max(0, income - standardDeduction);
    let tax = 0;

    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 750000) {
      tax = 12500 + (taxableIncome - 500000) * 0.10;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + 25000 + (taxableIncome - 750000) * 0.15;
    } else if (taxableIncome <= 1250000) {
      tax = 12500 + 25000 + 37500 + (taxableIncome - 1000000) * 0.20;
    } else if (taxableIncome <= 1500000) {
      tax = 12500 + 25000 + 37500 + 50000 + (taxableIncome - 1250000) * 0.25;
    } else {
      tax = 12500 + 25000 + 37500 + 50000 + 62500 + (taxableIncome - 1500000) * 0.30;
    }

    // Add cess
    tax = tax * 1.04;

    return Math.round(tax);
  };

  const calculateTaxSavingsHandler = async () => {
    try {
      const response = await calculateTaxSavings({
        grossIncome: taxCalculator.grossIncome,
        section80C: taxCalculator.section80C,
        section80D: taxCalculator.section80D,
        nps80CCD1B: taxCalculator.nps80CCD1B,
        homeLoanInterest: taxCalculator.homeLoanInterest
      });

      setTaxResults({
        grossIncome: response.grossIncome,
        totalDeductions: response.totalDeductions,
        taxableIncome: response.taxableIncome,
        taxWithoutPlanning: response.taxWithoutPlanning,
        taxAfterPlanning: response.taxAfterPlanning,
        totalSavings: response.totalSavings
      });

      alert(`💰 Tax Calculation Completed!\n\nPotential Savings: ₹${response.totalSavings.toLocaleString('en-IN')}\n\nGross Income: ₹${response.grossIncome.toLocaleString('en-IN')}\nTotal Deductions: ₹${response.totalDeductions.toLocaleString('en-IN')}\nTaxable Income: ₹${response.taxableIncome.toLocaleString('en-IN')}\n\nTax without planning: ₹${response.taxWithoutPlanning.toLocaleString('en-IN')}\nTax with planning: ₹${response.taxAfterPlanning.toLocaleString('en-IN')}`);
    } catch (error) {
      alert(`❌ Calculation Error\n\n${error.message}\n\nPlease ensure you've entered valid income and deduction amounts.`);
      console.error('Tax calculation error:', error);
    }
  };

  const faqs = [
    {
      question: "What is personal tax planning and why is it important?",
      answer: "Personal tax planning is the process of strategically managing your finances to minimize tax liability while staying compliant with tax laws. It helps you maximize savings, reduce tax burden legally, and achieve your financial goals more efficiently. Effective tax planning ensures you don't pay more taxes than necessary."
    },
    {
      question: "How can I save tax on my salary income?",
      answer: "You can save tax through various deductions under Section 80C (₹1.5 lakh limit) including EPF, PPF, ELSS, life insurance premiums, home loan principal, and tuition fees. Additionally, claim deductions under 80D for health insurance, 80E for education loan interest, HRA, and standard deduction of ₹50,000. Choosing the right tax regime (old vs new) is also crucial."
    },
    {
      question: "What is the difference between old and new tax regime?",
      answer: "The old tax regime offers lower tax rates but allows numerous deductions and exemptions like 80C, 80D, HRA, etc. The new tax regime has lower tax slabs but doesn't allow most deductions (except standard deduction and employer NPS contribution). Choose based on your investments and expenses - if you have significant investments qualifying for deductions, old regime may benefit you more."
    },
    {
      question: "What are the best tax-saving investment options?",
      answer: "Popular tax-saving investments include ELSS (Equity Linked Savings Scheme) mutual funds with 3-year lock-in, PPF with 15-year tenure and guaranteed returns, NPS (National Pension System) with additional ₹50,000 deduction under 80CCD(1B), life insurance premiums, 5-year tax-saving FDs, and Sukanya Samriddhi Yojana for daughters. Choose based on your risk appetite, liquidity needs, and financial goals."
    },
    {
      question: "When should I start my tax planning?",
      answer: "Tax planning should ideally be done at the beginning of the financial year (April). This gives you sufficient time to make informed investment decisions, spread your investments, and avoid last-minute rush in March. However, it's never too late to start - even mid-year planning can help optimize your tax liability."
    },
    {
      question: "Can tax planning help with retirement goals?",
      answer: "Absolutely! Tax-efficient instruments like NPS, PPF, and EPF not only help save taxes but also build a substantial retirement corpus. NPS offers an additional ₹50,000 deduction under 80CCD(1B) over and above the ₹1.5 lakh limit. Long-term tax planning aligns your retirement goals with tax savings."
    },
    {
      question: "Do I need professional help for tax planning?",
      answer: "While basic tax planning can be done independently, professional tax advisors help optimize complex situations involving multiple income sources, capital gains, property transactions, business income, or international taxation. They ensure you don't miss out on legitimate deductions and stay compliant with evolving tax laws."
    },
    {
      question: "How often should I review my tax plan?",
      answer: "Review your tax plan annually at the beginning of each financial year and whenever there are significant life changes like marriage, childbirth, home purchase, job change, or inheritance. Also review when tax laws change, which typically happens during the Union Budget announcement."
    }
  ];

  const taxServices = [
    {
      icon: "📊",
      title: "Salary Income Tax Planning",
      description: "Strategic planning for salaried individuals to optimize tax deductions, HRA benefits, and maximize take-home salary"
    },
    {
      icon: "📝",
      title: "Personal ITR Filing",
      description: "Accurate preparation and e-filing of individual Income Tax Returns (ITR-1, ITR-2, ITR-3) for all salary and income types"
    },
    {
      icon: "💰",
      title: "Individual Tax-Saving Investments",
      description: "Personalized guidance on tax-efficient investments - ELSS, PPF, NPS, SSY for your family's financial goals"
    },
    {
      icon: "🏠",
      title: "Home Loan Tax Benefits",
      description: "Maximize tax benefits on home loans - Principal under 80C (₹1.5L) and Interest under 24(b) (₹2L)"
    },
    {
      icon: "📈",
      title: "Personal Capital Gains Tax",
      description: "Tax planning for gains from sale of property, stocks, mutual funds, and other personal investments"
    },
    {
      icon: "⏰",
      title: "Individual Advance Tax",
      description: "Calculate and manage advance tax payments for freelancers, consultants, and professionals"
    },
    {
      icon: "🎯",
      title: "Old vs New Regime Analysis",
      description: "Detailed comparison and personalized recommendation to choose the best tax regime for your situation"
    },
    {
      icon: "📄",
      title: "Tax Notice Assistance",
      description: "Professional support in responding to Income Tax notices, queries, and personal tax assessments"
    }
  ];

  const taxSavingInvestments = [
    {
      icon: "📊",
      title: "ELSS Mutual Funds",
      description: "3-year lock-in | Market-linked returns | ₹1.5L limit under 80C",
      potential: "12-15% p.a."
    },
    {
      icon: "🏦",
      title: "Public Provident Fund (PPF)",
      description: "15-year tenure | Guaranteed returns | Triple tax benefits",
      potential: "7.1% p.a."
    },
    {
      icon: "🎯",
      title: "National Pension System",
      description: "Retirement focused | Additional ₹50K under 80CCD(1B)",
      potential: "9-12% p.a."
    },
    {
      icon: "🛡️",
      title: "Life Insurance Premium",
      description: "Risk cover + Tax saving | ₹1.5L limit under 80C",
      potential: "Protection + Tax benefit"
    },
    {
      icon: "🏥",
      title: "Health Insurance",
      description: "₹25K-₹50K under 80D | Family health protection",
      potential: "Health cover + Tax benefit"
    },
    {
      icon: "🏡",
      title: "Home Loan Benefits",
      description: "Principal under 80C | Interest under 24(b)",
      potential: "Up to ₹3.5L deduction"
    }
  ];

  const whyChooseUs = [
    {
      icon: "👨‍💼",
      title: "Personal Tax Experts",
      description: "Certified tax advisors specializing in individual income tax planning for salaried and self-employed"
    },
    {
      icon: "🎯",
      title: "Customized for You",
      description: "Personalized tax strategies based on your salary structure, family size, and personal financial goals"
    },
    {
      icon: "💡",
      title: "Year-Round Support",
      description: "Not just March filing - we provide continuous personal tax guidance throughout the year"
    },
    {
      icon: "🔒",
      title: "100% Legal & Safe",
      description: "All personal tax savings through legitimate deductions - fully compliant with Income Tax Act"
    },
    {
      icon: "💰",
      title: "Maximize Individual Savings",
      description: "Claim every available personal deduction - 80C, 80D, HRA, home loan benefits, and more"
    },
    {
      icon: "📱",
      title: "Digital Convenience",
      description: "Easy online consultation, digital document submission, and e-filing of your ITR from home"
    },
    {
      icon: "⚡",
      title: "Quick ITR Filing",
      description: "Fast and accurate Income Tax Return filing with Form 16 reconciliation and TDS verification"
    },
    {
      icon: "🤝",
      title: "Dedicated Advisor",
      description: "Your personal tax consultant for queries, notices, refund tracking, and tax-related assistance"
    }
  ];

  const taxPlanningSteps = [
    {
      step: "01",
      title: "Personal Assessment",
      description: "We analyze your salary, other income sources, existing investments, family structure, and current tax liability"
    },
    {
      step: "02",
      title: "Customized Strategy",
      description: "Create a personalized tax-saving plan based on your income, family needs, and financial goals"
    },
    {
      step: "03",
      title: "Investment Guidance",
      description: "Help you select and invest in tax-saving instruments (ELSS, PPF, NPS) that suit your risk profile"
    },
    {
      step: "04",
      title: "ITR Filing & Support",
      description: "File your Income Tax Return accurately and provide year-round support for tax-related queries"
    }
  ];

  const deductionsSections = [
    {
      section: "Section 80C",
      limit: "₹1.5 Lakh",
      items: ["EPF/VPF", "PPF", "ELSS", "Life Insurance Premium", "Home Loan Principal", "Children Tuition Fees", "NSC", "5-Year Tax Saver FD", "SSY"]
    },
    {
      section: "Section 80D",
      limit: "₹25K-₹50K",
      items: ["Health Insurance Premium (Self & Family)", "Preventive Health Checkup", "Parents Health Insurance (₹25K)", "Senior Citizen Parents (₹50K)"]
    },
    {
      section: "Other Deductions",
      limit: "Variable",
      items: ["80CCD(1B) - NPS (₹50K)", "80E - Education Loan Interest", "80G - Donations", "24(b) - Home Loan Interest (₹2L)", "Standard Deduction (₹50K)"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-x-hidden">
      {!isPopupMode && <Navbar />}
      
      {/* Hero Section */}
      {!isPopupMode && <section className="relative pt-20 xs:pt-22 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36 pb-6 xs:pb-7 sm:pb-8 md:pb-10 lg:pb-12 min-h-[450px] xs:min-h-[500px] sm:min-h-[550px] md:min-h-[580px] lg:min-h-[600px] bg-cover bg-center bg-no-repeat text-white flex items-center overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'scroll',
          backgroundRepeat: 'no-repeat'
        }}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-700/70 to-blue-800/60"></div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10 items-center">
            <div className="space-y-3 xs:space-y-3.5 sm:space-y-4 md:space-y-5 text-center md:text-left">
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight px-2 xs:px-0">
                Personal Tax Planning Services - Maximize Your Tax Savings
              </h1>
              <p className="text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg text-blue-100 px-2 xs:px-0 leading-relaxed">
                Expert personal tax planning to minimize your individual tax liability. Our certified tax advisors help salaried individuals and professionals optimize their tax savings through smart strategies and legal deductions.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 xs:gap-2.5 sm:gap-3 justify-center md:justify-start pt-1 xs:pt-2 px-2 xs:px-0">
                <button 
                  onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-green-700 px-4 xs:px-5 sm:px-5 md:px-6 lg:px-7 py-2 xs:py-2.5 sm:py-2.5 md:py-3 rounded-lg xs:rounded-xl font-semibold hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 text-xs xs:text-xs sm:text-sm md:text-base touch-manipulation">
                  Get Personal Tax Advice
                </button>
                <Link 
                  to="/contact"
                  className="border-2 border-white text-white px-4 xs:px-5 sm:px-5 md:px-6 lg:px-7 py-2 xs:py-2.5 sm:py-2.5 md:py-3 rounded-lg xs:rounded-xl font-semibold hover:bg-white hover:text-green-700 active:bg-gray-100 transition-all duration-300 text-xs xs:text-xs sm:text-sm md:text-base text-center touch-manipulation active:scale-95">
                  Plan My Taxes
                </Link>
              </div>
            </div>
            
            {/* Contact Form */}
            <div id="apply-form" className="bg-white rounded-lg xs:rounded-xl shadow-2xl p-3 xs:p-3.5 sm:p-4 md:p-5 mt-5 xs:mt-6 md:mt-0 mx-2 xs:mx-0">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 xs:mb-3 sm:mb-4 text-center">
                BOOK FREE TAX CONSULTATION
              </h3>
              <form onSubmit={handleSubmit} className="space-y-1.5 xs:space-y-2 sm:space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                />
                <select
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                >
                  <option value="">Annual Income Range</option>
                  <option value="below-5">Below ₹5 Lakhs</option>
                  <option value="5-10">₹5-10 Lakhs</option>
                  <option value="10-20">₹10-20 Lakhs</option>
                  <option value="20-50">₹20-50 Lakhs</option>
                  <option value="above-50">Above ₹50 Lakhs</option>
                </select>
                <select
                  name="taxRegime"
                  value={formData.taxRegime}
                  onChange={handleInputChange}
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-gray-800 text-xs sm:text-sm"
                  required
                >
                  <option value="">Current Tax Regime</option>
                  <option value="old">Old Tax Regime</option>
                  <option value="new">New Tax Regime</option>
                  <option value="not-sure">Not Sure</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-2.5 md:py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all duration-300 shadow-lg hover:shadow-xl text-xs xs:text-xs sm:text-sm md:text-base touch-manipulation transform active:scale-95"
                >
                  SCHEDULE CONSULTATION
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>}

      {/* What is Tax Planning */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left order-2 md:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800">
                What is Personal Tax Planning?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Personal tax planning is a strategic financial service designed specifically for individuals - salaried employees, self-employed professionals, and freelancers. It involves analyzing your personal income, investments, and expenses to legally minimize your individual tax liability.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                Unlike business tax planning, personal tax planning focuses on maximizing deductions under Section 80C, 80D, HRA claims, home loan benefits, and choosing the right tax regime (old vs new) based on your personal financial situation. It's your roadmap to keeping more of your hard-earned money.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-5 md:p-6 rounded-xl border-l-4 border-green-600">
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                  💡 Personal Tax Planning Fact: Individuals can save ₹50,000 to ₹1,50,000 annually through proper personal tax planning and utilizing all available deductions!
                </p>
              </div>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600" 
                  alt="Tax Planning" 
                  className="rounded-xl shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* Why Tax Planning is Important */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Why Personal Tax Planning is Essential for Individuals
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Smart personal tax planning helps salaried employees and professionals maximize their take-home income
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">💰</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Reduce Individual Tax Burden
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Utilize personal deductions under Section 80C (₹1.5L), 80D (Health Insurance), HRA, and home loan benefits to legally minimize your individual income tax liability.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📈</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Build Personal Wealth
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Personal tax-saving investments like ELSS, PPF, and NPS not only reduce your tax but also create a retirement corpus and wealth for your family's future.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">✅</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Accurate ITR Filing
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Ensure your personal Income Tax Return (ITR) is filed correctly and on time, avoiding notices from the Income Tax Department and potential penalties.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎯</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Personal Financial Goals
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Align your tax savings with personal goals like children's education, home purchase, or retirement planning through strategic tax-efficient investments.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🛡️</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Family Protection
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Combine tax savings with family security through life insurance and health insurance premiums that qualify for deductions under 80C and 80D.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">😌</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Stress-Free Tax Season
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Avoid last-minute March rush and anxiety with year-round personal tax planning. Stay organized with proper documentation and investment proofs.
              </p>
            </div>
          </div>
        </div>
      </section>}

      {/* Our Tax Services */}
      {!isPopupMode && <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Personal Tax Planning Services for Individuals
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Specialized tax advisory services tailored for salaried employees, professionals, and individuals
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {taxServices.map((service, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{service.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {!isPopupMode && (<>
      {/* Tax Saving Investments */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Best Personal Tax-Saving Investment Options
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Smart tax-saving investments for individuals to reduce tax liability and build wealth
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {taxSavingInvestments.map((investment, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{investment.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                  {investment.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  {investment.description}
                </p>
                <div className="bg-gradient-to-r from-green-100 to-blue-100 px-3 py-2 rounded-lg">
                  <p className="text-xs sm:text-sm font-semibold text-green-700">
                    {investment.potential}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <button 
              onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base md:text-lg">
              Get Personal Investment Plan
            </button>
          </div>
        </div>
      </section>
      </>)}

      {!isPopupMode && (<>
      {/* Tax Deductions Guide */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Personal Tax Deductions & Exemptions for Individuals
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              All tax deductions available to salaried employees and individual taxpayers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {deductionsSections.map((section, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-xl border-2 border-green-300"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    {section.section}
                  </h3>
                  <span className="bg-green-600 text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {section.limit}
                  </span>
                </div>
                <ul className="space-y-2 sm:space-y-3">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-700">
                      <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 bg-gradient-to-r from-blue-50 to-green-50 p-4 sm:p-6 md:p-8 rounded-xl border-l-4 border-blue-600">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              💡 Individual Tax Planning Tip: Maximize Personal Deductions
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
              As an individual taxpayer, you can claim up to <strong>₹2,00,000+ in total deductions</strong> annually by strategically combining: Section 80C - ₹1.5L (PPF, ELSS, Life Insurance, Home Loan Principal), Section 80CCD(1B) - ₹50K (NPS additional), Section 80D - ₹25K-₹50K (Health Insurance for self + parents), Home Loan Interest 24(b) - ₹2L, and Standard Deduction - ₹50K. Our personal tax experts help you identify and claim every eligible deduction!
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Our Personal Tax Planning Process
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Simple 4-step process to optimize your individual tax savings
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {taxPlanningSteps.map((step, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative"
              >
                <div className="absolute -top-4 left-4 bg-gradient-to-r from-green-600 to-blue-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg">
                  {step.step}
                </div>
                <div className="mt-6 sm:mt-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Why Choose Us for Personal Tax Planning?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Trusted personal tax advisory services for salaried individuals and professionals
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {whyChooseUs.map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-200"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Old vs New Tax Regime */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 px-2">
              Old vs New Tax Regime: Which is Better for You?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-3">
              Choosing the right tax regime can save you thousands. Let us help you decide:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-green-400">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold mr-3 sm:mr-4">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-800">
                  Old Tax Regime
                </h3>
              </div>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-start">
                  <span className="text-green-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    Access to <strong>all deductions</strong> - 80C, 80D, HRA, LTA, Home Loan Interest
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    <strong>Standard deduction</strong> of ₹50,000 available
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    <strong>Best for:</strong> Salaried employees with home loans, investments in 80C instruments, and high deductions
                  </p>
                </div>
              </div>
              <div className="bg-green-100 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm font-semibold text-green-800">
                  💰 Can save ₹50K-₹1L+ if you have significant deductions
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-blue-400">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold mr-3 sm:mr-4">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800">
                  New Tax Regime
                </h3>
              </div>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex items-start">
                  <span className="text-blue-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    <strong>Lower tax slabs</strong> - Simplified tax structure with reduced rates
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    <strong>Standard deduction</strong> of ₹50,000 + employer NPS contribution allowed
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0 mt-0.5">✓</span>
                  <p className="text-sm sm:text-base text-gray-700">
                    <strong>Best for:</strong> Those with minimal deductions, no home loan, or who prefer simplicity
                  </p>
                </div>
              </div>
              <div className="bg-blue-100 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm font-semibold text-blue-800">
                  💡 Simpler tax filing with no need to track deductions
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12 px-3">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-xl max-w-4xl mx-auto">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                🤔 Confused which regime to choose?
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 sm:mb-6">
                Our tax experts will analyze your income, investments, and deductions to recommend the most tax-efficient regime for your situation. Get personalized guidance now!
              </p>
              <button 
                onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base md:text-lg">
                Compare Regimes for Your Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Required Documents Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Required Documents for Personal Tax Planning
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Keep these documents ready for hassle-free tax planning and ITR filing
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl mr-3">
                  📄
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Identity Proofs</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>PAN Card (mandatory)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Aadhaar Card</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Passport (if applicable)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Voter ID</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl mr-3">
                  💼
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Income Documents</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Form 16 (Salary Income)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Salary Slips (Last 3 months)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Bank Statements (Last 6 months)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Form 26AS (TDS Certificate)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Interest Income Certificates</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl mr-3">
                  📊
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Investment Proofs</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>PPF/EPF Statements</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>LIC/Insurance Premium Receipts</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>ELSS Mutual Fund Statements</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>NSC/Tax Saver FD Receipts</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>NPS Contribution Receipts</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl mr-3">
                  🏥
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Health & Insurance</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Health Insurance Premium Receipts</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Preventive Health Checkup Bills</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Medical Expense Bills</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Parents Health Insurance (80D)</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl mr-3">
                  🏠
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Home Loan & Rent</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Home Loan Interest Certificate</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Home Loan Principal Certificate</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Rent Receipts/Agreement (HRA)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Landlord PAN (for rent &gt;₹1L)</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl mr-3">
                  📚
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Other Documents</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Children Tuition Fee Receipts (80C)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Education Loan Interest Certificate</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Donation Receipts (80G)</span>
                </li>
                <li className="flex items-start text-xs sm:text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>Previous Year ITR Copy</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 bg-gradient-to-r from-green-100 to-blue-100 p-4 sm:p-6 rounded-xl border-l-4 border-green-600">
            <p className="text-sm sm:text-base md:text-lg text-gray-800 text-center">
              <strong>📌 Pro Tip:</strong> Keep digital copies of all documents organized in folders. Our team will guide you on exact document requirements based on your specific situation.
            </p>
          </div>
        </div>
      </section>

      {/* Apply Now Form Section */}
      <section id="calculator" className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Get Expert Tax Planning Consultation
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-3">
              Connect with our tax experts to maximize your savings and optimize your financial strategy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Enter Your Details</h3>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Annual Gross Income (₹)
                  </label>
                  <input
                    type="number"
                    name="grossIncome"
                    value={taxCalculator.grossIncome}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 1000000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Section 80C Investments (₹) - Max ₹1,50,000
                  </label>
                  <input
                    type="number"
                    name="section80C"
                    value={taxCalculator.section80C}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 150000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">PPF, ELSS, Life Insurance, etc.</p>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Section 80D - Health Insurance (₹) - Max ₹50,000
                  </label>
                  <input
                    type="number"
                    name="section80D"
                    value={taxCalculator.section80D}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 25000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    NPS - Section 80CCD(1B) (₹) - Max ₹50,000
                  </label>
                  <input
                    type="number"
                    name="nps80CCD1B"
                    value={taxCalculator.nps80CCD1B}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 50000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Home Loan Interest - 24(b) (₹) - Max ₹2,00,000
                  </label>
                  <input
                    type="number"
                    name="homeLoanInterest"
                    value={taxCalculator.homeLoanInterest}
                    onChange={handleCalculatorChange}
                    placeholder="e.g., 200000"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                  />
                </div>

                <button 
                  onClick={calculateTaxSavingsHandler}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 sm:py-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg text-sm sm:text-base">
                  Calculate Tax Savings
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl border-2 border-green-300">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Your Tax Summary</h3>
              
              <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Gross Annual Income</span>
                    <span className="text-base sm:text-lg font-bold text-gray-800">₹{taxResults.grossIncome.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Total Deductions</span>
                    <span className="text-base sm:text-lg font-bold text-green-600">₹{taxResults.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">Taxable Income</span>
                    <span className="text-base sm:text-lg font-bold text-gray-800">₹{taxResults.taxableIncome.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 sm:p-4 shadow border-2 border-red-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">Tax Without Planning</span>
                    <span className="text-base sm:text-lg font-bold text-red-600">₹{taxResults.taxWithoutPlanning.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 shadow border-2 border-green-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold text-gray-700">Tax After Planning</span>
                    <span className="text-base sm:text-lg font-bold text-green-600">₹{taxResults.taxAfterPlanning.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 sm:p-6 text-center text-white shadow-xl">
                <p className="text-xs sm:text-sm mb-2 opacity-90">Your Total Tax Savings</p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">₹{taxResults.totalSavings.toLocaleString('en-IN')}</p>
                <p className="text-xs sm:text-sm opacity-90">Save up to 30% with proper planning!</p>
              </div>

              <div className="mt-4 sm:mt-6 text-center">
                <button 
                  onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg text-xs sm:text-sm">
                  Get Personalized Tax Plan
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 bg-white p-4 sm:p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center">
              <strong>Note:</strong> This is an indicative calculator. Actual tax savings may vary based on your complete financial profile, additional deductions, and applicable tax regime. Consult our tax experts for accurate personalized planning.
            </p>
          </div>
        </div>
      </section>
      </>)}

      {/* Apply Now Form Section */}
      <section id="apply-form" className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Apply for Personal Tax Planning Service
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-3">
              Fill out the form below and our tax experts will contact you within 24 hours
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 md:p-8 shadow-2xl border-2 border-green-200">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Annual Income Range <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base" 
                    required
                  >
                    <option value="">Select income range</option>
                    <option value="below-5">Below ₹5 Lakhs</option>
                    <option value="5-10">₹5-10 Lakhs</option>
                    <option value="10-20">₹10-20 Lakhs</option>
                    <option value="20-50">₹20-50 Lakhs</option>
                    <option value="above-50">Above ₹50 Lakhs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base" 
                    required
                  >
                    <option value="">Select type</option>
                    <option value="salaried">Salaried Employee</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="business">Business Owner</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Preferred Tax Regime
                </label>
                <select 
                  name="preferredTaxRegime"
                  value={formData.preferredTaxRegime}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                >
                  <option value="">Not sure - Need guidance</option>
                  <option value="not-sure">Not Sure</option>
                  <option value="old">Old Tax Regime</option>
                  <option value="new">New Tax Regime</option>
                </select>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Do you have any investments under Section 80C?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    PPF/EPF
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    ELSS Mutual Funds
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    Life Insurance Premium
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    Home Loan Principal
                  </label>
                  <label className="flex items-center text-xs sm:text-sm text-gray-700">
                    <input type="checkbox" className="mr-2 w-4 h-4 text-green-600" />
                    NPS
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Additional Information / Specific Requirements
                </label>
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about your tax planning needs, financial goals, or any specific questions..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base"
                ></textarea>
              </div>

              <div className="flex items-start">
                <input type="checkbox" className="mr-2 mt-1 w-4 h-4 text-green-600" required />
                <p className="text-xs sm:text-sm text-gray-600">
                  I agree to the Terms & Conditions and authorize the team to contact me via phone, email, or WhatsApp for tax planning services. <span className="text-red-500">*</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Submit Application
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                <strong>Need Help?</strong> Call us at <a href="tel:+919876543210" className="text-green-600 font-semibold hover:underline">6200755759<br/>7393080847</a> or email <a href="mailto:tax@ Cashper.com" className="text-green-600 font-semibold hover:underline">tax@ Cashper.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {!isPopupMode && (
      <>
      {/* FAQ Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-blue-50 to-green-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-3">
              Get answers to common questions about personal tax planning
            </p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg overflow-hidden border border-green-200"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left flex justify-between items-center hover:bg-white/50 transition-colors duration-200"
                >
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 pr-4 sm:pr-6 md:pr-8">
                    {faq.question}
                  </h3>
                  <span className="text-xl sm:text-2xl text-green-600 flex-shrink-0 font-bold">
                    {activeAccordion === index ? '−' : '+'}
                  </span>
                </button>
                {activeAccordion === index && (
                  <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 bg-white/50">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
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
      <section className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2">
              Explore Our Other Services
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-3">
              Complete financial solutions for all your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <Link 
              to="/business-tax-planning"
              className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-200 group">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                Business Tax Planning
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Optimize corporate tax and maximize business profits
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Learn More <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link 
              to="/home-loan"
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-purple-200 group">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
                Home Loan
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Get your dream home with attractive interest rates
              </p>
              <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Apply Now <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link 
              to="/business-loan"
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-orange-200 group">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">
                Business Loan
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Fuel your business growth with quick funding
              </p>
              <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Get Funded <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link 
              to="/health-insurance"
              className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-teal-200 group">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
                Health Insurance
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Protect your health and save tax under 80D
              </p>
              <div className="flex items-center text-teal-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Get Covered <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-r from-green-600 via-green-700 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            Ready to Reduce Your Personal Income Tax?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-blue-100 px-3">
            Get personalized tax planning strategies from our certified experts. Start saving more on your salary income today!
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <button 
              onClick={() => document.getElementById('apply-form').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-green-700 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base md:text-lg">
              Plan My Personal Taxes
            </button>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 text-sm sm:text-base md:text-lg text-center">
              Talk to Tax Expert
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/30">
            <p className="text-xs sm:text-sm md:text-base text-blue-100">
              ✓ Free personal tax consultation • ✓ Individual tax strategies • ✓ Salary tax optimization • ✓ ITR filing included
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

export default Personal_tax_planning;
