import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Film, 
  Newspaper, 
  Video, 
  GraduationCap, 
  Smile,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Users,
  Calendar,
  Eye,
  ThumbsUp,
  MessageCircle,
  Star
} from 'lucide-react';
import { ContentAnalysisResult } from '../../services/contentAnalysisService';

interface RichContentDisplayProps {
  analysis: ContentAnalysisResult;
  videoUrl?: string;
}

const RichContentDisplay: React.FC<RichContentDisplayProps> = ({ analysis, videoUrl }) => {
  const [showFullTable, setShowFullTable] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'song':
        return <Music className="w-6 h-6 text-purple-400" />;
      case 'movie':
        return <Film className="w-6 h-6 text-blue-400" />;
      case 'news':
        return <Newspaper className="w-6 h-6 text-red-400" />;
      case 'vlog':
        return <Video className="w-6 h-6 text-green-400" />;
      case 'educational':
        return <GraduationCap className="w-6 h-6 text-yellow-400" />;
      case 'documentary':
        return <Newspaper className="w-6 h-6 text-orange-400" />;
      default:
        return <Smile className="w-6 h-6 text-pink-400" />;
    }
  };

  const getContentColor = (contentType: string) => {
    switch (contentType) {
      case 'song':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'movie':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'news':
        return 'border-red-500/30 bg-red-500/10';
      case 'vlog':
        return 'border-green-500/30 bg-green-500/10';
      case 'educational':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'documentary':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-pink-500/30 bg-pink-500/10';
    }
  };

  const getCredibilityColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const displayedTableEntries = showFullTable 
    ? Object.entries(analysis.tableData || {})
    : Object.entries(analysis.tableData || {}).slice(0, 6);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {getContentIcon(analysis.contentType)}
            <div className="absolute inset-0 blur-md opacity-30">
              {getContentIcon(analysis.contentType)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Rich Content Analysis
            </h3>
            <p className="text-sm text-gray-400 capitalize">
              {analysis.contentType} Content
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getContentColor(analysis.contentType)} text-white`}>
          {analysis.contentType.toUpperCase()}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed">
          {analysis.summary}
        </p>
      </div>

      {/* Key Information Table */}
      {analysis.tableData && Object.keys(analysis.tableData).length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-white flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-2" />
              Key Information
            </h4>
            
            {Object.keys(analysis.tableData).length > 6 && (
              <button
                onClick={() => setShowFullTable(!showFullTable)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center"
              >
                {showFullTable ? 'Show Less' : `Show All ${Object.keys(analysis.tableData).length}`}
                {showFullTable ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <AnimatePresence>
              {displayedTableEntries.map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50"
                >
                  <div className="text-sm text-gray-400 mb-1">{key}</div>
                  <div className="text-white font-medium">{value}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Popularity Metrics */}
      {analysis.richAnalysis.popularity && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center">
            <Eye className="w-4 h-4 text-blue-400 mr-2" />
            Popularity & Impact
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
              <div className="text-lg font-bold text-blue-400 mb-1">
                {analysis.richAnalysis.popularity.views}
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center">
                <Eye className="w-3 h-3 mr-1" />
                Views
              </div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
              <div className="text-lg font-bold text-green-400 mb-1">
                {analysis.richAnalysis.popularity.viralityScore}/100
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center">
                <Star className="w-3 h-3 mr-1" />
                Virality
              </div>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4 text-center border border-gray-600/50">
              <div className="text-lg font-bold text-purple-400 mb-1">
                {analysis.richAnalysis.popularity.commentSentiment.split(' ')[0]}
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center">
                <MessageCircle className="w-3 h-3 mr-1" />
                Sentiment
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credibility & Misinformation Assessment */}
      {(analysis.richAnalysis.credibilityScore !== undefined || 
        (analysis.richAnalysis.misinformationFlags && analysis.richAnalysis.misinformationFlags.length > 0)) && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center">
            <Users className="w-4 h-4 text-orange-400 mr-2" />
            Credibility Assessment
          </h4>
          
          <div className="space-y-3">
            {analysis.richAnalysis.credibilityScore !== undefined && (
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Credibility Score</span>
                  <span className={`font-bold ${getCredibilityColor(analysis.richAnalysis.credibilityScore)}`}>
                    {analysis.richAnalysis.credibilityScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      analysis.richAnalysis.credibilityScore >= 80 ? 'bg-green-500' :
                      analysis.richAnalysis.credibilityScore >= 60 ? 'bg-yellow-500' :
                      analysis.richAnalysis.credibilityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.richAnalysis.credibilityScore}%` }}
                  />
                </div>
              </div>
            )}
            
            {analysis.richAnalysis.misinformationFlags && analysis.richAnalysis.misinformationFlags.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="text-sm font-medium text-red-300 mb-2">Misinformation Flags</div>
                <div className="flex flex-wrap gap-2">
                  {analysis.richAnalysis.misinformationFlags.map((flag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-300"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fact Check Results */}
      {analysis.richAnalysis.factCheckResults && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center">
            <Newspaper className="w-4 h-4 text-green-400 mr-2" />
            Fact Check Results
          </h4>
          
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300">Verdict</span>
              <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                analysis.richAnalysis.factCheckResults.verdict === 'true' ? 'bg-green-500/20 text-green-300' :
                analysis.richAnalysis.factCheckResults.verdict === 'false' ? 'bg-red-500/20 text-red-300' :
                analysis.richAnalysis.factCheckResults.verdict === 'misleading' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {analysis.richAnalysis.factCheckResults.verdict.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300">Confidence</span>
              <span className="text-white font-medium">
                {analysis.richAnalysis.factCheckResults.confidence}%
              </span>
            </div>
            
            {analysis.richAnalysis.factCheckResults.sources.length > 0 && (
              <div>
                <span className="text-gray-300 text-sm">Sources Used:</span>
                <div className="mt-2 space-y-1">
                  {analysis.richAnalysis.factCheckResults.sources.map((source, index) => (
                    <div key={index} className="text-xs text-purple-300">
                      • {source}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white flex items-center">
            <GraduationCap className="w-4 h-4 text-cyan-400 mr-2" />
            Detailed Analysis
          </h4>
          
          <button
            onClick={() => setShowFullAnalysis(!showFullAnalysis)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center"
          >
            {showFullAnalysis ? 'Show Less' : 'Show More'}
            {showFullAnalysis ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ height: showFullAnalysis ? 'auto' : '100px', opacity: 1 }}
            animate={{ height: showFullAnalysis ? 'auto' : '100px', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
              <div className={`text-gray-300 leading-relaxed whitespace-pre-line ${!showFullAnalysis ? 'line-clamp-4' : ''}`}>
                {analysis.formattedAnalysis}
              </div>
              
              {!showFullAnalysis && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-700/30 to-transparent pointer-events-none" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* External Link */}
      {videoUrl && (
        <div className="mt-6 pt-4 border-t border-gray-600/30">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">View Original Video</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default RichContentDisplay;