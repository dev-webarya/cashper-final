import React, { Suspense, lazy, useMemo } from 'react';
import { X } from 'lucide-react';

// Lazy load corporate service form pages
const RegisterCompanyForm = lazy(() => import('../../pages/services/RegisterCompany'));
const ComplianceNewCompanyForm = lazy(() => import('../../pages/services/ComplianceNewCompany'));
const TaxAuditForm = lazy(() => import('../../pages/services/TaxAudit'));
const LegalAdviceForm = lazy(() => import('../../pages/services/LegalAdvice'));
const ProvidentFundServicesForm = lazy(() => import('../../pages/services/ProvidentFundServices'));
const TDSServicesForm = lazy(() => import('../../pages/services/TDSServices'));
const GSTServicesForm = lazy(() => import('../../pages/services/GSTServices'));
const PayrollServicesForm = lazy(() => import('../../pages/services/PayrollServices'));
const AccountingBookkeepingForm = lazy(() => import('../../pages/services/AccountingBookkeeping'));

const CorporateServiceFormPopup = React.memo(({ serviceType, onClose }) => {
  if (!serviceType) return null;

  // Map service type to component
  const serviceComponents = {
    'Register New Company': RegisterCompanyForm,
    'Compliance for New Company': ComplianceNewCompanyForm,
    'Tax Audit': TaxAuditForm,
    'Legal Advice': LegalAdviceForm,
    'Provident Fund Services': ProvidentFundServicesForm,
    'TDS-Related Services': TDSServicesForm,
    'GST-Related Services': GSTServicesForm,
    'Payroll Services': PayrollServicesForm,
    'Accounting & Bookkeeping': AccountingBookkeepingForm,
  };

  // ✅ Prevent unnecessary re-mounting
  const ServiceComponent = useMemo(
    () => serviceComponents[serviceType],
    [serviceType]
  );

  if (!ServiceComponent) {
    console.error(`No component found for service type: ${serviceType}`);
    return null;
  }

  return (
    <div
      className="fixed top-20 left-0 lg:left-64 right-0 bottom-0 z-40 overflow-y-auto flex items-start justify-center p-2"
      onClick={(e) => {
        if (e.currentTarget === e.target) {
          onClose();
        }
      }}
    >
      <div className="relative bg-white rounded-xl w-full max-w-2xl my-2 shadow-lg">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-t-xl px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {serviceType}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close popup"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-60px)] px-2 popup-content">
          {/* Scoped styles to hide navbar, footer only within popup content */}
          <style>{`
            .popup-content nav { display: none !important; }
            .popup-content footer { display: none !important; }
            .popup-content .navbar { display: none !important; }
            .popup-content .footer { display: none !important; }
            .popup-content > div > .min-h-screen { background: transparent !important; }
            .popup-content section:first-of-type { padding-top: 0 !important; }
          `}</style>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            }
          >
            {/* ✅ Form will NOT auto refresh */}
            <ServiceComponent
              isPopupMode={true}
              onPopupClose={onClose}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
});
export default CorporateServiceFormPopup;