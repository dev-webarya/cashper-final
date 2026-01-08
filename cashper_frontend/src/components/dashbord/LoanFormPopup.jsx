import React, { Suspense, lazy } from 'react';
import { X } from 'lucide-react';

// Lazy load loan components
const PersonalLoanForm = lazy(() => import('../Personal_loan'));
const HomeLoanForm = lazy(() => import('../Home_Loan'));
const BusinessLoanForm = lazy(() => import('../Business_loan'));
const ShortTermLoanForm = lazy(() => import('../Short_Term_Loan'));

const LoanFormPopup = ({ loanType, onClose }) => {
  if (!loanType) return null;

  // Map loan type to component
  const loanComponents = {
    'Personal Loan': PersonalLoanForm,
    'Home Loan': HomeLoanForm,
    'Business Loan': BusinessLoanForm,
    'Short-Term Loan': ShortTermLoanForm,
  };

  const LoanComponent = loanComponents[loanType];

  if (!LoanComponent) {
    console.error(`No component found for loan type: ${loanType}`);
    return null;
  }

  return (
    <>
      {/* Semi-transparent backdrop overlay */}
      <div className="fixed inset-0 bg-black/30 z-40" style={{ top: '64px' }}></div>
      {/* Modal centered with sidebar visible */}
      <div className="fixed inset-0 overflow-y-auto flex items-start justify-center p-3 xs:p-4 md:p-6 lg:p-8 z-50" style={{ top: '64px', pointerEvents: 'none' }}>
        <div className="relative bg-white rounded-2xl w-full max-w-4xl my-6 shadow-2xl max-h-[85vh]" style={{ pointerEvents: 'auto' }}>
          {/* Header with Close Button */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-2xl px-4 sm:px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
              Apply for {loanType}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close popup"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          {/* Loan Form Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-70px)] px-4 sm:px-6 py-4 sm:py-6">
            <Suspense 
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              }
            >
              <LoanComponent isPopupMode={true} onPopupClose={onClose} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};
export default LoanFormPopup;