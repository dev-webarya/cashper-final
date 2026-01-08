import React, { useState } from 'react';
import { 
  Calculator, 
  X, 
  Home, 
  DollarSign, 
  Briefcase, 
  PieChart, 
  TrendingUp,
  Wallet,
  Clock,
  Percent,
  IndianRupee,
  AlertCircle,
  Target,
  TrendingDown
} from 'lucide-react';

// Mutual Funds Calculator Component
const MutualFundsCalculator = () => {
  const [investmentType, setInvestmentType] = useState('lumpsum');
  const [amount, setAmount] = useState(10000);
  const [sipAmount, setSipAmount] = useState(5000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  // Calculate Returns
  const calculateReturns = () => {
    if (investmentType === 'lumpsum') {
      const futureValue = amount * Math.pow(1 + returnRate / 100, timePeriod);
      return {
        invested: amount,
        returns: Math.round(futureValue - amount),
        futureValue: Math.round(futureValue)
      };
    } else {
      const monthlyRate = returnRate / 12 / 100;
      const months = timePeriod * 12;
      const futureValue = sipAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const invested = sipAmount * months;
      return {
        invested: Math.round(invested),
        returns: Math.round(futureValue - invested),
        futureValue: Math.round(futureValue)
      };
    }
  };

  const results = calculateReturns();

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Calculator Input */}
        <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-white to-green-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-green-600" />
            Investment Details
          </h3>
          
          {/* Investment Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-8">
            <button
              onClick={() => setInvestmentType('lumpsum')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                investmentType === 'lumpsum'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lumpsum
            </button>
            <button
              onClick={() => setInvestmentType('sip')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                investmentType === 'sip'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              SIP
            </button>
          </div>

          {/* Amount Input */}
          {investmentType === 'lumpsum' ? (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-gray-700 font-semibold">Investment Amount</label>
                <span className="text-2xl font-bold text-green-700">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="1000000" 
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((amount - 500) / (1000000 - 500)) * 100}%, #d1fae5 ${((amount - 500) / (1000000 - 500)) * 100}%, #d1fae5 100%)`
                }}
              />
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-gray-700 font-semibold">Monthly SIP Amount</label>
                <span className="text-2xl font-bold text-green-700">₹{sipAmount.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="100000" 
                step="500"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((sipAmount - 500) / (100000 - 500)) * 100}%, #d1fae5 ${((sipAmount - 500) / (100000 - 500)) * 100}%, #d1fae5 100%)`
                }}
              />
            </div>
          )}

          {/* Return Rate */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold">Expected Return (% p.a.)</label>
              <span className="text-2xl font-bold text-green-700">{returnRate}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((returnRate - 1) / (30 - 1)) * 100}%, #d1fae5 ${((returnRate - 1) / (30 - 1)) * 100}%, #d1fae5 100%)`
              }}
            />
          </div>

          {/* Time Period */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold">Time Period</label>
              <span className="text-2xl font-bold text-green-700">{timePeriod} Years</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="40" 
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((timePeriod - 1) / (40 - 1)) * 100}%, #d1fae5 ${((timePeriod - 1) / (40 - 1)) * 100}%, #d1fae5 100%)`
              }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
          <h3 className="text-2xl font-bold mb-8">Investment Summary</h3>
          
          <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
              <div className="text-indigo-100 text-sm mb-2">Total Investment</div>
              <div className="text-4xl font-bold">₹{results.invested.toLocaleString('en-IN')}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-indigo-100 font-medium">Estimated Returns</span>
                <span className="text-xl font-bold">₹{results.returns.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-indigo-100 font-medium">Total Value</span>
                <span className="text-xl font-bold">₹{results.futureValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="text-sm text-indigo-100 mb-3 font-semibold">Investment Distribution</div>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div 
                  className="bg-blue-400 flex items-center justify-center text-xs font-bold"
                  style={{ width: `${(results.invested / results.futureValue) * 100}%` }}
                >
                  {Math.round((results.invested / results.futureValue) * 100)}%
                </div>
                <div 
                  className="bg-green-400 flex items-center justify-center text-xs font-bold"
                  style={{ width: `${(results.returns / results.futureValue) * 100}%` }}
                >
                  {Math.round((results.returns / results.futureValue) * 100)}%
                </div>
              </div>
            </div>

            <div className="bg-yellow-400/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
              <p className="text-sm text-yellow-100">
                <strong>Note:</strong> Returns are indicative and may vary based on market performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Tax Calculator Component
const PersonalTaxCalculator = () => {
  const [taxData, setTaxData] = useState({
    grossIncome: 0,
    section80C: 0,
    section80D: 0,
    nps80CCD1B: 0,
    homeLoanInterest: 0
  });

  const [taxResults, setTaxResults] = useState({
    grossIncome: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    taxWithoutPlanning: 0,
    taxAfterPlanning: 0,
    totalSavings: 0
  });

  const handleTaxChange = (e) => {
    const { name, value } = e.target;
    setTaxData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
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

    tax = tax * 1.04; // Add 4% cess
    return Math.round(tax);
  };

  const calculateTaxSavings = () => {
    const { grossIncome, section80C, section80D, nps80CCD1B, homeLoanInterest } = taxData;
    
    const total80C = Math.min(section80C, 150000);
    const total80D = Math.min(section80D, 50000);
    const totalNPS = Math.min(nps80CCD1B, 50000);
    const totalHomeLoan = Math.min(homeLoanInterest, 200000);
    const totalDeductions = total80C + total80D + totalNPS + totalHomeLoan;

    const taxWithoutPlanning = calculateIncomeTax(grossIncome);
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    const taxAfterPlanning = calculateIncomeTax(taxableIncome);
    const totalSavings = taxWithoutPlanning - taxAfterPlanning;

    setTaxResults({
      grossIncome,
      totalDeductions,
      taxableIncome,
      taxWithoutPlanning,
      taxAfterPlanning,
      totalSavings
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Enter Your Details</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Annual Gross Income (₹)
            </label>
            <input
              type="number"
              name="grossIncome"
              value={taxData.grossIncome || ''}
              onChange={handleTaxChange}
              placeholder="e.g., 1000000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section 80C Investments (₹) - Max ₹1,50,000
            </label>
            <input
              type="number"
              name="section80C"
              value={taxData.section80C || ''}
              onChange={handleTaxChange}
              placeholder="e.g., 150000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">PPF, ELSS, Life Insurance, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Section 80D - Health Insurance (₹) - Max ₹50,000
            </label>
            <input
              type="number"
              name="section80D"
              value={taxData.section80D || ''}
              onChange={handleTaxChange}
              placeholder="e.g., 25000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NPS - Section 80CCD(1B) (₹) - Max ₹50,000
            </label>
            <input
              type="number"
              name="nps80CCD1B"
              value={taxData.nps80CCD1B || ''}
              onChange={handleTaxChange}
              placeholder="e.g., 50000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Home Loan Interest - 24(b) (₹) - Max ₹2,00,000
            </label>
            <input
              type="number"
              name="homeLoanInterest"
              value={taxData.homeLoanInterest || ''}
              onChange={handleTaxChange}
              placeholder="e.g., 200000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <button 
            onClick={calculateTaxSavings}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg">
            Calculate Tax Savings
          </button>
        </div>
      </div>
      {/* Results Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg border-2 border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Your Tax Summary</h3>
        
        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Annual Income</span>
              <span className="text-lg font-bold text-gray-800">₹{taxResults.grossIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Deductions</span>
              <span className="text-lg font-bold text-green-600">₹{taxResults.totalDeductions.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxable Income</span>
              <span className="text-lg font-bold text-gray-800">₹{taxResults.taxableIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 shadow border-2 border-red-300">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Tax Without Planning</span>
              <span className="text-lg font-bold text-red-600">₹{taxResults.taxWithoutPlanning.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 shadow border-2 border-green-400">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Tax After Planning</span>
              <span className="text-lg font-bold text-green-600">₹{taxResults.taxAfterPlanning.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-center text-white shadow-xl">
          <p className="text-sm mb-2 opacity-90">Your Total Tax Savings</p>
          <p className="text-5xl font-bold mb-2">₹{taxResults.totalSavings.toLocaleString('en-IN')}</p>
          <p className="text-sm opacity-90">Save up to 30% with proper planning!</p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Indicative calculator. Consult tax experts for personalized planning.
          </p>
        </div>
      </div>
    </div>
  );
};

// Business Tax Calculator Component
const BusinessTaxCalculator = () => {
  const [businessData, setBusinessData] = useState({
    businessType: 'private',
    annualProfit: 0,
    depreciation: 0,
    salaryExpenses: 0,
    rdExpenses: 0
  });

  const [businessResults, setBusinessResults] = useState({
    profit: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    taxWithoutPlanning: 0,
    taxAfterPlanning: 0,
    totalSavings: 0
  });

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: name === 'businessType' ? value : (parseFloat(value) || 0)
    }));
  };

  const calculateCorporateTax = (income, businessType) => {
    let taxRate = 0.30; // Default 30%
    
    if (businessType === 'private' || businessType === 'startup') {
      taxRate = 0.25; // 25% for certain companies
    }
    
    let tax = income * taxRate;
    tax = tax * 1.04; // Add 4% cess
    
    return Math.round(tax);
  };

  const calculateBusinessTax = () => {
    const { annualProfit, depreciation, salaryExpenses, rdExpenses, businessType } = businessData;
    
    // Calculate R&D weighted deduction (150%)
    const rdDeduction = rdExpenses * 1.5;
    const totalDeductions = depreciation + salaryExpenses + rdDeduction;
    
    const taxWithoutPlanning = calculateCorporateTax(annualProfit, businessType);
    const taxableIncome = Math.max(0, annualProfit - totalDeductions);
    const taxAfterPlanning = calculateCorporateTax(taxableIncome, businessType);
    const totalSavings = taxWithoutPlanning - taxAfterPlanning;

    setBusinessResults({
      profit: annualProfit,
      totalDeductions,
      taxableIncome,
      taxWithoutPlanning,
      taxAfterPlanning,
      totalSavings
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Business Details</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Type
            </label>
            <select 
              name="businessType"
              value={businessData.businessType}
              onChange={handleBusinessChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none">
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership/LLP</option>
              <option value="private">Private Limited</option>
              <option value="public">Public Limited</option>
              <option value="startup">Startup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Annual Business Profit (₹)
            </label>
            <input
              type="number"
              name="annualProfit"
              value={businessData.annualProfit || ''}
              onChange={handleBusinessChange}
              placeholder="e.g., 2000000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Depreciation on Assets (₹)
            </label>
            <input
              type="number"
              name="depreciation"
              value={businessData.depreciation || ''}
              onChange={handleBusinessChange}
              placeholder="e.g., 200000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">Plant, machinery, vehicles, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employee Salary Expenses (₹/year)
            </label>
            <input
              type="number"
              name="salaryExpenses"
              value={businessData.salaryExpenses || ''}
              onChange={handleBusinessChange}
              placeholder="e.g., 500000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              R&D Expenses - Section 35 (₹)
            </label>
            <input
              type="number"
              name="rdExpenses"
              value={businessData.rdExpenses || ''}
              onChange={handleBusinessChange}
              placeholder="e.g., 100000"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">150% weighted deduction available</p>
          </div>

          <button 
            onClick={calculateBusinessTax}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg">
            Calculate Business Tax
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg border-2 border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Tax Analysis</h3>
        
        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Net Business Profit</span>
              <span className="text-lg font-bold text-gray-800">₹{businessResults.profit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Deductions</span>
              <span className="text-lg font-bold text-green-600">₹{businessResults.totalDeductions.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxable Income</span>
              <span className="text-lg font-bold text-gray-800">₹{businessResults.taxableIncome.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 shadow border-2 border-red-300">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Tax Without Planning</span>
              <span className="text-lg font-bold text-red-600">₹{businessResults.taxWithoutPlanning.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 shadow border-2 border-green-400">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Tax After Planning</span>
              <span className="text-lg font-bold text-green-600">₹{businessResults.taxAfterPlanning.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-center text-white shadow-xl">
          <p className="text-sm mb-2 opacity-90">Your Potential Tax Savings</p>
          <p className="text-5xl font-bold mb-2">₹{businessResults.totalSavings.toLocaleString('en-IN')}</p>
          <p className="text-sm opacity-90">Save 15-30% with expert planning!</p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            <strong>Disclaimer:</strong> Indicative estimates. Consult experts for accurate planning.
          </p>
        </div>
      </div>
    </div>
  );
};

// SIP Calculator Component  
const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  // Calculate SIP Returns
  const monthlyRate = expectedReturn / 12 / 100;
  const months = timePeriod * 12;
  const futureValue = Math.round(monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  const invested = monthlyInvestment * months;
  const returns = futureValue - invested;

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Calculator Input */}
        <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-white to-green-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-green-600" />
            SIP Details
          </h3>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold">Monthly Investment</label>
              <span className="text-2xl font-bold text-green-700">₹{monthlyInvestment.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="100000" 
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((monthlyInvestment - 500) / (100000 - 500)) * 100}%, #d1fae5 ${((monthlyInvestment - 500) / (100000 - 500)) * 100}%, #d1fae5 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>₹500</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold">Expected Return (% p.a.)</label>
              <span className="text-2xl font-bold text-green-700">{expectedReturn}%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((expectedReturn - 1) / (30 - 1)) * 100}%, #d1fae5 ${((expectedReturn - 1) / (30 - 1)) * 100}%, #d1fae5 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold">Time Period</label>
              <span className="text-2xl font-bold text-pink-700">{timePeriod} Years</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="40" 
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((timePeriod - 1) / (40 - 1)) * 100}%, #fce7f3 ${((timePeriod - 1) / (40 - 1)) * 100}%, #fce7f3 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>1 Year</span>
              <span>40 Years</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
          <h3 className="text-2xl font-bold mb-8">Investment Summary</h3>
          
          <div className="space-y-6">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30">
              <div className="text-green-100 text-sm mb-2">Total Investment</div>
              <div className="text-4xl font-bold">₹{invested.toLocaleString('en-IN')}</div>
              <div className="text-xs text-green-100 mt-2">
                ₹{monthlyInvestment.toLocaleString('en-IN')} × {months} months
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-green-100 font-medium">Estimated Returns</span>
                <span className="text-xl font-bold">₹{returns.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-green-100 font-medium">Total Value</span>
                <span className="text-xl font-bold">₹{futureValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="text-sm text-green-100 mb-3 font-semibold">Wealth Growth</div>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div 
                  className="bg-blue-400 flex items-center justify-center text-xs font-bold"
                  style={{ width: `${(invested / futureValue) * 100}%` }}
                >
                  {Math.round((invested / futureValue) * 100)}%
                </div>
                <div 
                  className="bg-green-400 flex items-center justify-center text-xs font-bold"
                  style={{ width: `${(returns / futureValue) * 100}%` }}
                >
                  {Math.round((returns / futureValue) * 100)}%
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-green-100">
                <span>Investment</span>
                <span>Returns</span>
              </div>
            </div>

            <div className="bg-yellow-400/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
              <p className="text-sm text-yellow-100">
                <strong>Note:</strong> Returns are based on assumed rate. Actual may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// EMI Calculator Component
const EMICalculator = ({ type = 'personal' }) => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanTenure, setLoanTenure] = useState(36);
  const [interestRate, setInterestRate] = useState(12);

  // Calculate EMI
  const rate = interestRate / 12 / 100;
  const emi = Math.round((loanAmount * rate * Math.pow(1 + rate, loanTenure)) / (Math.pow(1 + rate, loanTenure) - 1));
  const totalPayment = Math.round(emi * loanTenure);
  const totalInterest = Math.round(totalPayment - loanAmount);

  const titles = {
    personal: 'Personal Loan',
    home: 'Home Loan',
    business: 'Business Loan'
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Calculator Input */}
        <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-white to-green-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-green-600" />
            Loan Details
          </h3>
          
          {/* Loan Amount */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-green-600" />
                Loan Amount
              </label>
              <span className="text-2xl font-bold text-green-700">₹{loanAmount.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="50000" 
              max="2500000" 
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-green-200 to-green-400 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #16a34a ${((loanAmount - 50000) / (2500000 - 50000)) * 100}%, #d1fae5 ${((loanAmount - 50000) / (2500000 - 50000)) * 100}%, #d1fae5 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span className="font-medium">₹50K</span>
              <span className="font-medium">₹25L</span>
            </div>
          </div>

          {/* Loan Tenure */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Loan Tenure
              </label>
              <span className="text-2xl font-bold text-green-700">{loanTenure} Months ({Math.round(loanTenure/12)} Years)</span>
            </div>
            <input 
              type="range" 
              min="12" 
              max="60" 
              step="6"
              value={loanTenure}
              onChange={(e) => setLoanTenure(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((loanTenure - 12) / (60 - 12)) * 100}%, #dbeafe ${((loanTenure - 12) / (60 - 12)) * 100}%, #dbeafe 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span className="font-medium">1 Year</span>
              <span className="font-medium">5 Years</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-700 font-semibold flex items-center gap-2">
                <Percent className="w-4 h-4 text-green-600" />
                Interest Rate (p.a.)
              </label>
              <span className="text-2xl font-bold text-green-700">{interestRate}%</span>
            </div>
            <input 
              type="range" 
              min="10.5" 
              max="24" 
              step="0.5"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-orange-200 to-orange-400 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ea580c 0%, #ea580c ${((interestRate - 10.5) / (24 - 10.5)) * 100}%, #fed7aa ${((interestRate - 10.5) / (24 - 10.5)) * 100}%, #fed7aa 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span className="font-medium">10.5%</span>
              <span className="font-medium">24%</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => { setLoanAmount(200000); setLoanTenure(24); setInterestRate(12); }}
              className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              ₹2L/2Y
            </button>
            <button
              type="button"
              onClick={() => { setLoanAmount(500000); setLoanTenure(36); setInterestRate(12); }}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              ₹5L/3Y
            </button>
            <button
              type="button"
              onClick={() => { setLoanAmount(1000000); setLoanTenure(48); setInterestRate(11); }}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            >
              ₹10L/4Y
            </button>
          </div>
        </div>

        {/* Calculator Results */}
        <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Your EMI Breakdown
            </h3>
            
            <div className="space-y-6">
              {/* Monthly EMI */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border-2 border-white/30 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100 text-sm font-medium">Monthly EMI</span>
                  <IndianRupee className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white">₹{emi.toLocaleString('en-IN')}</div>
                <div className="mt-2 text-green-100 text-sm">Pay this amount every month</div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-green-100 font-medium">Principal Amount</span>
                    </div>
                    <span className="text-xl font-bold">₹{loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span className="text-green-100 font-medium">Total Interest</span>
                    </div>
                    <span className="text-xl font-bold">₹{totalInterest.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-green-100 font-medium">Total Payment</span>
                    </div>
                    <span className="text-xl font-bold">₹{totalPayment.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="text-sm text-green-100 mb-3 font-semibold">Payment Distribution</div>
                <div className="flex h-8 rounded-lg overflow-hidden shadow-lg">
                  <div 
                    className="bg-blue-400 flex items-center justify-center text-xs font-bold text-white"
                    style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                  >
                    {Math.round((loanAmount / totalPayment) * 100)}%
                  </div>
                  <div 
                    className="bg-orange-400 flex items-center justify-center text-xs font-bold text-white"
                    style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                  >
                    {Math.round((totalInterest / totalPayment) * 100)}%
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-green-100">
                  <span>Principal</span>
                  <span>Interest</span>
                </div>
              </div>

              {/* Note */}
              <div className="bg-yellow-400/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-100">
                    <strong className="text-white">Note:</strong> Interest rates vary based on credit score and income. Processing fee: 1-2% of loan amount.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalculatorManagement = () => {
  const [selectedCalculator, setSelectedCalculator] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const calculators = [
    {
      id: 'personal-loan',
      name: 'Personal Loan EMI',
      description: 'Calculate Your Monthly EMI - Plan your finances better with our advanced loan calculator',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-500',
      type: 'personal'
    },
    {
      id: 'home-loan',
      name: 'Home Loan EMI',
      description: 'Calculate Your Monthly EMI - Plan your finances better with our advanced loan calculator',
      icon: <Home className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-500',
      type: 'home'
    },
    {
      id: 'business-loan',
      name: 'Business Loan EMI',
      description: 'Calculate Your Monthly EMI - Plan your finances better with our advanced loan calculator',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-500',
      type: 'business'
    },
    {
      id: 'mutual-funds',
      name: 'Mutual Fund Calculator',
      description: 'Calculate your potential returns from lumpsum or SIP investments',
      icon: <PieChart className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-500',
      type: 'mutual-funds'
    },
    {
      id: 'sip',
      name: 'SIP Calculator',
      description: 'SIP Calculator - Calculate Your Returns',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      hoverBorder: 'hover:border-pink-500',
      type: 'sip'
    },
    {
      id: 'personal-tax',
      name: 'Personal Tax Planning',
      description: 'Calculate income tax savings with deductions',
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverBorder: 'hover:border-yellow-500',
      type: 'personal-tax'
    },
    {
      id: 'business-tax',
      name: 'Business Tax Calculator',
      description: 'Calculate business tax savings with planning',
      icon: <Calculator className="w-6 h-6" />,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-500',
      type: 'business-tax'
    }
  ];
  const handleCalculatorClick = (calculator) => {
    if (calculator.comingSoon) {
      alert('This calculator is coming soon! Stay tuned.');
      return;
    }
    setSelectedCalculator(calculator);
    setShowCalculator(true);
  };

  const handleCloseCalculator = () => {
    setShowCalculator(false);
    setSelectedCalculator(null);
  };
  return (
    <div className="space-y-6">
      {/* Show calculator grid when no calculator is selected */}
      {!showCalculator && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Calculator className="w-7 h-7 text-green-600" />
                Financial Calculators
              </h1>
              <p className="text-gray-600 mt-1">Plan your finances with our smart calculators</p>
            </div>
          </div>
          {/* Calculators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {calculators.map((calculator) => (
              <button
                key={calculator.id}
                onClick={() => handleCalculatorClick(calculator)}
                className={`group flex flex-col items-start p-5 md:p-6 ${calculator.bgColor} border-2 ${calculator.borderColor} ${calculator.hoverBorder} rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 text-left`}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${calculator.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                  {calculator.icon}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                  {calculator.name}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4">
                  {calculator.description}
                </p>
                <div className="mt-auto w-full">
                  <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 rounded-lg text-xs font-semibold group-hover:from-green-600 group-hover:to-green-700 group-hover:text-white transition-all text-center">
                    Calculate Now
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      {/* Show selected calculator */}
      {showCalculator && selectedCalculator && (
        <div className="calculator-section">
          {/* Header */}
          <div className={`bg-gradient-to-r ${selectedCalculator.color} text-white px-4 sm:px-6 py-4 rounded-xl mb-6 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  {selectedCalculator.icon}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">
                    {selectedCalculator.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 mt-1">{selectedCalculator.description}</p>
                </div>
              </div>
              <button
                onClick={handleCloseCalculator}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                aria-label="Close calculator"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
          {/* Calculator Content */}
          {selectedCalculator.type === 'personal' ? (
            <EMICalculator type="personal" />
          ) : selectedCalculator.type === 'home' ? (
            <EMICalculator type="home" />
          ) : selectedCalculator.type === 'business' ? (
            <EMICalculator type="business" />
          ) : selectedCalculator.type === 'mutual-funds' ? (
            <MutualFundsCalculator />
          ) : selectedCalculator.type === 'sip' ? (
            <SIPCalculator />
          ) : selectedCalculator.type === 'personal-tax' ? (
            <PersonalTaxCalculator />
          ) : selectedCalculator.type === 'business-tax' ? (
            <BusinessTaxCalculator />
          ) : null}
          {/* Back Button */}
          <div className="mt-6">
            <button
              onClick={handleCloseCalculator}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Calculators
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default CalculatorManagement;
