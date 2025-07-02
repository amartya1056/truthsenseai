import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-purple-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Eye className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <div className="absolute inset-0 bg-purple-400 blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              TruthSense AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-purple-400 transition-colors">
              Features
            </a>
            <a href="#coming-soon" className="text-gray-300 hover:text-purple-400 transition-colors">
              Coming Soon
            </a>
            <a href="#contact" className="text-gray-300 hover:text-purple-400 transition-colors">
              Contact
            </a>
            <Link
              to="/auth"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-purple-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-purple-500/20"
          >
            <div className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-gray-300 hover:text-purple-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#coming-soon"
                className="text-gray-300 hover:text-purple-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Coming Soon
              </a>
              <a
                href="#contact"
                className="text-gray-300 hover:text-purple-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link
                to="/auth"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;