import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getBlogs } from '../services/api';

const BlogInsights = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  // Fallback blog posts in case API fails
  const fallbackBlogPosts = [
    {
      id: 1,
      title: '5 Essential Tips for First-Time Home Buyers',
      excerpt: 'Navigate the home buying process with confidence using these expert tips and financial strategies.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop',
      category: 'Home Loans',
      readTime: '5 min read',
      date: 'Dec 15, 2024',
      author: 'Sarah Johnson',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 2,
      title: 'SIP vs Lump Sum: Which Investment Strategy Works Better?',
      excerpt: 'Compare the benefits of systematic investment plans versus lump sum investments for long-term wealth building.',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop',
      category: 'Investments',
      readTime: '7 min read',
      date: 'Dec 12, 2024',
      author: 'Michael Chen',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 3,
      title: 'Understanding Health Insurance: A Complete Guide',
      excerpt: 'Learn about different types of health insurance policies and how to choose the right coverage for your family.',
      image: 'https://www.carepalsecure.com/blog/wp-content/uploads/2024/10/Cancer-Treatments-1-1024x683.jpg',
      category: 'Insurance',
      readTime: '6 min read',
      date: 'Dec 10, 2024',
      author: 'Dr. Priya Sharma',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      id: 4,
      title: 'Smart Tax Saving Strategies for 2025',
      excerpt: 'Discover effective tax planning methods to maximize your savings and ensure compliance with the latest regulations.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop',
      category: 'Tax Planning',
      readTime: '8 min read',
      date: 'Dec 8, 2024',
      author: 'Rajesh Kumar',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      id: 5,
      title: 'Building an Emergency Fund: Why and How',
      excerpt: 'Learn the importance of an emergency fund and practical steps to build one for financial security.',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop',
      category: 'Financial Planning',
      readTime: '6 min read',
      date: 'Dec 5, 2024',
      author: 'Anjali Verma',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    {
      id: 6,
      title: 'Top Investment Mistakes to Avoid in 2025',
      excerpt: 'Avoid common investment pitfalls and make smarter financial decisions with these expert insights.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
      category: 'Investments',
      readTime: '7 min read',
      date: 'Dec 3, 2024',
      author: 'Vikram Patel',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  // Load blog posts from API on component mount
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setIsLoadingBlogs(true);
        const response = await getBlogs();
        
        if (response && response.length > 0) {
          setBlogPosts(response);
        } else {
          // Use fallback blog posts if no data from API
          setBlogPosts(fallbackBlogPosts);
        }
      } catch (error) {
        console.error("Error loading blogs:", error);
        // Use fallback blog posts on error
        setBlogPosts(fallbackBlogPosts);
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    loadBlogs();
  }, []);

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Slide one card at a time
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= blogPosts.length - itemsPerPage ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? blogPosts.length - itemsPerPage : prev - 1));
  };

  const getVisiblePosts = () => {
    return blogPosts.slice(currentSlide, currentSlide + itemsPerPage);
  };

  const maxSlide = blogPosts.length - itemsPerPage;

  return (
    <section className="py-12 sm:py-14 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Latest Insights & Tips
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Stay informed with our expert financial advice and market insights
          </p>
        </div>

        {/* Blog Slider */}
        <div className="relative">
          {/* Left Arrow - Hidden on mobile, shown on md and above */}
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-10 bg-white hover:bg-blue-600 text-gray-700 hover:text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Previous blogs"
          >
            <FaChevronLeft className="text-lg sm:text-xl" />
          </button>

          {/* Blog Posts - Horizontal scroll on mobile */}
          <div className="md:hidden flex overflow-x-auto gap-5 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group flex-shrink-0 w-[85vw] snap-center"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=Blog+Post';
                    }}
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${post.bgColor} ${post.textColor}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-600">
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span className="truncate">By {post.author}</span>
                  </div>

                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-gray-700 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <Link
                    to={`/blog/${post.id}`}
                    className={`inline-flex items-center text-xs sm:text-sm font-medium ${post.textColor} hover:${post.textColor.replace('600', '700')} transition-colors duration-300`}
                  >
                    Read More
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Blog Posts Grid - Hidden on mobile, shown on md+ */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {getVisiblePosts().map((post, index) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=Blog+Post';
                    }}
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${post.bgColor} ${post.textColor}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-600">
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span className="truncate">By {post.author}</span>
                  </div>

                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-gray-700 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <Link
                    to={`/blog/${post.id}`}
                    className={`inline-flex items-center text-xs sm:text-sm font-medium ${post.textColor} hover:${post.textColor.replace('600', '700')} transition-colors duration-300`}
                  >
                    Read More
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Right Arrow - Hidden on mobile, shown on md and above */}
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-10 bg-white hover:bg-blue-600 text-gray-700 hover:text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Next blogs"
          >
            <FaChevronRight className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Dots Indicator - Hidden on mobile, shown on md+ */}
        <div className="hidden md:flex justify-center gap-2 mt-6 sm:mt-8">
          {blogPosts.map((_, index) => {
            if (index > maxSlide) return null;
            return (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-blue-600 w-6 sm:w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogInsights;
