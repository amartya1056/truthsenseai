import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Brain, Image, Newspaper, Search, Mail, ExternalLink } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'AI-Powered Fact Verification',
    description: 'Advanced machine learning models cross-reference claims with verified sources in real-time.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Real-Time Internet Analysis',
    description: 'Instant analysis of web content, social media posts, and news articles with live fact-checking.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'NLP-Driven Text & Image Evaluation',
    description: 'Natural language processing combined with computer vision for comprehensive content analysis.',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    icon: Image,
    title: 'Fake Image & Deepfake Detection',
    description: 'State-of-the-art algorithms to identify manipulated images and AI-generated content.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Newspaper,
    title: 'News & Social Media Check',
    description: 'Comprehensive verification of news articles and social media content across platforms.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Search,
    title: 'Source Transparency',
    description: 'Complete citation tracking with credibility scores and source verification history.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Advanced{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Detection
            </span>{' '}
            Capabilities
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Cutting-edge technology to identify misinformation, verify facts, and ensure information integrity
            across all digital platforms.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-all duration-300 group-hover:transform group-hover:scale-105">
                <div className="relative mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} p-3 shadow-lg`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <div className={`absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Axonrome Newsletter Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center"
        >
          <a
            href="https://axonrome-junior.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative max-w-lg w-full"
          >
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-lg hover:shadow-cyan-500/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </div>
              
              <h3 className="text-xl font-semibold text-center mb-3 text-white group-hover:text-cyan-300 transition-colors">
                Join our newsletter Axonrome for the latest AI Tech Updates
              </h3>
              
              <div className="flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-colors">
                <span className="text-sm font-medium mr-2">Subscribe now</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;