import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatSimulation from './ChatSimulation';

const HeroSection: React.FC = () => {
  return (
    <section className="pt-24 pb-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Your AI-Powered{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Misinformation Detection
                </span>{' '}
                Assistant
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Detect fake news, misinformation, and deepfakes using advanced AI. 
                Get real-time analysis with source verification and confidence scores.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 group"
              >
                <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Now
              </Link>
              
              <a
                href="#contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-500 rounded-full text-purple-400 font-semibold text-lg hover:bg-purple-500/10 transition-all duration-300 group"
              >
                <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Get in Touch
              </a>
            </motion.div>
          </div>

          {/* Chat Simulation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:order-first order-last"
          >
            <ChatSimulation />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;