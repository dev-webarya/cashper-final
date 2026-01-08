import React from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaEye, FaUserTie, FaUsers, FaHeadset } from 'react-icons/fa';

const WhyChooseUs = () => {
  const features = [
    {
      icon: <FaRocket className="text-4xl" />,
      title: 'Fast Approvals',
      description: 'Get your loans and policies approved within 24 hours. Our streamlined process ensures quick turnaround times.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <FaEye className="text-4xl" />,
      title: 'Transparent Process',
      description: 'No hidden charges or surprises. We believe in complete transparency with clear terms and conditions.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <FaUserTie className="text-4xl" />,
      title: 'Personalized Guidance',
      description: 'Expert advisors provide tailored solutions based on your unique financial needs and goals.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: 'Experienced Team',
      description: 'Our team of financial experts brings decades of combined experience in the industry.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <FaHeadset className="text-4xl" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help or have questions.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="w-full px-3 xs:px-4 sm:px-6 md:px-8 py-10 xs:py-12 sm:py-14 md:py-16 lg:py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-14"
        >
          <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-5 leading-tight">
            Why Choose <span className="text-green-700">Cashper?</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
            We combine cutting-edge technology with personalized service to deliver exceptional financial solutions
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-6 md:p-7 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`w-14 h-14 xs:w-16 xs:h-16 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 xs:mb-5 sm:mb-5 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-lg xs:text-xl sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-3">{feature.title}</h3>
              <p className="text-sm xs:text-base sm:text-base md:text-lg text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
