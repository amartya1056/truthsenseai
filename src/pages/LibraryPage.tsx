import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Camera, Video, ArrowLeft, FolderOpen, Play, Download, Search, Trash2, ExternalLink, Music, Film, Newspaper, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadVideos, loadPhotos, deleteVideo, deletePhoto, getLibraryStats, StoredVideo, StoredPhoto, searchVideos, searchPhotos } from '../services/storageService';
import { formatFileSize } from '../services/videoDownloadService';

const LibraryPage: React.FC = () => {
  const [videos, setVideos] = useState<StoredVideo[]>([]);
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'photos'>('overview');
  const [filteredVideos, setFilteredVideos] = useState<StoredVideo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<StoredPhoto[]>([]);
  const [stats, setStats] = useState({
    totalChats: 0,
    totalVideos: 0,
    totalPhotos: 0,
    totalAnalyses: 0,
    misinformationDetected: 0,
    averageConfidence: 0,
    accuracyRate: 98,
    contentTypes: {} as {[key: string]: number},
    frameAnalysisStats: {
      totalAnalyzed: 0,
      suspiciousVideos: 0,
      cleanVideos: 0
    }
  });

  useEffect(() => {
    loadLibraryData();
  }, []);

  useEffect(() => {
    // Update filtered results when search query changes
    if (searchQuery.trim()) {
      setFilteredVideos(searchVideos(searchQuery));
      setFilteredPhotos(searchPhotos(searchQuery));
    } else {
      setFilteredVideos(videos);
      setFilteredPhotos(photos);
    }
  }, [searchQuery, videos, photos]);

  const loadLibraryData = () => {
    const loadedVideos = loadVideos();
    const loadedPhotos = loadPhotos();
    const libraryStats = getLibraryStats();
    
    setVideos(loadedVideos);
    setPhotos(loadedPhotos);
    setFilteredVideos(loadedVideos);
    setFilteredPhotos(loadedPhotos);
    setStats(libraryStats);
  };

  const handleDeleteVideo = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      deleteVideo(videoId);
      loadLibraryData();
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deletePhoto(photoId);
      loadLibraryData();
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'true': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'false': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'misleading': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
        return <Video className="w-4 h-4 text-gray-400" />;
    }
  };

  const getFrameAnalysisIcon = (frameAnalysis?: any) => {
    if (!frameAnalysis) return null;
    
    switch (frameAnalysis.overallVerdict) {
      case 'clean':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'suspicious':
      case 'manipulated':
      case 'deepfake':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Zap className="w-4 h-4 text-gray-400" />;
    }
  };

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Enhanced Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">{stats.totalPhotos}</div>
          <div className="text-gray-400">Photos Analyzed</div>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">{stats.totalVideos}</div>
          <div className="text-gray-400">Videos Downloaded</div>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">{stats.misinformationDetected}</div>
          <div className="text-gray-400">Misinformation Detected</div>
        </div>
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white mb-2">{stats.frameAnalysisStats.totalAnalyzed}</div>
          <div className="text-gray-400">Frame Analyses</div>
        </div>
      </div>

      {/* Content Type Distribution */}
      {Object.keys(stats.contentTypes).length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Content Type Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.contentTypes).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {getContentTypeIcon(type)}
                </div>
                <div className="text-xl font-bold text-white">{count}</div>
                <div className="text-sm text-gray-400 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frame Analysis Stats */}
      {stats.frameAnalysisStats.totalAnalyzed > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            Frame Analysis Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.frameAnalysisStats.totalAnalyzed}</div>
              <div className="text-sm text-gray-400">Total Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.frameAnalysisStats.cleanVideos}</div>
              <div className="text-sm text-gray-400">Clean Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{stats.frameAnalysisStats.suspiciousVideos}</div>
              <div className="text-sm text-gray-400">Suspicious Videos</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Photos</h2>
              <p className="text-gray-400">Analyzed images and deepfake detection results</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {photos.slice(0, 3).map((photo) => (
              <div
                key={photo.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Camera className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm">{photo.name}</h3>
                    <p className="text-xs text-gray-400">
                      {photo.analyzedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVerdictColor(photo.verdict)}`}>
                  {photo.verdict.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setActiveTab('photos')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            <FolderOpen className="w-5 h-5 inline mr-2" />
            View All Photos ({photos.length})
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Videos</h2>
              <p className="text-gray-400">Downloaded YouTube videos with comprehensive analysis</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {videos.slice(0, 3).map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-gray-700">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      {getContentTypeIcon(video.contentAnalysis?.contentType)}
                    </div>
                    <div className="absolute top-1 right-1">
                      {getFrameAnalysisIcon(video.frameAnalysis)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm line-clamp-1">{video.title}</h3>
                    <p className="text-xs text-gray-400">
                      {video.analyzedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVerdictColor(video.verdict)}`}>
                  {video.verdict.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setActiveTab('videos')}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-white font-medium hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
          >
            <FolderOpen className="w-5 h-5 inline mr-2" />
            View All Videos ({videos.length})
          </button>
        </motion.div>
      </div>
    </div>
  );

  const VideosTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Video Library</h2>
        <div className="text-sm text-gray-400">
          {filteredVideos.length} of {videos.length} videos
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all group"
          >
            <div className="relative mb-4">
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <a
                  href={video.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                >
                  <Play className="w-6 h-6" />
                </a>
              </div>
              
              {/* Content Type Badge */}
              <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-black/70 rounded-full">
                {getContentTypeIcon(video.contentAnalysis?.contentType)}
                <span className="text-xs text-white capitalize">
                  {video.contentAnalysis?.contentType || 'video'}
                </span>
              </div>
              
              {/* Frame Analysis Badge */}
              {video.frameAnalysis && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 bg-black/70 rounded-full">
                  {getFrameAnalysisIcon(video.frameAnalysis)}
                  <span className="text-xs text-white">
                    {video.frameAnalysis.overallVerdict}
                  </span>
                </div>
              )}
              
              {/* Verdict Badge */}
              <span className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium border ${getVerdictColor(video.verdict)}`}>
                {video.verdict.toUpperCase()}
              </span>
            </div>
            
            <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
            <p className="text-sm text-gray-400 mb-3">by {video.channel}</p>
            
            {/* Rich Content Info */}
            {video.contentAnalysis && (
              <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Rich Analysis</div>
                <div className="text-sm text-white">
                  {video.contentAnalysis.summary.substring(0, 80)}...
                </div>
              </div>
            )}
            
            {/* Frame Analysis Summary */}
            {video.frameAnalysis && (
              <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Frame Analysis</div>
                <div className="text-sm text-white">
                  {video.frameAnalysis.suspiciousFrames.length}/{video.frameAnalysis.totalFrames} suspicious frames
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{video.analyzedAt.toLocaleDateString()}</span>
              {video.fileSize && <span>{formatFileSize(video.fileSize)}</span>}
            </div>
            
            <div className="flex items-center space-x-2">
              <a
                href={video.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Watch</span>
              </a>
              <button
                onClick={() => handleDeleteVideo(video.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">
            {searchQuery ? 'No videos found' : 'No videos in library'}
          </p>
          <p className="text-sm">
            {searchQuery ? 'Try a different search term' : 'Analyze YouTube videos to see them here'}
          </p>
        </div>
      )}
    </div>
  );

  const PhotosTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Photo Library</h2>
        <div className="text-sm text-gray-400">
          {filteredPhotos.length} of {photos.length} photos
        </div>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all group"
          >
            <div className="relative mb-4">
              <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium border ${getVerdictColor(photo.verdict)}`}>
                {photo.verdict.toUpperCase()}
              </span>
            </div>
            
            <h3 className="font-semibold text-white mb-2 text-sm line-clamp-2">{photo.name}</h3>
            
            {/* Extracted Text Preview */}
            {photo.extractedText && (
              <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Extracted Text</div>
                <div className="text-xs text-white line-clamp-2">
                  {photo.extractedText}
                </div>
              </div>
            )}
            
            {/* Analysis Details */}
            {photo.analysisDetails && (
              <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Analysis</div>
                {photo.analysisDetails.credibilityScore && (
                  <div className="text-xs text-white">
                    Credibility: {photo.analysisDetails.credibilityScore}/100
                  </div>
                )}
                {photo.analysisDetails.misinformationFlags && photo.analysisDetails.misinformationFlags.length > 0 && (
                  <div className="text-xs text-red-300">
                    Flags: {photo.analysisDetails.misinformationFlags.join(', ')}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{photo.analyzedAt.toLocaleDateString()}</span>
              {photo.fileSize && <span>{formatFileSize(photo.fileSize)}</span>}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">
            {searchQuery ? 'No photos found' : 'No photos in library'}
          </p>
          <p className="text-sm">
            {searchQuery ? 'Try a different search term' : 'Upload images for analysis to see them here'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-950/80 backdrop-blur-md border-b border-purple-500/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Eye className="w-8 h-8 text-purple-400" />
                <div className="absolute inset-0 bg-purple-400 blur-md opacity-30"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                TruthSense AI Library
              </span>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-xl border border-gray-700 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: FolderOpen },
            { id: 'videos', label: `Videos (${videos.length})`, icon: Video },
            { id: 'photos', label: `Photos (${photos.length})`, icon: Camera }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'videos' && <VideosTab />}
          {activeTab === 'photos' && <PhotosTab />}
        </motion.div>
      </main>
    </div>
  );
};

export default LibraryPage;