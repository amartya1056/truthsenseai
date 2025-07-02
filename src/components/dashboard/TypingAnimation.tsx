import React from 'react';

interface TypingAnimationProps {
  content: string;
  speed?: number;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ content }) => {
  const formatContent = (text: string) => {
    // Format bold text
    return text.split('**').map((part, index) => 
      index % 2 === 1 ? (
        <strong key={index} className="font-semibold text-white">
          {part}
        </strong>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const renderStructuredContent = () => {
    const lines = content.split('\n').filter(line => line.trim());
    
    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          
          // Main headers (###)
          if (trimmedLine.startsWith('###')) {
            return (
              <div
                key={index}
                className="text-lg font-bold text-white mt-6 mb-3 flex items-center"
              >
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-3"></div>
                {formatContent(trimmedLine.replace(/^###\s*/, ''))}
              </div>
            );
          }
          
          // Sub headers (##)
          if (trimmedLine.startsWith('##')) {
            return (
              <div
                key={index}
                className="text-base font-semibold text-purple-300 mt-4 mb-2"
              >
                {formatContent(trimmedLine.replace(/^##\s*/, ''))}
              </div>
            );
          }
          
          // Numbered points
          if (/^\d+\.\s/.test(trimmedLine)) {
            return (
              <div
                key={index}
                className="flex items-start space-x-3 py-2"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
                  {trimmedLine.match(/^(\d+)/)?.[1]}
                </div>
                <div className="text-gray-100 leading-relaxed">
                  {formatContent(trimmedLine.replace(/^\d+\.\s*/, ''))}
                </div>
              </div>
            );
          }
          
          // Bullet points
          if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
            return (
              <div
                key={index}
                className="flex items-start space-x-3 py-1 ml-4"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div className="text-gray-200 leading-relaxed">
                  {formatContent(trimmedLine.replace(/^[•\-]\s*/, ''))}
                </div>
              </div>
            );
          }
          
          // Bold sections (**text**)
          if (trimmedLine.includes('**') && !trimmedLine.startsWith('**')) {
            return (
              <div
                key={index}
                className="text-gray-100 leading-relaxed py-1"
              >
                {formatContent(trimmedLine)}
              </div>
            );
          }
          
          // Key-value pairs (Key: Value)
          if (trimmedLine.includes(':') && trimmedLine.split(':').length === 2) {
            const [key, value] = trimmedLine.split(':');
            return (
              <div
                key={index}
                className="flex items-start space-x-2 py-1 bg-gray-800/30 rounded-lg px-3"
              >
                <span className="font-medium text-purple-300 min-w-0 flex-shrink-0">
                  {key.trim()}:
                </span>
                <span className="text-gray-100">
                  {formatContent(value.trim())}
                </span>
              </div>
            );
          }
          
          // Regular paragraphs
          if (trimmedLine.length > 0) {
            return (
              <div
                key={index}
                className="text-gray-100 leading-relaxed py-1"
              >
                {formatContent(trimmedLine)}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="text-gray-100 leading-relaxed">
      {renderStructuredContent()}
    </div>
  );
};

export default TypingAnimation;