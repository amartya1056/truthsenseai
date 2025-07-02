import { Chat, Message } from '../contexts/ChatContext';
import { VideoFrameAnalysis } from './frameAnalysisService';
import { ContentAnalysisResult } from './contentAnalysisService';

export interface StoredVideo {
  id: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  downloadPath: string;
  originalUrl: string;
  analyzedAt: Date;
  verdict: 'true' | 'false' | 'misleading' | 'unverifiable';
  confidence: number;
  fileSize?: number;
  frameAnalysis?: VideoFrameAnalysis;
  contentAnalysis?: ContentAnalysisResult;
  transcript?: string;
  sentimentAnalysis?: {
    overall: string;
    score: number;
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
}

export interface StoredPhoto {
  id: string;
  name: string;
  path: string;
  originalName: string;
  analyzedAt: Date;
  verdict: 'true' | 'false' | 'misleading' | 'unverifiable';
  confidence: number;
  fileSize?: number;
  extractedText?: string;
  analysisDetails?: {
    misinformationFlags?: string[];
    credibilityScore?: number;
    sources?: string[];
  };
}

// Local Storage Keys
const STORAGE_KEYS = {
  CHATS: 'truthsense_chats',
  VIDEOS: 'truthsense_videos',
  PHOTOS: 'truthsense_photos',
  USER_PREFERENCES: 'truthsense_preferences'
};

// Chat Storage Functions
export const saveChats = (chats: Chat[]): void => {
  try {
    const serializedChats = JSON.stringify(chats, (key, value) => {
      if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt' || key === 'analyzedAt') {
        return value instanceof Date ? value.toISOString() : value;
      }
      return value;
    });
    localStorage.setItem(STORAGE_KEYS.CHATS, serializedChats);
  } catch (error) {
    console.error('Error saving chats:', error);
  }
};

export const loadChats = (): Chat[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((chat: any) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      contextData: chat.contextData ? {
        ...chat.contextData,
        verdictHistory: chat.contextData.verdictHistory ? 
          chat.contextData.verdictHistory.map((verdict: any) => ({
            ...verdict,
            timestamp: new Date(verdict.timestamp)
          })) : undefined
      } : undefined
    }));
  } catch (error) {
    console.error('Error loading chats:', error);
    return [];
  }
};

export const deleteChat = (chatId: string): void => {
  try {
    const chats = loadChats();
    const filteredChats = chats.filter(chat => chat.id !== chatId);
    saveChats(filteredChats);
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
};

// Enhanced Video Storage Functions
export const saveVideo = (video: StoredVideo): void => {
  try {
    const videos = loadVideos();
    const updatedVideos = [video, ...videos.filter(v => v.id !== video.id)];
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updatedVideos, (key, value) => {
      if (key === 'analyzedAt') {
        return value instanceof Date ? value.toISOString() : value;
      }
      return value;
    }));
    console.log('Video saved to library:', video.title);
  } catch (error) {
    console.error('Error saving video:', error);
  }
};

export const loadVideos = (): StoredVideo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((video: any) => ({
      ...video,
      analyzedAt: new Date(video.analyzedAt)
    }));
  } catch (error) {
    console.error('Error loading videos:', error);
    return [];
  }
};

export const deleteVideo = (videoId: string): void => {
  try {
    const videos = loadVideos();
    const filteredVideos = videos.filter(video => video.id !== videoId);
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(filteredVideos, (key, value) => {
      if (key === 'analyzedAt') {
        return value instanceof Date ? value.toISOString() : value;
      }
      return value;
    }));
    console.log('Video deleted from library:', videoId);
  } catch (error) {
    console.error('Error deleting video:', error);
  }
};

// Enhanced Photo Storage Functions
export const savePhoto = (photo: StoredPhoto): void => {
  try {
    const photos = loadPhotos();
    const updatedPhotos = [photo, ...photos.filter(p => p.id !== photo.id)];
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(updatedPhotos, (key, value) => {
      if (key === 'analyzedAt') {
        return value instanceof Date ? value.toISOString() : value;
      }
      return value;
    }));
    console.log('Photo saved to library:', photo.name);
  } catch (error) {
    console.error('Error saving photo:', error);
  }
};

export const loadPhotos = (): StoredPhoto[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((photo: any) => ({
      ...photo,
      analyzedAt: new Date(photo.analyzedAt)
    }));
  } catch (error) {
    console.error('Error loading photos:', error);
    return [];
  }
};

export const deletePhoto = (photoId: string): void => {
  try {
    const photos = loadPhotos();
    const filteredPhotos = photos.filter(photo => photo.id !== photoId);
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(filteredPhotos, (key, value) => {
      if (key === 'analyzedAt') {
        return value instanceof Date ? value.toISOString() : value;
      }
      return value;
    }));
    console.log('Photo deleted from library:', photoId);
  } catch (error) {
    console.error('Error deleting photo:', error);
  }
};

// Auto-save functions for chat analysis
export const autoSaveVideoFromChat = (
  videoId: string,
  title: string,
  channel: string,
  thumbnailUrl: string,
  originalUrl: string,
  verdict: 'true' | 'false' | 'misleading' | 'unverifiable',
  confidence: number,
  transcript?: string,
  frameAnalysis?: VideoFrameAnalysis,
  contentAnalysis?: ContentAnalysisResult,
  sentimentAnalysis?: any,
  fileSize?: number
): void => {
  const video: StoredVideo = {
    id: videoId,
    title,
    channel,
    thumbnailUrl,
    downloadPath: `/library/videos/${videoId}.mp4`,
    originalUrl,
    analyzedAt: new Date(),
    verdict,
    confidence,
    fileSize,
    frameAnalysis,
    contentAnalysis,
    transcript,
    sentimentAnalysis
  };
  
  saveVideo(video);
};

