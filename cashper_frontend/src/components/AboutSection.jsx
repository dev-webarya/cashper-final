import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutSection = () => {
  return (
    <section className="w-full px-3 xs:px-4 sm:px-6 md:px-8 py-10 xs:py-12 sm:py-14 md:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-14 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 xs:mb-5 sm:mb-6 leading-tight">
              About <span className="text-green-700">Cashper</span>
            </h2>
            <p className="text-gray-600 text-sm xs:text-base sm:text-base md:text-lg lg:text-lg leading-relaxed mb-3 xs:mb-4 sm:mb-4">
              At Cashper, we believe that everyone deserves access to transparent, reliable, and 
              personalized financial solutions. With years of expertise in the financial services 
              industry, we've helped thousands of individuals and businesses achieve their financial 
              goals through our innovative products and customer-first approach.
            </p>
            <p className="text-gray-600 text-sm xs:text-base sm:text-base md:text-lg lg:text-lg leading-relaxed mb-6 xs:mb-7 sm:mb-8">
              Our commitment to trust, transparency, and innovation sets us apart. Whether you're 
              looking for a loan, insurance, investment advice, or tax planning services, our team 
              of experienced professionals is dedicated to guiding you every step of the way. 
              Your financial success is our success.
            </p>
            <Link
              to="/about"
              className="bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold px-5 xs:px-6 sm:px-7 md:px-8 py-2.5 xs:py-3 sm:py-3 md:py-3.5 rounded-lg transition-all duration-300 inline-block text-sm xs:text-base sm:text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative mt-6 xs:mt-8 lg:mt-0"
          >
            <div className="rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/image copy 2.png"
                alt="Professional business meeting"
                className="w-full h-56 xs:h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] object-cover"
              />
            </div>
            {/* Decorative Elements - Hidden on mobile */}
            <div className="hidden md:block absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-green-700 rounded-2xl opacity-20 -z-10"></div>
            <div className="hidden md:block absolute -top-4 -left-4 md:-top-6 md:-left-6 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-green-700 rounded-2xl opacity-20 -z-10"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

