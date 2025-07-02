import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface VerdictAnimationProps {
  verdict: 'true' | 'false' | 'misleading' | 'unverifiable';
  confidence: number;
  isVisible: boolean;
  onComplete: () => void;
}

const VerdictAnimation: React.FC<VerdictAnimationProps> = ({ 
  verdict, 
  confidence, 
  isVisible, 
  onComplete 
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show content after initial animation
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);

      // Auto-complete after 3 seconds
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onComplete]);

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          glowColor: 'shadow-green-500/50',
          label: 'TRUE',
          description: 'Information verified as accurate'
        };
      case 'false':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          glowColor: 'shadow-red-500/50',
          label: 'FALSE',
          description: 'Information identified as false'
        };
      case 'misleading':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          glowColor: 'shadow-yellow-500/50',
          label: 'MISLEADING',
          description: 'Information contains inaccuracies'
        };
      case 'unverifiable':
        return {
          icon: HelpCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          glowColor: 'shadow-gray-500/50',
          label: 'UNVERIFIABLE',
          description: 'Insufficient evidence for determination'
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          glowColor: 'shadow-gray-500/50',
          label: 'ANALYZING',
          description: 'Analysis in progress'
        };
    }
  };

  const config = getVerdictConfig(verdict);
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.6
            }}
            className={`relative ${config.bgColor} ${config.borderColor} border-2 rounded-3xl p-8 max-w-md mx-4 shadow-2xl ${config.glowColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background glow */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute inset-0 ${config.bgColor} rounded-3xl blur-xl`}
            />

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Icon with pulse animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-6"
              >
                <div className={`w-20 h-20 mx-auto ${config.color} relative`}>
                  <IconComponent className="w-full h-full" />
                  
                  {/* Ripple effect */}
                  <motion.div
                    animate={{ 
                      scale: [1, 2.5],
                      opacity: [0.8, 0]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    className={`absolute inset-0 ${config.borderColor} border-2 rounded-full`}
                  />
                </div>
              </motion.div>

              {/* Verdict label with typewriter effect */}
              <AnimatePresence>
                {showContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.h2 
                      className={`text-3xl font-bold ${config.color} mb-3`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      {config.label}
                    </motion.h2>
                    
                    <motion.p 
                      className="text-gray-300 text-lg mb-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      {config.description}
                    </motion.p>

                    {/* Confidence meter */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Confidence</span>
                        <span className={`font-bold ${config.color}`}>{confidence}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${confidence}%` }}
                          transition={{ 
                            delay: 0.7,
                            duration: 1,
                            ease: "easeOut"
                          }}
                          className={`h-full rounded-full ${
                            verdict === 'true' ? 'bg-green-500' :
                            verdict === 'false' ? 'bg-red-500' :
                            verdict === 'misleading' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`}
                        />
                      </div>
                    </motion.div>

                    {/* Click to continue hint */}
                    <motion.p 
                      className="text-xs text-gray-500 mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    >
                      Click anywhere to continue
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Decorative particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${config.bgColor} rounded-full`}
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VerdictAnimation;