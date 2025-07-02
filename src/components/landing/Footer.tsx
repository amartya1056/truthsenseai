import React from 'react';
import { Eye, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-purple-500/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Eye className="w-8 h-8 text-purple-400" />
                <div className="absolute inset-0 bg-purple-400 blur-md opacity-30"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                TruthSense AI
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Advanced AI-powered misinformation detection system. 
              Protecting truth in the digital age with cutting-edge technology.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-purple-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">API Access</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Enterprise</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 TruthSense AI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;