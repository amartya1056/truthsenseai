import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Film,
  FileText,
  Activity,
  Target,
  Search,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import { VideoFrameAnalysis, FrameAnalysis } from '../../services/frameAnalysisService';

interface FrameAnalysisDisplayProps {
  analysis: VideoFrameAnalysis;
  videoTitle: string;
}

const FrameAnalysisDisplay: React.FC<FrameAnalysisDisplayProps> = ({ analysis, videoTitle }) => {
  const [expandedFrame, setExpandedFrame] = useState<number | null>(null);
  const [showAllFrames, setShowAllFrames] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'findings' | 'frames'>('overview');

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'clean':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'suspicious':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'manipulated':
        return <XCircle className="w-5 h-5 text-orange-400" />;
      case 'deepfake':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Eye className="w-5 h-5 text-gray-400" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'clean':
        return 'border-green-500/30 bg-green-500/10 text-green-300';
      case 'suspicious':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
      case 'manipulated':
        return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
      case 'deepfake':
        return 'border-red-500/30 bg-red-500/10 text-red-300';
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-300';
    }
  };

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const displayedFrames = showAllFrames 
    ? analysis.suspiciousFrames 
    : analysis.suspiciousFrames.slice(0, 3);

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Video Narrative */}
      {analysis.videoNarrative && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Film className="w-5 h-5 text-blue-400 mr-2" />
            Professional Video Narrative Analysis
          </h4>
          
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h5 className="font-medium text-green-300 mb-2">Beginning Sequence Analysis</h5>
              <p className="text-gray-300 text-sm leading-relaxed">{analysis.videoNarrative.beginning}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h5 className="font-medium text-blue-300 mb-2">Middle Development Analysis</h5>
              <p className="text-gray-300 text-sm leading-relaxed">{analysis.videoNarrative.middle}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h5 className="font-medium text-purple-300 mb-2">Conclusion Analysis</h5>
              <p className="text-gray-300 text-sm leading-relaxed">{analysis.videoNarrative.end}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Moments */}
      {analysis.videoNarrative?.keyMoments && analysis.videoNarrative.keyMoments.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 text-yellow-400 mr-2" />
            Key Moments Identified
          </h4>
          
          <div className="space-y-3">
            {analysis.videoNarrative.keyMoments.slice(0, 6).map((moment, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-yellow-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-300 font-medium text-sm">
                    {formatTimestamp(moment.timestamp)}
                  </span>
                  <span className="text-xs text-gray-500">Key Event #{index + 1}</span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{moment.description}</p>
                <p className="text-gray-400 text-xs">{moment.significance}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {analysis.totalFrames}
          </div>
          <div className="text-xs text-gray-400">Total Frames</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400 mb-1">
            {analysis.suspiciousFrames.length}
          </div>
          <div className="text-xs text-gray-400">Suspicious</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {analysis.overallConfidence}%
          </div>
          <div className="text-xs text-gray-400">Confidence</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {analysis.videoNarrative?.keyMoments?.length || 0}
          </div>
          <div className="text-xs text-gray-400">Key Events</div>
        </div>
      </div>
    </div>
  );

  // Comprehensive Analysis Tab Component
  const AnalysisTab = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 text-purple-400 mr-2" />
        Comprehensive Professional Analysis
      </h4>
      
      {analysis.comprehensiveAnalysis && (
        <div className="space-y-4">
          {/* Overall Assessment */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-blue-300 mb-3">Overall Professional Assessment</h5>
            <p className="text-gray-300 text-sm leading-relaxed">
              {analysis.comprehensiveAnalysis.overallAssessment}
            </p>
          </div>
          
          {/* Technical Findings */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-green-300 mb-3">Technical Findings</h5>
            <ul className="space-y-2">
              {analysis.comprehensiveAnalysis.technicalFindings.map((finding, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Content Analysis */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-yellow-300 mb-3">Content Analysis</h5>
            <ul className="space-y-2">
              {analysis.comprehensiveAnalysis.contentAnalysis.map((content, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  {content}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Authenticity Indicators */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-purple-300 mb-3">Authenticity Indicators</h5>
            <ul className="space-y-2">
              {analysis.comprehensiveAnalysis.authenticityIndicators.map((indicator, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Professional Observations */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-cyan-300 mb-3">Professional Observations</h5>
            <ul className="space-y-2">
              {analysis.comprehensiveAnalysis.professionalObservations.map((observation, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  {observation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Findings Tab Component
  const FindingsTab = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Search className="w-5 h-5 text-purple-400 mr-2" />
        Detailed Forensic Findings
      </h4>
      
      {analysis.detailedFindings && (
        <div className="space-y-4">
          {/* Authenticity Assessment */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-green-300 mb-3">Authenticity Assessment</h5>
            <p className="text-gray-300 text-sm leading-relaxed">
              {analysis.detailedFindings.authenticityAssessment}
            </p>
          </div>
          
          {/* Manipulation Indicators */}
          {analysis.detailedFindings.manipulationIndicators.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h5 className="font-semibold text-red-300 mb-3">Manipulation Indicators</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.detailedFindings.manipulationIndicators.map((indicator, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-300"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Quality Analysis */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-blue-300 mb-3">Quality Analysis</h5>
            <p className="text-gray-300 text-sm leading-relaxed">
              {analysis.detailedFindings.qualityAnalysis}
            </p>
          </div>
          
          {/* Consistency Check */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-yellow-300 mb-3">Consistency Check</h5>
            <p className="text-gray-300 text-sm leading-relaxed">
              {analysis.detailedFindings.consistencyCheck}
            </p>
          </div>
          
          {/* Expert Observations */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h5 className="font-semibold text-purple-300 mb-3">Expert Observations</h5>
            <ul className="space-y-2">
              {analysis.detailedFindings.expertObservations.map((observation, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  {observation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced Frames Tab Component with detailed analysis
  const FramesTab = () => (
    <div className="space-y-4">
      {analysis.suspiciousFrames.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-white flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2" />
              Suspicious Frames Detected
            </h4>
            
            {analysis.suspiciousFrames.length > 3 && (
              <button
                onClick={() => setShowAllFrames(!showAllFrames)}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center"
              >
                {showAllFrames ? 'Show Less' : `Show All ${analysis.suspiciousFrames.length}`}
                {showAllFrames ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {displayedFrames.map((frame, index) => (
                <motion.div
                  key={frame.frameNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-700/30 rounded-lg border border-gray-600/50 overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                    onClick={() => setExpandedFrame(
                      expandedFrame === frame.frameNumber ? null : frame.frameNumber
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                          {frame.base64Data ? (
                            <img 
                              src={frame.base64Data} 
                              alt={`Frame ${frame.frameNumber}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">
                              Frame {frame.frameNumber}
                            </span>
                            <div className="flex items-center space-x-1 text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span className="text-sm">{formatTimestamp(frame.timestamp)}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {frame.issues.length > 0 ? frame.issues.join(', ') : 'Suspicious content detected'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-400">
                            {frame.confidence}% confidence
                          </div>
                          <div className="text-xs text-gray-500">
                            {frame.issues.length} issues
                          </div>
                        </div>
                        
                        {expandedFrame === frame.frameNumber ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedFrame === frame.frameNumber && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-600/50"
                      >
                        <div className="p-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Frame Preview */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-3">Frame Preview</h5>
                              <div className="bg-gray-800 rounded-lg p-3">
                                {frame.base64Data ? (
                                  <img 
                                    src={frame.base64Data} 
                                    alt={`Frame ${frame.frameNumber}`}
                                    className="w-full h-40 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-full h-40 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Professional Analysis Details */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-3">Professional Analysis</h5>
                              <div className="space-y-4">
                                <div className="text-sm">
                                  <span className="text-gray-400 font-medium">Scene Description:</span>
                                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                                    {frame.sceneDescription}
                                  </p>
                                </div>
                                
                                <div className="text-sm">
                                  <span className="text-gray-400 font-medium">Technical Quality:</span>
                                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                                    {frame.technicalQuality}
                                  </p>
                                </div>
                                
                                <div className="text-sm">
                                  <span className="text-gray-400 font-medium">Contextual Significance:</span>
                                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                                    {frame.contextualSignificance}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Detailed Analysis Section */}
                          <div className="mt-6 pt-4 border-t border-gray-600/50">
                            <h5 className="text-sm font-medium text-gray-300 mb-3">Detailed Professional Analysis</h5>
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {frame.detailedAnalysis}
                              </p>
                            </div>
                          </div>
                          
                          {/* Quality Metrics */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-300 mb-3">Quality Metrics</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <span className="text-xs text-gray-400">Sharpness:</span>
                                <p className="text-xs text-gray-300 mt-1">{frame.qualityMetrics.sharpness}</p>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <span className="text-xs text-gray-400">Lighting:</span>
                                <p className="text-xs text-gray-300 mt-1">{frame.qualityMetrics.lighting}</p>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <span className="text-xs text-gray-400">Color Consistency:</span>
                                <p className="text-xs text-gray-300 mt-1">{frame.qualityMetrics.colorConsistency}</p>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <span className="text-xs text-gray-400">Compression:</span>
                                <p className="text-xs text-gray-300 mt-1">{frame.qualityMetrics.compressionArtifacts}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Forensic Observations */}
                          {frame.forensicObservations.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-300 mb-3">Forensic Observations</h5>
                              <ul className="space-y-1">
                                {frame.forensicObservations.map((observation, i) => (
                                  <li key={i} className="text-xs text-gray-300 flex items-start">
                                    <span className="text-blue-400 mr-2">•</span>
                                    {observation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Issues Detected */}
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-300 mb-3">Issues Detected</h5>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              {frame.issues.length > 0 ? (
                                <ul className="list-disc list-inside text-red-300 space-y-1">
                                  {frame.issues.map((issue, i) => (
                                    <li key={i} className="text-xs">{issue}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-gray-500 text-xs">No technical issues detected</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-white mb-2">
            Clean Video Detected
          </h4>
          <p className="text-gray-400">
            No suspicious content, manipulation, or deepfake indicators found in any frame through professional analysis.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {getVerdictIcon(analysis.overallVerdict)}
            <div className="absolute inset-0 blur-md opacity-30">
              {getVerdictIcon(analysis.overallVerdict)}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Professional Frame-by-Frame Analysis
            </h3>
            <p className="text-sm text-gray-400">
              {videoTitle}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getVerdictColor(analysis.overallVerdict)}`}>
          {analysis.overallVerdict.toUpperCase()}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-xl border border-gray-600 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'analysis', label: 'Analysis', icon: Activity },
          { id: 'findings', label: 'Findings', icon: Search },
          { id: 'frames', label: `Frames (${analysis.suspiciousFrames.length})`, icon: ImageIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'analysis' && <AnalysisTab />}
        {activeTab === 'findings' && <FindingsTab />}
        {activeTab === 'frames' && <FramesTab />}
      </motion.div>
    </div>
  );
};

export default FrameAnalysisDisplay;