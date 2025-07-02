import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Image, FileText, Menu, Bot, User, CheckCircle, XCircle, AlertTriangle, ExternalLink, Youtube, Play, ThumbsUp, ThumbsDown, MessageCircle, Download, Loader, Brain, Eye, Zap, Music, Film, Newspaper } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { formatFileSize } from '../../services/videoDownloadService';
import { isYouTubeShort } from '../../services/youtubeService';
import FrameAnalysisDisplay from './FrameAnalysisDisplay';
import RichContentDisplay from './RichContentDisplay';
import TypingAnimation from './TypingAnimation';
import VerdictAnimation from './VerdictAnimation';

interface ChatInterfaceProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sidebarOpen, onToggleSidebar }) => {
  const { currentChat, sendMessage, isLoading, getCurrentContext } = useChat();
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAnalyzingMessage, setShowAnalyzingMessage] = useState(false);
  const [showVerdictAnimation, setShowVerdictAnimation] = useState(false);
  const [pendingVerdict, setPendingVerdict] = useState<{
    verdict: 'true' | 'false' | 'misleading' | 'unverifiable';
    confidence: number;
  } | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<{
    message: string;
    files: File[];
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && selectedFiles.length === 0) return;

    // Store the pending analysis
    setPendingAnalysis({
      message: message,
      files: [...selectedFiles]
    });

    // Step 1: Show "Analyzing the Information" message immediately
    setShowAnalyzingMessage(true);

    // Clear form immediately
    const currentMessage = message;
    const currentFiles = [...selectedFiles];
    setMessage('');
    setSelectedFiles([]);

    // Step 2: Perform actual analysis in background
    try {
      const result = await sendMessage(currentMessage, currentFiles);
      
      // Step 3: Immediately transition to verdict animation when analysis completes
      if (result && result.verdict) {
        setPendingVerdict({
          verdict: result.verdict,
          confidence: result.confidence || 75
        });
        
        // Immediately hide analyzing message and show verdict animation
        setShowAnalyzingMessage(false);
        setShowVerdictAnimation(true);
      } else {
        // Fallback if no result yet
        setPendingVerdict({
          verdict: 'unverifiable',
          confidence: 0
        });
        
        setShowAnalyzingMessage(false);
        setShowVerdictAnimation(true);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setPendingVerdict({
        verdict: 'unverifiable',
        confidence: 0
      });
      
      setShowAnalyzingMessage(false);
      setShowVerdictAnimation(true);
    }
  };

  // Listen for new messages to update verdict animation with actual results
  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      
      // If we have a pending analysis and the last message is an AI response with verdict
      if (pendingAnalysis && lastMessage.type === 'ai' && lastMessage.verdict && showVerdictAnimation) {
        // Update the verdict animation with actual results immediately
        setPendingVerdict({
          verdict: lastMessage.verdict,
          confidence: lastMessage.confidence || 75
        });
      }
    }
  }, [currentChat?.messages, pendingAnalysis, showVerdictAnimation]);

  const handleVerdictAnimationComplete = () => {
    setShowVerdictAnimation(false);
    setPendingVerdict(null);
    setPendingAnalysis(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getVerdictIcon = (verdict?: string) => {
    switch (verdict) {
      case 'true':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'false':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'misleading':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'unverifiable':
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
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
      case 'unverifiable':
        return 'border-gray-500/30 bg-gray-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getVerdictLabel = (verdict?: string) => {
    switch (verdict) {
      case 'true':
        return 'TRUE';
      case 'false':
        return 'FALSE';
      case 'misleading':
        return 'MISLEADING';
      case 'unverifiable':
        return 'UNVERIFIABLE';
      default:
        return 'ANALYSIS COMPLETE';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment.includes('positive')) return <ThumbsUp className="w-4 h-4 text-green-400" />;
    if (sentiment.includes('negative')) return <ThumbsDown className="w-4 h-4 text-red-400" />;
    return <MessageCircle className="w-4 h-4 text-gray-400" />;
  };

  const getDownloadStatusIcon = (progress?: any) => {
    if (!progress) return null;
    
    switch (progress.status) {
      case 'downloading':
      case 'processing':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'extracting_frames':
        return <Eye className="w-4 h-4 text-purple-400 animate-pulse" />;
      case 'analyzing_frames':
        return <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Download className="w-4 h-4 text-gray-400" />;
    }
  };

  const getContentTypeIcon = (contentType?: string) => {
    switch (contentType) {
      case 'song':
        return <Music className="w-4 h-4 text-purple-400" />;
      case 'movie':
        return <Film className="w-4 h-4 text-blue-400" />;
      case 'news':
        return <Newspaper className="w-4 h-4 text-red-400" />;
      default:
        return <Youtube className="w-4 h-4 text-red-400" />;
    }
  };

  // Get current context for display
  const currentContext = getCurrentContext();
  const hasContext = currentContext.userQueries.length > 0 || 
                    currentContext.analyzedVideos.length > 0 || 
                    currentContext.analyzedDocuments.length > 0;

  const exampleQueries = [
    "Is Donald Trump the current president of the United States?",
    "Is climate change caused by human activities?",
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/abc123def456" // Example Short URL
  ];

  const contextualQueries = [
    "What did the transcript say about this topic?",
    "Is the speaker in the video credible?",
    "How does this relate to what we discussed earlier?",
    "Can you summarize the key points from our conversation?"
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Analyzing Message Overlay */}
      <AnimatePresence>
        {showAnalyzingMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 max-w-md mx-4 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 mx-auto mb-4"
              >
                <Brain className="w-full h-full text-purple-400" />
              </motion.div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                Analyzing the Information
              </h3>
              
              <p className="text-gray-400 text-sm">
                {pendingAnalysis && (pendingAnalysis.message.includes('youtube.com') || pendingAnalysis.message.includes('youtu.be'))
                  ? (isYouTubeShort(pendingAnalysis.message) ? 'Preparing comprehensive Short analysis...' : 'Preparing comprehensive video analysis...')
                  : hasContext 
                    ? 'Reviewing conversation context...'
                    : 'Fetching live news data...'}
              </p>
              
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verdict Animation Overlay */}
      {pendingVerdict && (
        <VerdictAnimation
          verdict={pendingVerdict.verdict}
          confidence={pendingVerdict.confidence}
          isVisible={showVerdictAnimation}
          onComplete={handleVerdictAnimationComplete}
        />
      )}

      {/* Header */}
      <header className="bg-gray-950/80 backdrop-blur-md border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-white">
              {currentChat?.title || 'TruthSense AI'}
            </h1>
            {hasContext && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Context Active</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Rich Analysis Ready</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {!currentChat?.messages.length ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-2xl">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to TruthSense AI
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                I analyze claims using <strong>live news data</strong> from MediaStack and SerpAPI, 
                plus <strong>comprehensive YouTube analysis</strong> with frame-by-frame deepfake detection 
                and rich content analysis for songs, movies, and news. 
                I maintain <strong>conversation memory</strong> to answer follow-up questions about previous content.
                <br /><br />
                <strong>Now supports YouTube Shorts!</strong> Analyze short-form content with the same comprehensive analysis.
              </p>
              
              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {exampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(query)}
                    className="p-4 text-left bg-gray-800/30 border border-gray-700/50 rounded-xl hover:border-purple-500/30 hover:bg-gray-800/50 transition-all text-gray-300 hover:text-white"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {query.includes('youtube.com') || query.includes('youtu.be') ? (
                        <div className="flex items-center space-x-1">
                          <Youtube className="w-4 h-4 text-red-400" />
                          {query.includes('/shorts/') && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-1 rounded">SHORT</span>
                          )}
                        </div>
                      ) : (
                        <FileText className="w-4 h-4 text-blue-400" />
                      )}
                      <span className="text-xs font-medium text-gray-500">
                        {query.includes('youtube.com') || query.includes('youtu.be') ? 
                          (query.includes('/shorts/') ? 'YouTube Short Analysis' : 'Rich Video Analysis') : 
                          'Fact Check'}
                      </span>
                    </div>
                    <span className="text-sm">{query}</span>
                  </button>
                ))}
              </div>

              {hasContext && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Brain className="w-5 h-5 text-purple-400 mr-2" />
                    Contextual Questions
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Ask follow-up questions about our previous conversation:
                  </p>
                  <div className="grid gap-2">
                    {contextualQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(query)}
                        className="p-3 text-left bg-purple-800/20 border border-purple-500/20 rounded-lg hover:border-purple-500/40 hover:bg-purple-800/30 transition-all text-gray-300 hover:text-white text-sm"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <AnimatePresence>
              {currentChat.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${
                    msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}>
                      {msg.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    <div className={`rounded-2xl p-4 ${
                      msg.type === 'user'
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : `${getVerdictColor(msg.verdict)} border`
                    }`}>
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {msg.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 bg-gray-700/50 rounded-lg p-2 text-sm"
                            >
                              {attachment.type === 'image' ? (
                                <Image className="w-4 h-4 text-blue-400" />
                              ) : attachment.type === 'youtube' ? (
                                <div className="flex items-center space-x-1">
                                  <Youtube className="w-4 h-4 text-red-400" />
                                  {attachment.url && isYouTubeShort(attachment.url) && (
                                    <span className="text-xs bg-red-500/20 text-red-300 px-1 rounded">SHORT</span>
                                  )}
                                </div>
                              ) : (
                                <FileText className="w-4 h-4 text-green-400" />
                              )}
                              <span className="text-gray-300 truncate max-w-32">
                                {attachment.name}
                              </span>
                              {attachment.extractedText && (
                                <span className="text-xs text-gray-500">(Text extracted)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* AI Response */}
                      {msg.type === 'ai' ? (
                        <TypingAnimation content={msg.content} />
                      ) : (
                        <div className="text-gray-100 leading-relaxed">
                          {msg.content.split('**').map((part, index) => 
                            index % 2 === 1 ? (
                              <strong key={index} className="font-semibold text-white">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </div>
                      )}
                      
                      {/* Rich Content Analysis Display */}
                      {msg.type === 'ai' && msg.contentAnalysis && (
                        <div className="mt-4 pt-4 border-t border-gray-600/30">
                          <RichContentDisplay 
                            analysis={msg.contentAnalysis}
                            videoUrl={msg.videoAnalysis?.videoUrl}
                          />
                        </div>
                      )}
                      
                      {/* YouTube Video/Short Analysis */}
                      {msg.type === 'ai' && msg.videoAnalysis && (
                        <div className="mt-4 pt-4 border-t border-gray-600/30">
                          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                            <div className="flex items-start space-x-3">
                              {msg.videoAnalysis.thumbnailUrl && (
                                <img 
                                  src={msg.videoAnalysis.thumbnailUrl} 
                                  alt="Video thumbnail"
                                  className="w-20 h-15 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  {msg.contentAnalysis && getContentTypeIcon(msg.contentAnalysis.contentType)}
                                  {msg.videoAnalysis.videoUrl && isYouTubeShort(msg.videoAnalysis.videoUrl) && (
                                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">
                                      SHORT
                                    </span>
                                  )}
                                  <h4 className="font-semibold text-white line-clamp-2">
                                    {msg.videoAnalysis.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-400 mb-2">
                                  by {msg.videoAnalysis.channel}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    {getSentimentIcon(msg.videoAnalysis.sentimentOverall)}
                                    <span>Comments: {msg.videoAnalysis.sentimentOverall}</span>
                                  </div>
                                  {msg.videoAnalysis.videoUrl && (
                                    <a 
                                      href={msg.videoAnalysis.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                                    >
                                      <Play className="w-3 h-3" />
                                      <span>{isYouTubeShort(msg.videoAnalysis.videoUrl) ? 'Watch Short' : 'Watch'}</span>
                                    </a>
                                  )}
                                </div>
                                
                                {/* Download Progress */}
                                {msg.videoAnalysis.downloadProgress && (
                                  <div className="mt-3 p-2 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-1">
                                      {getDownloadStatusIcon(msg.videoAnalysis.downloadProgress)}
                                      <span className="text-xs text-gray-300">
                                        {msg.videoAnalysis.downloadProgress.message}
                                      </span>
                                    </div>
                                    {msg.videoAnalysis.downloadProgress.status !== 'complete' && 
                                     msg.videoAnalysis.downloadProgress.status !== 'error' && (
                                      <div className="w-full bg-gray-600 rounded-full h-1">
                                        <div 
                                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                          style={{ width: `${msg.videoAnalysis.downloadProgress.progress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Download Complete */}
                                {msg.videoAnalysis.downloadPath && (
                                  <div className="mt-2 text-xs text-green-400">
                                    ✓ {isYouTubeShort(msg.videoAnalysis.videoUrl || '') ? 'Short' : 'Video'} saved to library with comprehensive analysis
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-300 mb-3">
                            <strong>Transcript Highlights:</strong>
                            <p className="mt-1 text-gray-400 italic">
                              "{msg.videoAnalysis.transcriptHighlights}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Frame Analysis Display */}
                      {msg.type === 'ai' && msg.frameAnalysis && (
                        <div className="mt-4 pt-4 border-t border-gray-600/30">
                          <FrameAnalysisDisplay 
                            analysis={msg.frameAnalysis}
                            videoTitle={msg.videoAnalysis?.title || 'YouTube Content'}
                          />
                        </div>
                      )}
                      
                      {/* AI Response Details */}
                      {msg.type === 'ai' && msg.verdict && (
                        <div className="mt-4 pt-4 border-t border-gray-600/30">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getVerdictIcon(msg.verdict)}
                              <span className="text-sm font-bold text-white">
                                {getVerdictLabel(msg.verdict)}
                              </span>
                            </div>
                            {msg.confidence !== undefined && msg.confidence > 0 && (
                              <span className="text-sm text-gray-400">
                                {msg.confidence}% confidence
                              </span>
                            )}
                          </div>
                          
                          {msg.sources && msg.sources.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Live Sources Used:</h4>
                              <div className="space-y-2">
                                {msg.sources.map((source, index) => (
                                  <a
                                    key={index}
                                    href={source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-xs px-3 py-2 bg-gray-700/50 rounded-lg text-purple-300 hover:text-purple-200 hover:bg-gray-700/70 transition-all group"
                                  >
                                    <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                    <span className="truncate flex-1">{new URL(source).hostname.replace('www.', '')}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && !showVerdictAnimation && !showAnalyzingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-3xl">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        <motion.div 
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {pendingAnalysis && (pendingAnalysis.message.includes('youtube.com') || pendingAnalysis.message.includes('youtu.be'))
                          ? (isYouTubeShort(pendingAnalysis.message) ? 'Performing comprehensive Short analysis...' : 'Performing comprehensive video analysis...') 
                          : hasContext 
                            ? 'Analyzing with conversation memory...'
                            : 'Fetching live news data...'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {pendingAnalysis && (pendingAnalysis.message.includes('youtube.com') || pendingAnalysis.message.includes('youtu.be')) ? (
                        <>
                          • {isYouTubeShort(pendingAnalysis.message) ? 'Downloading Short with yt-dlp' : 'Downloading video with yt-dlp'}<br/>
                          • Extracting frames (optimized for {isYouTubeShort(pendingAnalysis.message) ? 'short-form content' : 'long-form content'})<br/>
                          • Analyzing each frame with Gemini Vision<br/>
                          • Detecting deepfakes and manipulation<br/>
                          • Performing rich content analysis (songs, movies, news)<br/>
                          • Cross-referencing with conversation context<br/>
                          • Evaluating claims with live news data
                        </>
                      ) : hasContext ? (
                        <>
                          • Reviewing conversation history<br/>
                          • Referencing previous analysis<br/>
                          • Querying live news sources<br/>
                          • Maintaining context consistency
                        </>
                      ) : (
                        <>
                          • Querying MediaStack API for recent articles<br/>
                          • Searching SerpAPI for fact-checks<br/>
                          • Analyzing with Gemini AI
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="max-w-4xl mx-auto">
          {selectedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-800/50 border border-gray-700 rounded-lg p-2 text-sm"
                >
                  {file.type.startsWith('image/') ? (
                    <Image className="w-4 h-4 text-blue-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-gray-300 truncate max-w-32">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-700/50"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx"
                className="hidden"
              />
              
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={hasContext 
                    ? "Ask a follow-up question about our conversation, or paste a YouTube URL (including Shorts) for comprehensive analysis..."
                    : "Ask me to fact-check any claim or paste a YouTube URL (including Shorts) for rich content analysis..."
                  }
                  rows={1}
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none max-h-32"
                  style={{ minHeight: '24px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={(!message.trim() && selectedFiles.length === 0) || isLoading || showVerdictAnimation || showAnalyzingMessage}
                className="flex-shrink-0 p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            TruthSense AI uses comprehensive video analysis, frame-by-frame detection, rich content analysis, live data from MediaStack, SerpAPI, and YouTube API. 
            Now supports YouTube Shorts with optimized analysis for short-form content.
            {hasContext && " I remember our conversation for contextual follow-up questions."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;