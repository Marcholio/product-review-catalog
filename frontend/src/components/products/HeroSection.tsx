import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { Button } from '../ui';

interface HeroSectionProps {
  isLoggedIn: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isLoggedIn }) => {
  return (
    <div className="mb-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-12 md:py-20 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-6 max-w-lg">
            Browse our curated selection of top-rated products with honest reviews from our community.
          </p>
          {!isLoggedIn && (
            <Link to="/auth">
              <Button
                variant="secondary"
                leftIcon={<FiUser className="h-5 w-5" />}
              >
                Join Our Community
              </Button>
            </Link>
          )}
        </div>
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg transform rotate-3 shadow-lg">
              <div className="w-20 h-20 bg-indigo-300/30 rounded-lg mb-2"></div>
              <div className="h-3 bg-white/30 rounded-full w-3/4 mb-2"></div>
              <div className="h-3 bg-white/20 rounded-full w-1/2"></div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg transform -rotate-3 shadow-lg mt-8">
              <div className="w-20 h-20 bg-blue-300/30 rounded-lg mb-2"></div>
              <div className="h-3 bg-white/30 rounded-full w-3/4 mb-2"></div>
              <div className="h-3 bg-white/20 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;