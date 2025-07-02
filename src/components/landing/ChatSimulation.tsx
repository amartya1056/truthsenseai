import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  verdict?: 'true' | 'false' | 'misleading';
  confidence?: number;
}

const ChatSimulation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const simulationSteps = [
    {
      id: 1,
      type: 'user' as const,
      content: "Is it true that drinking 8 glasses of water daily is essential for everyone?",
    },
    {
      id: 2,
      type: 'ai' as const,
      content: "Based on my analysis of current medical research, this is **MISLEADING**. While hydration is important, the '8 glasses' rule is oversimplified.",
      verdict: 'misleading' as const,
      confidence: 85,
    },
    {
      id: 3,
      type: 'user' as const,
      content: "Check this image for me - is this a real photo?",
    },
    {
      id: 4,
      type: 'ai' as const,
      content: "After analyzing the image metadata and visual inconsistencies, this appears to be **AI-GENERATED**. Confidence: 92%",
      verdict: 'false' as const,
      confidence: 92,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < simulationSteps.length) {
        setMessages(prev => [...prev, simulationSteps[currentStep]]);
        setCurrentStep(prev => prev + 1);
      } else {
        // Reset after a delay
        setTimeout(() => {
          setMessages([]);
          setCurrentStep(0);
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [currentStep]);

  const getVerdictIcon = (verdict?: string) => {
    switch (verdict) {
      case 'true':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'false':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'misleading':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getVerdictColor = (verdict?: string) => {
    switch (verdict) {
      case 'true':
        return 'border-green-500/30 bg-green-500/10';
      case 'false':
        return 'border-red-500/30 bg-red-500/10';
      case 'misleading':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-purple-500/30 bg-purple-500/10';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-sm text-gray-400">TruthSense AI Demo</span>
        </div>

        <div className="space-y-4 h-80 overflow-y-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`rounded-2xl p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : `${getVerdictColor(message.verdict)}`
                  }`}>
                    <p className="text-sm text-gray-100 leading-relaxed">
                      {message.content}
                    </p>
                    
                    {message.verdict && message.confidence && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {getVerdictIcon(message.verdict)}
                          <span className="text-xs font-medium capitalize">
                            {message.verdict}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {message.confidence}% confidence
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Demo starting...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSimulation;