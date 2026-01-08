import React, { Suspense, lazy } from 'react';
import { X } from 'lucide-react';

// Lazy load retail service form pages
const FileITRForm = lazy(() => import('../../pages/services/FileITR'));
const ReviseITRForm = lazy(() => import('../../pages/services/ReviseITR'));
const ReplyITRNoticeForm = lazy(() => import('../../pages/services/ReplyITRNotice'));
const ApplyIndividualPANForm = lazy(() => import('../../pages/services/ApplyIndividualPAN'));
const ApplyHUFPANForm = lazy(() => import('../../pages/services/ApplyHUFPAN'));
const WithdrawPFForm = lazy(() => import('../../pages/services/WithdrawPF'));
const UpdateAadhaarPANForm = lazy(() => import('../../pages/services/UpdateAadhaarPAN'));
const OnlineTradingDematForm = lazy(() => import('../../pages/services/OnlineTradingDemat'));
const BankAccountForm = lazy(() => import('../../pages/services/BankAccount'));
const FinancialPlanningForm = lazy(() => import('../../pages/services/FinancialPlanning'));

const ServiceFormPopup = ({ serviceType, onClose }) => {
  if (!serviceType) return null;

  // Map service type to component
  const serviceComponents = {
    'File Your ITR': FileITRForm,
    'Revise Your ITR': ReviseITRForm,
    'Reply to ITR Notice': ReplyITRNoticeForm,
    'Apply for Individual PAN': ApplyIndividualPANForm,
    'Apply for HUF PAN': ApplyHUFPANForm,
    'Withdraw Your PF': WithdrawPFForm,
    'Update Aadhaar or PAN Details': UpdateAadhaarPANForm,
    'Online Trading & Demat': OnlineTradingDematForm,
    'Bank Account Services': BankAccountForm,
    'Financial Planning & Advisory': FinancialPlanningForm,
  };

  const ServiceComponent = serviceComponents[serviceType];

  if (!ServiceComponent) {
    console.error(`No component found for service type: ${serviceType}`);
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 " onClick={onClose} />
      
      {/* Popup Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-6xl my-8 shadow-2xl overflow-hidden">
          {/* Header with Close Button */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {serviceType}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Service Form Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <Suspense 
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              }
            >
              <ServiceComponent isPopupMode={true} onPopupClose={onClose} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormPopup;
