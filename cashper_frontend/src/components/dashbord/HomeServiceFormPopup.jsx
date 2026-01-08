import React, { Suspense, lazy } from 'react';
import { X } from 'lucide-react';

// Lazy load home service form components
const HealthInsuranceForm = lazy(() => import('../Health_Insurence'));
const TermInsuranceForm = lazy(() => import('../Term_Insurance'));
const MotorInsuranceForm = lazy(() => import('../Moter_Insurance'));
const MutualFundsForm = lazy(() => import('../Mutual_funds'));
const SIPForm = lazy(() => import('../SIP'));
const PersonalTaxPlanningForm = lazy(() => import('../Personal_tax_planning'));
const BusinessTaxPlanningForm = lazy(() => import('../Business_Tax_planning'));

const HomeServiceFormPopup = ({ serviceType, onClose }) => {
  if (!serviceType) return null;

  // Map service type to component
  const serviceComponents = {
    'Health Insurance': HealthInsuranceForm,
    'Term Insurance': TermInsuranceForm,
    'Motor Insurance': MotorInsuranceForm,
    'Mutual Funds': MutualFundsForm,
    'SIP': SIPForm,
    'Personal Tax Planning': PersonalTaxPlanningForm,
    'Business Tax Strategy': BusinessTaxPlanningForm,
  };

  const ServiceComponent = serviceComponents[serviceType];

  if (!ServiceComponent) {
    console.error(`No component found for service type: ${serviceType}`);
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
              {serviceType}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Close popup"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Service Form Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-70px)] px-4 sm:px-6 py-4 sm:py-6">
            <Suspense 
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              }
            >
              <ServiceComponent isPopupMode={true} onPopupClose={onClose} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeServiceFormPopup;