export const autoSavePhotoFromChat = (
  file: File,
  verdict: 'true' | 'false' | 'misleading' | 'unverifiable',
  confidence: number,
  extractedText?: string,
  sources?: string[],
  misinformationFlags?: string[],
  credibilityScore?: number
): void => {
  const photo: StoredPhoto = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: file.name,
    path: URL.createObjectURL(file),
    originalName: file.name,
    analyzedAt: new Date(),
    verdict,
    confidence,
    fileSize: file.size,
    extractedText,
    analysisDetails: {
      misinformationFlags,
      credibilityScore,
      sources
    }
  };
  
  savePhoto(photo);
};

// Search Functions
export const searchChats = (query: string): Chat[] => {
  const chats = loadChats();
  const lowercaseQuery = query.toLowerCase();
  
  return chats.filter(chat => 
    chat.title.toLowerCase().includes(lowercaseQuery) ||
    chat.messages.some(msg => 
      msg.content.toLowerCase().includes(lowercaseQuery)
    )
  );
};

export const searchVideos = (query: string): StoredVideo[] => {
  const videos = loadVideos();
  const lowercaseQuery = query.toLowerCase();
  
  return videos.filter(video => 
    video.title.toLowerCase().includes(lowercaseQuery) ||
    video.channel.toLowerCase().includes(lowercaseQuery) ||
    (video.contentAnalysis?.contentType && video.contentAnalysis.contentType.toLowerCase().includes(lowercaseQuery)) ||
    (video.transcript && video.transcript.toLowerCase().includes(lowercaseQuery))
  );
};

export const searchPhotos = (query: string): StoredPhoto[] => {
  const photos = loadPhotos();
  const lowercaseQuery = query.toLowerCase();
  
  return photos.filter(photo => 
    photo.name.toLowerCase().includes(lowercaseQuery) ||
    (photo.extractedText && photo.extractedText.toLowerCase().includes(lowercaseQuery))
  );
};

// Enhanced Statistics Functions
export const getLibraryStats = () => {
  const videos = loadVideos();
  const photos = loadPhotos();
  const chats = loadChats();
  
  const totalAnalyses = videos.length + photos.length;
  const misinformationDetected = [
    ...videos.filter(v => v.verdict === 'false' || v.verdict === 'misleading'),
    ...photos.filter(p => p.verdict === 'false' || p.verdict === 'misleading')
  ].length;
  
  const averageConfidence = totalAnalyses > 0 
    ? ([...videos, ...photos].reduce((sum, item) => sum + item.confidence, 0) / totalAnalyses)
    : 0;
  
  // Calculate content type distribution for videos
  const contentTypes = videos.reduce((acc: {[key: string]: number}, video) => {
    const type = video.contentAnalysis?.contentType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate frame analysis stats
  const videosWithFrameAnalysis = videos.filter(v => v.frameAnalysis);
  const suspiciousVideos = videosWithFrameAnalysis.filter(v => 
    v.frameAnalysis && v.frameAnalysis.suspiciousFrames.length > 0
  ).length;
  
  return {
    totalChats: chats.length,
    totalVideos: videos.length,
    totalPhotos: photos.length,
    totalAnalyses,
    misinformationDetected,
    averageConfidence: Math.round(averageConfidence),
    accuracyRate: 98, // Mock accuracy rate
    contentTypes,
    frameAnalysisStats: {
      totalAnalyzed: videosWithFrameAnalysis.length,
      suspiciousVideos,
      cleanVideos: videosWithFrameAnalysis.length - suspiciousVideos
    }
  };
};

// Export functions for library management
export const exportLibraryData = (): string => {
  const videos = loadVideos();
  const photos = loadPhotos();
  const stats = getLibraryStats();
  
  const exportData = {
    exportDate: new Date().toISOString(),
    stats,
    videos: videos.map(v => ({
      ...v,
      // Remove large data for export
      frameAnalysis: v.frameAnalysis ? {
        ...v.frameAnalysis,
        suspiciousFrames: v.frameAnalysis.suspiciousFrames.map(f => ({
          ...f,
          base64Data: undefined // Remove base64 data for size
        }))
      } : undefined
    })),
    photos: photos.map(p => ({
      ...p,
      path: undefined // Remove blob URLs for export
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Clear all data (for testing/reset)
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('All library data cleared');
};

// Get content summary for a video
export const getVideoSummary = (videoId: string): string | null => {
  const videos = loadVideos();
  const video = videos.find(v => v.id === videoId);
  
  if (!video) return null;
  
  let summary = `${video.title} by ${video.channel}`;
  
  if (video.contentAnalysis) {
    summary += ` (${video.contentAnalysis.contentType})`;
  }
  
  if (video.frameAnalysis) {
    summary += ` - Frame Analysis: ${video.frameAnalysis.overallVerdict}`;
  }
  
  summary += ` - Verdict: ${video.verdict.toUpperCase()} (${video.confidence}% confidence)`;
  
  return summary;
};

// Get photo summary
export const getPhotoSummary = (photoId: string): string | null => {
  const photos = loadPhotos();
  const photo = photos.find(p => p.id === photoId);
  
  if (!photo) return null;
  
  let summary = `${photo.name}`;
  
  if (photo.extractedText) {
    summary += ` - Text: "${photo.extractedText.substring(0, 50)}..."`;
  }
  
  summary += ` - Verdict: ${photo.verdict.toUpperCase()} (${photo.confidence}% confidence)`;
  
  return summary;
};