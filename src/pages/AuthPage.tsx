import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, User, Building, Github, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';

interface AuthForm {
  email: string;
  password: string;
  name?: string;
  userType: 'user' | 'organization';
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'user' | 'organization'>('user');
  const { login, register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthForm>({
    defaultValues: { userType }
  });

  const onSubmit = async (data: AuthForm) => {
    try {
      if (isLogin) {
        await login(data.email, data.password, userType);
      } else {
        await registerUser(data.email, data.password, data.name || '', userType);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <div className="relative">
              <Eye className="w-8 h-8 text-purple-400" />
              <div className="absolute inset-0 bg-purple-400 blur-md opacity-30"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              TruthSense AI
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Sign in to your TruthSense AI account' : 'Create your TruthSense AI account'}
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-800/50 p-1 rounded-xl border border-gray-700">
              <button
                type="button"
                onClick={() => setUserType('user')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                  userType === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Individual</span>
              </button>
              <button
                type="button"
                onClick={() => setUserType('organization')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                  userType === 'organization'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span className="font-medium">Organization</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  {userType === 'organization' ? 'Organization Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: !isLogin ? 'Name is required' : false })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder={userType === 'organization' ? 'Your organization' : 'Your full name'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-950 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-colors">
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800/50 transition-colors">
                <Mail className="w-5 h-5 mr-2" />
                Google
              </button>
            </div>
          </div>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Background */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join the fight against{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                misinformation
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-md">
              Advanced AI detection for fake news, deepfakes, and misinformation across all digital platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;