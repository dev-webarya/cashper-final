import React from "react";

const HeroSection = () => {
  const handleApplyNow = () => {
    const element = document.getElementById('popular-products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExploreServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <section
      className="relative w-full min-h-[450px] xs:min-h-[500px] sm:min-h-[550px] md:min-h-[650px] lg:min-h-[750px] xl:h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: "scroll",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Gradient Overlay for better text visibility - Responsive */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/45 to-black/60 sm:bg-gradient-to-r sm:from-black/60 sm:via-black/50 sm:to-transparent"></div>
      
      {/* Content Container - Fully Responsive */}
      <div className="relative z-10 w-full h-full flex items-center sm:items-center justify-center sm:justify-start px-4 xs:px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-20 xs:py-24 sm:py-28 md:py-32 lg:py-36">
        <div className="w-full max-w-[95%] xs:max-w-[90%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl text-center sm:text-left">
          
          {/* Main Heading - Fully Responsive Typography */}
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-white leading-tight sm:leading-tight md:leading-tight lg:leading-tight mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12 drop-shadow-2xl">
            Loans, Insurance & Investments — all in one place
          </h1>
          
          {/* Buttons Container - Fully Responsive */}
          <div className="flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-4 sm:gap-4 md:gap-5 lg:gap-6 justify-center sm:justify-start items-stretch sm:items-center w-full sm:w-auto">
            
            {/* Apply Now Button - Enhanced Responsiveness */}
            <button
              onClick={handleApplyNow}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold px-6 xs:px-7 sm:px-8 md:px-9 lg:px-10 xl:px-11 py-3 xs:py-3.5 sm:py-4 md:py-4 lg:py-4 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl text-center transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Apply Now
            </button>
           
            {/* Explore Services Button - Enhanced Responsiveness */}
            <button 
              onClick={handleExploreServices}
              className="w-full sm:w-auto bg-white/20 backdrop-blur-md border-2 border-white/40 hover:bg-white/30 hover:border-white/60 active:bg-white/40 text-white font-bold px-6 xs:px-7 sm:px-8 md:px-9 lg:px-10 xl:px-11 py-3 xs:py-3.5 sm:py-4 md:py-4 lg:py-4 rounded-full shadow-2xl hover:shadow-white/30 transition-all duration-300 text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl text-center transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Explore Our Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
