import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animateCharts, setAnimateCharts] = useState(false);
  const [downloadingReports, setDownloadingReports] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  // State for API data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loanDistribution, setLoanDistribution] = useState(null);
  const [insuranceDistribution, setInsuranceDistribution] = useState(null);
  const [investmentOverview, setInvestmentOverview] = useState(null);
  const [taxPlanning, setTaxPlanning] = useState(null);
  const [reportCategories, setReportCategories] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fallback data for different date ranges (in case API is down)
  const dataByRange = {
    '7days': {
      revenue: [
        { month: 'Mon', value: 85, label: '₹8.5 Cr' },
        { month: 'Tue', value: 78, label: '₹7.8 Cr' },
        { month: 'Wed', value: 92, label: '₹9.2 Cr' },
        { month: 'Thu', value: 88, label: '₹8.8 Cr' },
        { month: 'Fri', value: 95, label: '₹9.5 Cr' },
        { month: 'Sat', value: 70, label: '₹7.0 Cr' },
        { month: 'Sun', value: 65, label: '₹6.5 Cr' }
      ],
      metrics: {
        totalRevenue: '₹57.3 Cr',
        totalDisbursements: '₹42.8 Cr',
        activeCustomers: '8,234',
        avgTicketSize: '₹2.9 L',
        revenueChange: '+18.5%',
        disbursementChange: '+15.2%',
        customerChange: '+8.7%',
        ticketChange: '+3.8%'
      },
      products: [
        { name: 'Short-Term Loan', value: 25, color: '#16a34a', percentage: '25%' },
        { name: 'Personal Loan', value: 30, color: '#2563eb', percentage: '30%' },
        { name: 'Home Loan', value: 28, color: '#7c3aed', percentage: '28%' },
        { name: 'Business Loan', value: 17, color: '#f59e0b', percentage: '17%' }
      ]
    },
    '30days': {
      revenue: [
        { month: 'Week 1', value: 75, label: '₹22.5 Cr' },
        { month: 'Week 2', value: 82, label: '₹24.6 Cr' },
        { month: 'Week 3', value: 88, label: '₹26.4 Cr' },
        { month: 'Week 4', value: 95, label: '₹28.5 Cr' }
      ],
      metrics: {
        totalRevenue: '₹102 Cr',
        totalDisbursements: '₹76 Cr',
        activeCustomers: '10,567',
        avgTicketSize: '₹3.0 L',
        revenueChange: '+20.3%',
        disbursementChange: '+17.8%',
        customerChange: '+10.5%',
        ticketChange: '+4.2%'
      },
      products: [
        { name: 'Short-Term Loan', value: 24, color: '#16a34a', percentage: '24%' },
        { name: 'Personal Loan', value: 32, color: '#2563eb', percentage: '32%' },
        { name: 'Home Loan', value: 27, color: '#7c3aed', percentage: '27%' },
        { name: 'Business Loan', value: 17, color: '#f59e0b', percentage: '17%' }
      ]
    },
    '90days': {
      revenue: [
        { month: 'Month 1', value: 70, label: '₹70 Cr' },
        { month: 'Month 2', value: 82, label: '₹82 Cr' },
        { month: 'Month 3', value: 95, label: '₹95 Cr' }
      ],
      metrics: {
        totalRevenue: '₹247 Cr',
        totalDisbursements: '₹184 Cr',
        activeCustomers: '11,890',
        avgTicketSize: '₹3.1 L',
        revenueChange: '+21.5%',
        disbursementChange: '+18.9%',
        customerChange: '+11.8%',
        ticketChange: '+4.8%'
      },
      products: [
        { name: 'Short-Term Loan', value: 23, color: '#16a34a', percentage: '23%' },
        { name: 'Personal Loan', value: 33, color: '#2563eb', percentage: '33%' },
        { name: 'Home Loan', value: 28, color: '#7c3aed', percentage: '28%' },
        { name: 'Business Loan', value: 16, color: '#f59e0b', percentage: '16%' }
      ]
    },
    '1year': {
      revenue: [
        { month: 'Jan', value: 45, label: '₹45 Cr' },
        { month: 'Feb', value: 52, label: '₹52 Cr' },
        { month: 'Mar', value: 48, label: '₹48 Cr' },
        { month: 'Apr', value: 61, label: '₹61 Cr' },
        { month: 'May', value: 55, label: '₹55 Cr' },
        { month: 'Jun', value: 67, label: '₹67 Cr' },
        { month: 'Jul', value: 73, label: '₹73 Cr' },
        { month: 'Aug', value: 70, label: '₹70 Cr' },
        { month: 'Sep', value: 82, label: '₹82 Cr' },
        { month: 'Oct', value: 88, label: '₹88 Cr' },
        { month: 'Nov', value: 95, label: '₹95 Cr' },
        { month: 'Dec', value: 100, label: '₹100 Cr' }
      ],
      metrics: {
        totalRevenue: '₹836 Cr',
        totalDisbursements: '₹624 Cr',
        activeCustomers: '12,345',
        avgTicketSize: '₹3.2 L',
        revenueChange: '+22.8%',
        disbursementChange: '+18.5%',
        customerChange: '+12.3%',
        ticketChange: '+5.2%'
      },
      products: [
        { name: 'Short-Term Loan', value: 22, color: '#16a34a', percentage: '22%' },
        { name: 'Personal Loan', value: 34, color: '#2563eb', percentage: '34%' },
        { name: 'Home Loan', value: 29, color: '#7c3aed', percentage: '29%' },
        { name: 'Business Loan', value: 15, color: '#f59e0b', percentage: '15%' }
      ]
    },
    'custom': {
      revenue: [
        { month: 'Period 1', value: 60, label: '₹60 Cr' },
        { month: 'Period 2', value: 75, label: '₹75 Cr' },
        { month: 'Period 3', value: 85, label: '₹85 Cr' },
        { month: 'Period 4', value: 90, label: '₹90 Cr' }
      ],
      metrics: {
        totalRevenue: '₹310 Cr',
        totalDisbursements: '₹232 Cr',
        activeCustomers: '11,200',
        avgTicketSize: '₹3.0 L',
        revenueChange: '+19.5%',
        disbursementChange: '+16.8%',
        customerChange: '+10.2%',
        ticketChange: '+4.5%'
      },
      products: [
        { name: 'Short-Term Loan', value: 24, color: '#16a34a', percentage: '24%' },
        { name: 'Personal Loan', value: 31, color: '#2563eb', percentage: '31%' },
        { name: 'Home Loan', value: 27, color: '#7c3aed', percentage: '27%' },
        { name: 'Business Loan', value: 18, color: '#f59e0b', percentage: '18%' }
      ]
    }
  };

  useEffect(() => {
    setAnimateCharts(false);
    setTimeout(() => setAnimateCharts(true), 100);
  }, [dateRange]);

  // Fetch analytics data from API with authentication and auto-refresh
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token') || '';
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      try {
        const [analyticsRes, loanRes, insuranceRes, investmentRes, taxRes, categoriesRes, reportsRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/admin/reports/analytics?dateRange=${dateRange}`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/loan-distribution`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/insurance-distribution`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/investment-overview`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/tax-planning-overview`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/categories`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/reports/recent`, { headers })
        ]);

        // Process Analytics Data
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json();
          // Handle both nested (data.data) and direct response formats
          const analyticsContent = data.data || data;
          setAnalyticsData({
            revenue: analyticsContent.revenue || dataByRange[dateRange].revenue,
            metrics: analyticsContent.metrics || dataByRange[dateRange].metrics,
            products: analyticsContent.products || dataByRange[dateRange].products
          });
        } else {
          setAnalyticsData(dataByRange[dateRange]);
        }

        // Process Loan Distribution
        if (loanRes.status === 'fulfilled' && loanRes.value.ok) {
          const data = await loanRes.value.json();
          setLoanDistribution(data);
        }

        // Process Insurance Distribution
        if (insuranceRes.status === 'fulfilled' && insuranceRes.value.ok) {
          const data = await insuranceRes.value.json();
          setInsuranceDistribution(data);
        }

        // Process Investment Overview
        if (investmentRes.status === 'fulfilled' && investmentRes.value.ok) {
          const data = await investmentRes.value.json();
          setInvestmentOverview(data);
        }

        // Process Tax Planning Overview
        if (taxRes.status === 'fulfilled' && taxRes.value.ok) {
          const data = await taxRes.value.json();
          setTaxPlanning(data);
        }

        // Process Report Categories
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.ok) {
          const data = await categoriesRes.value.json();
          setReportCategories(data.categories || []);
        }

        // Process Recent Reports
        if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
          const data = await reportsRes.value.json();
          setRecentReports(data.reports || []);
        }

        setLastRefreshTime(new Date());
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Using cached data.');
        setAnalyticsData(dataByRange[dateRange]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalyticsData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [dateRange, refreshInterval]);

  const handleExportAll = () => {
    setIsExporting(true);
    setTimeout(() => {
      downloadCSV();
      setIsExporting(false);
    }, 1000);
  };
  const downloadCSV = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSVContent = () => {
    if (!analyticsData || !loanDistribution) {
      return 'Date,Metric,Value\n' + new Date().toISOString() + ',Status,No data available';
    }

    const headers = ['Metric', 'Value'];
    const rows = [
      ['Generated', new Date().toLocaleString()],
      ['Date Range', dateRange],
      [],
      ['ANALYTICS METRICS', ''],
      ['Total Revenue', analyticsData?.metrics?.totalRevenue || 'N/A'],
      ['Total Disbursements', analyticsData?.metrics?.totalDisbursements || 'N/A'],
      ['Active Customers', analyticsData?.metrics?.activeCustomers || 'N/A'],
      ['Average Ticket Size', analyticsData?.metrics?.avgTicketSize || 'N/A'],
      [],
      ['LOAN DISTRIBUTION', '']
    ];

    if (loanDistribution?.loans) {
      loanDistribution.loans.forEach(loan => {
        rows.push([loan.type, `${loan.percentage}% (${loan.amount})`]);
      });
      rows.push(['Total Disbursed', loanDistribution.totalDisbursed || 'N/A']);
    }

    rows.push([], ['INSURANCE DISTRIBUTION', '']);

    if (insuranceDistribution?.insurance) {
      insuranceDistribution.insurance.forEach(ins => {
        rows.push([`${ins.type} Insurance`, `${ins.percentage}% (${ins.count} policies)`]);
      });
      rows.push(['Total Policies', insuranceDistribution.totalPolicies || 'N/A']);
    }

    const csvArray = [headers, ...rows];
    return csvArray.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const generatePDFContent = (reportName) => {
    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${reportName} Report`, margin, yPosition);
    yPosition += lineHeight + 5;

    // Generated time
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    doc.text(`Period: ${dateRange}`, pageWidth - margin - 50, yPosition);
    yPosition += lineHeight + 10;

    // Metrics section
    if (analyticsData?.metrics) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Key Metrics', margin, yPosition);
      yPosition += lineHeight + 3;

      doc.setFontSize(10);
      const metrics = [
        ['Total Revenue', analyticsData.metrics.totalRevenue],
        ['Total Disbursements', analyticsData.metrics.totalDisbursements],
        ['Active Customers', analyticsData.metrics.activeCustomers],
        ['Average Ticket Size', analyticsData.metrics.avgTicketSize]
      ];

      metrics.forEach(([label, value]) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(`${label}: ${value}`, margin + 5, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 5;
    }

    // Loan Distribution
    if (loanDistribution?.loans) {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Loan Distribution', margin, yPosition);
      yPosition += lineHeight + 3;

      doc.setFontSize(10);
      loanDistribution.loans.forEach(loan => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(`${loan.type}: ${loan.percentage}% (${loan.amount})`, margin + 5, yPosition);
        yPosition += lineHeight;
      });

      doc.text(`Total Disbursed: ${loanDistribution.totalDisbursed}`, margin + 5, yPosition);
      yPosition += lineHeight + 5;
    }

    // Insurance Distribution
    if (insuranceDistribution?.insurance) {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Insurance Distribution', margin, yPosition);
      yPosition += lineHeight + 3;

      doc.setFontSize(10);
      insuranceDistribution.insurance.forEach(ins => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(`${ins.type}: ${ins.percentage}% (${ins.count} policies)`, margin + 5, yPosition);
        yPosition += lineHeight;
      });

      doc.text(`Total Policies: ${insuranceDistribution.totalPolicies}`, margin + 5, yPosition);
    }

    return doc;
  };

  const downloadFile = (reportName, format = 'pdf') => {
    let fileName = reportName.replace(/\s+/g, '_').toLowerCase();
    
    if (format === 'csv') {
      const content = generateCSVContent();
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`${reportName} downloaded as CSV successfully! ✅`);
    } else if (format === 'pdf') {
      const doc = generatePDFContent(reportName);
      doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
      alert(`${reportName} downloaded as PDF successfully! ✅`);
    } else if (format === 'excel') {
      const content = generateCSVContent();
      const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert(`${reportName} downloaded as Excel successfully! ✅`);
    }
  };

  const handleViewReport = (reportName) => {
    alert(`Viewing: ${reportName}`);
  };

  const handleDownloadReport = (reportName) => {
    // Show format selection modal or download as PDF by default
    downloadFile(reportName, 'pdf');
  };

  const handleGenerateReport = (reportName) => {
    setIsGenerating(true);
    setSelectedReport(reportName);

    // Call the generate report API
    fetch(`${API_BASE_URL}/api/admin/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reportName: reportName,
        dateRange: dateRange,
        format: 'pdf'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          alert(`Report "${reportName}" generated successfully! ✅`);
          downloadFile(reportName, 'pdf');
        } else {
          alert(`Failed to generate report: ${data.message}`);
        }
      })
      .catch(err => {
        console.error('Error generating report:', err);
        alert('Error generating report');
      })
      .finally(() => {
        setIsGenerating(false);
        setSelectedReport(null);
      });
  };

  // Use API data or fallback to defaults
  const currentData = analyticsData || (dataByRange[dateRange] || dataByRange['30days']);
  const revenueData = currentData?.revenue || [];
  const productData = currentData?.products || [];
  const metricsData = currentData?.metrics || {};

  const keyMetrics = [
    { label: 'Total Revenue', value: metricsData.totalRevenue || '₹102 Cr', change: metricsData.revenueChange || '+20.3%', trend: 'up', color: 'green' },
    { label: 'Total Disbursements', value: metricsData.totalDisbursements || '₹76 Cr', change: metricsData.disbursementChange || '+17.8%', trend: 'up', color: 'blue' },
    { label: 'Active Customers', value: metricsData.activeCustomers || '10,567', change: metricsData.customerChange || '+10.5%', trend: 'up', color: 'indigo' },
    { label: 'Average Ticket Size', value: metricsData.avgTicketSize || '₹3.0 L', change: metricsData.ticketChange || '+4.2%', trend: 'up', color: 'purple' }
  ];

  // Format loan distribution data for display
  const displayLoanData = loanDistribution?.loans || [
    { type: 'Short-Term Loan', percentage: 23, amount: '₹10.4Cr', color: 'bg-green-500' },
    { type: 'Personal Loan', percentage: 34, amount: '₹15.3Cr', color: 'bg-blue-500' },
    { type: 'Home Loan', percentage: 29, amount: '₹13.1Cr', color: 'bg-purple-500' },
    { type: 'Business Loan', percentage: 14, amount: '₹6.3Cr', color: 'bg-yellow-500' }
  ];

  const displayInsuranceData = insuranceDistribution?.insurance || [
    { type: 'Health', count: 5200, percentage: 45, color: '#10b981' },
    { type: 'Motor', count: 2800, percentage: 30, color: '#3b82f6' },
    { type: 'Term', count: 2100, percentage: 25, color: '#f59e0b' }
  ];

  const displayInvestmentData = investmentOverview?.investments || [
    { name: 'Mutual Funds', value: '₹125.4 Cr', growth: '+18.5%', color: 'text-indigo-600' },
    { name: 'SIP Portfolio', value: '₹89.2 Cr', growth: '+22.3%', color: 'text-purple-600' }
  ];

  const displayTaxData = taxPlanning?.taxPlanning || [
    { name: 'Personal Tax Planning', value: '₹45.8 Cr', growth: '+15.2%', color: 'text-orange-600' },
    { name: 'Business Tax Strategy', value: '₹68.3 Cr', growth: '+19.7%', color: 'text-amber-600' }
  ];

  const totalDisbursed = loanDistribution?.totalDisbursed || '₹45.1 Cr';
  const totalInsurancePolicies = insuranceDistribution?.totalPolicies || 10100;

  // Use actual API data or fallback to defaults
  const displayReportCategories = reportCategories && reportCategories.length > 0 ? reportCategories : [
    { 
      name: 'Loan Reports', 
      gradient: 'from-green-600 to-green-700',
      reports: ['Short-Term Loan Report', 'Personal Loan Report', 'Home Loan Report', 'Business Loan Report']
    },
    {
      name: 'Insurance Reports',
      gradient: 'from-blue-600 to-blue-700',
      reports: ['Health Insurance Report', 'Motor Insurance Report', 'Term Insurance Report']
    },
    {
      name: 'Investment Reports',
      gradient: 'from-indigo-600 to-indigo-700',
      reports: ['Mutual Funds Report', 'SIP Analysis Report']
    },
    {
      name: 'Tax Planning Reports',
      gradient: 'from-orange-600 to-orange-700',
      reports: ['Personal Tax Planning Report', 'Business Tax Strategy Report']
    },
    {
      name: 'Retail Services Reports',
      gradient: 'from-cyan-600 to-cyan-700',
      reports: ['Retail Customer Report', 'Retail Sales Report', 'Retail Performance Report']
    },
    {
      name: 'Corporate Services Reports',
      gradient: 'from-rose-600 to-rose-700',
      reports: ['Corporate Client Report', 'Corporate Loans Report', 'Corporate Services Overview']
    }
  ];

  return (
    <div className="w-full bg-gray-50 min-h-screen p-3 sm:p-4 md:p-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-green-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Analyze business metrics and generate reports</p>
            {lastRefreshTime && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>Last updated:</span>
                <span className="font-semibold">{lastRefreshTime.toLocaleTimeString()}</span>
              </p>
            )}
          </div>
          
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <button 
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  // Trigger data refresh by toggling dateRange
                  const newRange = dateRange;
                  setDateRange('');
                  setTimeout(() => setDateRange(newRange), 100);
                }, 500);
              }}
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Refresh real-time data"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
            <button 
              onClick={handleExportAll}
              disabled={isExporting || loading}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {reportCategories.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                {category.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{category.name}</h3>
            </div>
            <div className="space-y-2">
              {category.reports.map((report, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGenerateReport(report)}
                  disabled={isGenerating && selectedReport === report}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <span className="text-gray-700 font-medium text-left truncate">{report}</span>
                  {isGenerating && selectedReport === report ? (
                    <svg className="animate-spin w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400 hover:text-green-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Loan Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Loan Distribution</h3>
          <div className="space-y-3">
            {displayLoanData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{item.amount}</p>
                    <p className="text-[10px] text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Disbursed</span>
              <span className="text-base font-bold text-green-700">{totalDisbursed}</span>
            </div>
          </div>
        </div>

        {/* Insurance Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Insurance Distribution</h3>
          <div className="space-y-3">
            {displayInsuranceData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{item.count?.toLocaleString() || '0'}</p>
                    <p className="text-[10px] text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Policies</span>
              <span className="text-base font-bold text-blue-700">{totalInsurancePolicies.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Investment & Tax Planning Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Investment Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Investment Distribution</h3>
          <div className="space-y-3">
            {displayInvestmentData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{item.value}</p>
                    <p className="text-[10px] text-green-600 font-semibold">{item.growth}</p>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${index === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`}
                    style={{ width: `${index === 0 ? '58' : '42'}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Investments</span>
              <span className="text-base font-bold text-indigo-700">₹214.6 Cr</span>
            </div>
          </div>
        </div>

        {/* Tax Planning Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Tax Planning Distribution</h3>
          <div className="space-y-3">
            {displayTaxData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-orange-500' : 'bg-amber-500'}`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">{item.value}</p>
                    <p className="text-[10px] text-green-600 font-semibold">{item.growth}</p>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${index === 0 ? 'bg-orange-500' : 'bg-amber-500'}`}
                    style={{ width: `${index === 0 ? '40' : '60'}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Tax Planning</span>
              <span className="text-base font-bold text-orange-700">₹114.1 Cr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retail & Corporate Services Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Retail Services Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Retail Services Distribution
          </h3>
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-600"></div>
                  <span className="text-xs font-medium text-gray-700">File Your ITR</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹12.8Cr</p>
                  <p className="text-[9px] text-gray-500">14%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-cyan-600 rounded-full transition-all duration-700" style={{ width: '14%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"></div>
                  <span className="text-xs font-medium text-gray-700">Revise Your ITR</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹8.4Cr</p>
                  <p className="text-[9px] text-gray-500">9%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-cyan-500 rounded-full transition-all duration-700" style={{ width: '9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                  <span className="text-xs font-medium text-gray-700">Reply to ITR Notice</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹6.2Cr</p>
                  <p className="text-[9px] text-gray-500">7%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-cyan-400 rounded-full transition-all duration-700" style={{ width: '7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-600"></div>
                  <span className="text-xs font-medium text-gray-700">Apply for Individual PAN</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹10.5Cr</p>
                  <p className="text-[9px] text-gray-500">12%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-teal-600 rounded-full transition-all duration-700" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                  <span className="text-xs font-medium text-gray-700">Apply for HUF PAN</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹5.7Cr</p>
                  <p className="text-[9px] text-gray-500">6%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-teal-500 rounded-full transition-all duration-700" style={{ width: '6%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <span className="text-xs font-medium text-gray-700">Withdraw Your PF</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹15.2Cr</p>
                  <p className="text-[9px] text-gray-500">17%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-blue-600 rounded-full transition-all duration-700" style={{ width: '17%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-xs font-medium text-gray-700">Update Aadhaar/PAN</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹7.9Cr</p>
                  <p className="text-[9px] text-gray-500">9%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-700" style={{ width: '9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span className="text-xs font-medium text-gray-700">Online Trading & Demat</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹11.3Cr</p>
                  <p className="text-[9px] text-gray-500">13%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-700" style={{ width: '13%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                  <span className="text-xs font-medium text-gray-700">Bank Account Services</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹9.6Cr</p>
                  <p className="text-[9px] text-gray-500">11%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-purple-600 rounded-full transition-all duration-700" style={{ width: '11%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-600"></div>
                  <span className="text-xs font-medium text-gray-700">Financial Planning</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹3.8Cr</p>
                  <p className="text-[9px] text-gray-500">2%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-pink-600 rounded-full transition-all duration-700" style={{ width: '2%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Revenue</span>
              <span className="text-base font-bold text-cyan-700">₹91.4 Cr</span>
            </div>
          </div>
        </div>

        {/* Corporate Services Distribution */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Corporate Services Distribution
          </h3>
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                  <span className="text-xs font-medium text-gray-700">Register New Company</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹48.5Cr</p>
                  <p className="text-[9px] text-gray-500">13%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-rose-600 rounded-full transition-all duration-700" style={{ width: '13%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-xs font-medium text-gray-700">Compliance for Company</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹42.3Cr</p>
                  <p className="text-[9px] text-gray-500">12%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-rose-500 rounded-full transition-all duration-700" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                  <span className="text-xs font-medium text-gray-700">Tax Audit</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹38.7Cr</p>
                  <p className="text-[9px] text-gray-500">11%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-all duration-700" style={{ width: '11%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-600"></div>
                  <span className="text-xs font-medium text-gray-700">Legal Advice</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹51.2Cr</p>
                  <p className="text-[9px] text-gray-500">14%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-orange-600 rounded-full transition-all duration-700" style={{ width: '14%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
                  <span className="text-xs font-medium text-gray-700">Provident Fund Services</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹36.1Cr</p>
                  <p className="text-[9px] text-gray-500">10%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-amber-600 rounded-full transition-all duration-700" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-600"></div>
                  <span className="text-xs font-medium text-gray-700">TDS-Related Services</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹43.8Cr</p>
                  <p className="text-[9px] text-gray-500">12%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-yellow-600 rounded-full transition-all duration-700" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime-600"></div>
                  <span className="text-xs font-medium text-gray-700">GST-Related Services</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹47.9Cr</p>
                  <p className="text-[9px] text-gray-500">13%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-lime-600 rounded-full transition-all duration-700" style={{ width: '13%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                  <span className="text-xs font-medium text-gray-700">Payroll Services</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹32.4Cr</p>
                  <p className="text-[9px] text-gray-500">9%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-green-600 rounded-full transition-all duration-700" style={{ width: '9%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                  <span className="text-xs font-medium text-gray-700">Accounting & Bookkeeping</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">₹20.3Cr</p>
                  <p className="text-[9px] text-gray-500">6%</p>
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-emerald-600 rounded-full transition-all duration-700" style={{ width: '6%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Revenue</span>
              <span className="text-base font-bold text-rose-700">₹361.2 Cr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
