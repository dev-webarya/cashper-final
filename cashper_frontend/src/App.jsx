import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all components
const EnhancedHomePage = lazy(() => import('./pages/EnhancedHomePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const Login = lazy(() => import('./components/auth/Login'));
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'));
const CreateAccount = lazy(() => import('./components/auth/CreateAccount'));
const OTPLogin = lazy(() => import('./components/auth/OTPLogin'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Health_Insurence = lazy(() => import('./components/Health_Insurence'));
const Term_Insurance = lazy(() => import('./components/Term_Insurance'));
const Moter_Insurance = lazy(() => import('./components/Moter_Insurance'));
const SIP = lazy(() => import('./components/SIP'));
const Mutual_funds = lazy(() => import('./components/Mutual_funds'));
const Personal_tax_planning = lazy(() => import('./components/Personal_tax_planning'));
const Business_Tax_planning = lazy(() => import('./components/Business_Tax_planning'));
const Short_Term_Loan = lazy(() => import('./components/Short_Term_Loan'));
const Home_Loan = lazy(() => import('./components/Home_Loan'));
const Personal_loan = lazy(() => import('./components/Personal_loan'));
const Business_loan = lazy(() => import('./components/Business_loan'));
const Dashboard = lazy(() => import('./components/dashbord/Dashboard'));
const AdminPanel = lazy(() => import('./components/Admin pannel/AdminPanel'));

// Retail Services
const FileITR = lazy(() => import('./pages/services/FileITR'));
const ReviseITR = lazy(() => import('./pages/services/ReviseITR'));
const ReplyITRNotice = lazy(() => import('./pages/services/ReplyITRNotice'));
const ApplyIndividualPAN = lazy(() => import('./pages/services/ApplyIndividualPAN'));
const ApplyHUFPAN = lazy(() => import('./pages/services/ApplyHUFPAN'));
const WithdrawPF = lazy(() => import('./pages/services/WithdrawPF'));
const UpdateAadhaarPAN = lazy(() => import('./pages/services/UpdateAadhaarPAN'));
const OnlineTradingDemat = lazy(() => import('./pages/services/OnlineTradingDemat'));
const BankAccount = lazy(() => import('./pages/services/BankAccount'));
const FinancialPlanning = lazy(() => import('./pages/services/FinancialPlanning'));

// Corporate Services
const RegisterCompany = lazy(() => import('./pages/services/RegisterCompany'));
const ComplianceNewCompany = lazy(() => import('./pages/services/ComplianceNewCompany'));
const TaxAudit = lazy(() => import('./pages/services/TaxAudit'));
const LegalAdvice = lazy(() => import('./pages/services/LegalAdvice'));
const ProvidentFundServices = lazy(() => import('./pages/services/ProvidentFundServices'));
const TDSServices = lazy(() => import('./pages/services/TDSServices'));
const GSTServices = lazy(() => import('./pages/services/GSTServices'));
const PayrollServices = lazy(() => import('./pages/services/PayrollServices'));
const AccountingBookkeeping = lazy(() => import('./pages/services/AccountingBookkeeping'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.5rem',
    color: '#333'
  }}>
    <div>Loading...</div>
  </div>
);
function App() {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<EnhancedHomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/otp-login" element={<OTPLogin />} />
            
            {/* Dashboard Routes with nested paths - PROTECTED for regular users */}
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/overview" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/loans" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/insurance" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/investments" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/tax" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/retail-services" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/corporate-services" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/calculators" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/profile" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/profile/edit" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/settings" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/documents" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            <Route path="/dashboard/support" element={<ProtectedRoute element={<Dashboard />} isAdmin={false} />} />
            
            {/* Admin Panel Routes with nested paths - PROTECTED */}
            <Route path="/admin" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/users" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/documents" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/loans" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/insurance" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/investments" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/taxplanning" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/taxconsultations" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/retailservices" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/corporateservices" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/reports" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/settings" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/profile" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/help" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            <Route path="/admin/notifications" element={<ProtectedRoute element={<AdminPanel />} isAdmin={true} />} />
            
            <Route path="/consultation" element={<ContactPage />} />
            {/* Insurance Routes */}
            <Route path="/insurance/health" element={<Health_Insurence />} />
            <Route path="/insurance/term" element={<Term_Insurance />} />
            <Route path="/insurance/motor" element={<Moter_Insurance />} />
            
            {/* Investment Routes */}
            <Route path="/investments/sip" element={<SIP />} />
            <Route path="/investments/mutual-funds" element={<Mutual_funds />} />
            
            {/* Tax Planning Routes */}
            <Route path="/tax-planning/personal" element={<Personal_tax_planning />} />
            <Route path="/services/tax-planning" element={<Personal_tax_planning />} />
            <Route path="/tax-planning/business" element={<Business_Tax_planning />} />
            
            {/* Loan Routes */}
            <Route path="/loans/short-term" element={<Short_Term_Loan />} />
            <Route path="/loans/home" element={<Home_Loan />} />
            <Route path="/loans/personal" element={<Personal_loan />} />
            <Route path="/loans/business" element={<Business_loan />} />
            {/* TODO: Add remaining loan routes when components are created:
            <Route path="/loans/loan-against-property" element={<Loan_Against_Property />} />
            <Route path="/loans/od-cc-limit" element={<OD_CC_Limit />} />
            <Route path="/loans/cgtmse-support" element={<CGTMSE_Support />} />
            */}
            
            {/* Retail Services Routes */}
            <Route path="/services/file-itr" element={<FileITR />} />
            <Route path="/services/revise-itr" element={<ReviseITR />} />
            <Route path="/services/reply-itr-notice" element={<ReplyITRNotice />} />
            <Route path="/services/apply-individual-pan" element={<ApplyIndividualPAN />} />
            <Route path="/services/apply-huf-pan" element={<ApplyHUFPAN />} />
            <Route path="/services/withdraw-pf" element={<WithdrawPF />} />
            <Route path="/services/update-aadhaar-pan" element={<UpdateAadhaarPAN />} />
            <Route path="/services/online-trading-demat" element={<OnlineTradingDemat />} />
            <Route path="/services/bank-account" element={<BankAccount />} />
            <Route path="/services/financial-planning" element={<FinancialPlanning />} />
            
            {/* Corporate Services Routes */}
            <Route path="/services/register-company" element={<RegisterCompany />} />
            <Route path="/services/compliance-new-company" element={<ComplianceNewCompany />} />
            <Route path="/services/tax-audit" element={<TaxAudit />} />
            <Route path="/services/legal-advice" element={<LegalAdvice />} />
            <Route path="/services/provident-fund-services" element={<ProvidentFundServices />} />
            <Route path="/services/tds-services" element={<TDSServices />} />
            <Route path="/services/gst-services" element={<GSTServices />} />
            <Route path="/services/payroll-services" element={<PayrollServices />} />
            <Route path="/services/accounting-bookkeeping" element={<AccountingBookkeeping />} />
            
            {/* Calculator Routes - These routes redirect to dashboard calculators section */}
            <Route path="/calculators/*" element={<Dashboard />} />
            
            {/* Legal Routes */}
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />
          </Routes>
        </Suspense>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
    </GoogleOAuthProvider>
  );
}
export default App;
