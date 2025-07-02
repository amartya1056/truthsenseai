import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Youtube, Instagram, Megaphone, Clock, Sparkles, CheckCircle } from 'lucide-react';

const serviceFeatures = [
  {
    icon: Brain,
    title: 'Text-based Misinformation Analysis',
    description: 'Detect and analyze fake or misleading information from articles, blogs, social media posts, and more using advanced NLP.',
    status: 'Available',
    statusType: 'available',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Youtube,
    title: 'YouTube Video Misinformation Analysis',
    description: 'Analyze YouTube video content, transcripts, and comments to uncover misinformation trends and factual inconsistencies.',
    status: 'Available',
    statusType: 'available',
    gradient: 'from-red-500 to-pink-500',
  },
  {
    icon: Instagram,
    title: 'Instagram/Facebook Reels Misinformation Analysis',
    description: 'Verify short-form viral content across Instagram and Facebook using AI-powered real-time detection (launching soon).',
    status: 'Coming Soon',
    statusType: 'coming-soon',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Megaphone,
    title: 'Advertisements Misinformation Analysis',
    description: 'Evaluate sponsored content, digital ads, and brand claims to identify deceptive or misleading advertising practices.',
    status: 'Available',
    statusType: 'available',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

const ComingSoonSection: React.FC = () => {
  return (
    <section id="coming-soon" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-400 mr-2" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              What's{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                in Service
              </span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover the powerful tools currently available (and launching soon) on the TruthSense AI platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {serviceFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/40 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} p-2.5 shadow-lg`}>
                      <feature.icon className="w-full h-full text-white" />
                    </div>
                    <div className={`absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} blur-xl opacity-30`}></div>
                  </div>
                  
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${
                    feature.statusType === 'available' 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    {feature.statusType === 'available' ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <Clock className="w-3 h-3 text-yellow-400" />
                    )}
                    <span className={`text-xs font-medium ${
                      feature.statusType === 'available' ? 'text-green-300' : 'text-yellow-300'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Early Access CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Get Early Access
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Be among the first to experience these powerful new features. 
              Join our waitlist and get notified when they're ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              />
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
                Join Waitlist
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComingSoonSection;