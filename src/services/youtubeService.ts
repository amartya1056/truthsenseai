import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyDk_i1eo4JJ-KHjgjpgUimfDFyV0mpdnN8';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
  isShort?: boolean; // New field to identify Shorts
}

export interface YouTubeComment {
  id: string;
  text: string;
  authorDisplayName: string;
  publishedAt: string;
  likeCount: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
}

export interface YouTubeTranscript {
  text: string;
  start: number;
  duration: number;
}

export interface VideoAnalysisResult {
  video: YouTubeVideo;
  transcript: string;
  comments: YouTubeComment[];
  sentimentAnalysis: {
    overall: 'positive' | 'negative' | 'neutral';
    score: number;
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  downloadPath?: string;
}

// Check if API key is configured
const checkApiKey = (): void => {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'AIzaSyComaDB_i2hREfT17GymA34zuYc-y8Bv7w') {
    throw new Error('YouTube API key is not configured. Please set VITE_YOUTUBE_API_KEY in your .env file.');
  }
};

// Extract YouTube video ID from URL (including Shorts)
export const extractVideoId = (url: string): string | null => {
  const patterns = [
    // Regular YouTube URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    // YouTube Shorts URLs
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtu\.be\/shorts\/([^&\n?#]+)/,
    // Mobile YouTube URLs
    /m\.youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /m\.youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Check if text contains YouTube URL (including Shorts)
export const containsYouTubeUrl = (text: string): boolean => {
  const youtubePattern = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)(?:\/watch\?v=|\/embed\/|\/shorts\/|\/)/i;
  return youtubePattern.test(text);
};

// Check if URL is a YouTube Short
export const isYouTubeShort = (url: string): boolean => {
  return /(?:youtube\.com\/shorts\/|youtu\.be\/shorts\/)/i.test(url);
};

// Parse ISO 8601 duration to determine if video is a Short
const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Fetch video details from YouTube API (supports both regular videos and Shorts)
export const fetchVideoDetails = async (videoId: string): Promise<YouTubeVideo> => {
  checkApiKey();
  
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found or is private/unavailable');
    }

    const video = response.data.items[0];
    
    // Determine if this is a Short based on duration
    const durationInSeconds = parseISO8601Duration(video.contentDetails.duration);
    const isShort = durationInSeconds <= 60; // Shorts are typically 60 seconds or less
    
    return {
      id: videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics.viewCount || '0',
      likeCount: video.statistics.likeCount || '0',
      commentCount: video.statistics.commentCount || '0',
      duration: video.contentDetails.duration,
      thumbnails: {
        default: video.snippet.thumbnails.default?.url || '',
        medium: video.snippet.thumbnails.medium?.url || '',
        high: video.snippet.thumbnails.high?.url || ''
      },
      isShort
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('YouTube API quota exceeded or invalid API key. Please check your API key and quota limits.');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid video ID or API request parameters.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      }
    }
    
    throw new Error('Failed to fetch video details from YouTube API');
  }
};

// Fetch video comments (works for both regular videos and Shorts)
export const fetchVideoComments = async (videoId: string, maxResults: number = 50): Promise<YouTubeComment[]> => {
  checkApiKey();
  
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
      params: {
        part: 'snippet',
        videoId: videoId,
        key: YOUTUBE_API_KEY,
        maxResults: maxResults,
        order: 'relevance'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data.items) {
      return [];
    }

    return response.data.items.map((item: any) => ({
      id: item.id,
      text: item.snippet.topLevelComment.snippet.textDisplay,
      authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      likeCount: item.snippet.topLevelComment.snippet.likeCount || 0
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        console.warn('Comments disabled or API quota exceeded. Continuing without comments.');
        return [];
      } else if (error.response?.status === 404) {
        console.warn('Comments not found for this video. Continuing without comments.');
        return [];
      }
    }
    
    // Return empty array instead of throwing error to allow analysis to continue
    return [];
  }
};

// Simple sentiment analysis (replacing TextBlob)
const analyzeSentiment = (text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } => {
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'awesome', 'brilliant', 'perfect', 'best', 'incredible', 'outstanding'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'worst', 'disgusting', 'pathetic', 'stupid', 'ridiculous', 'nonsense', 'fake', 'lies'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  const normalizedScore = Math.max(-1, Math.min(1, score / words.length * 10));
  
  if (normalizedScore > 0.1) return { sentiment: 'positive', score: normalizedScore };
  if (normalizedScore < -0.1) return { sentiment: 'negative', score: normalizedScore };
  return { sentiment: 'neutral', score: normalizedScore };
};

// Analyze comment sentiment
export const analyzeCommentSentiment = (comments: YouTubeComment[]): {
  overall: 'positive' | 'negative' | 'neutral';
  score: number;
  distribution: { positive: number; negative: number; neutral: number };
} => {
  if (comments.length === 0) {
    return {
      overall: 'neutral',
      score: 0,
      distribution: { positive: 0, negative: 0, neutral: 0 }
    };
  }

  const sentiments = comments.map(comment => {
    const analysis = analyzeSentiment(comment.text);
    comment.sentiment = analysis.sentiment;
    comment.sentimentScore = analysis.score;
    return analysis;
  });

  const distribution = {
    positive: sentiments.filter(s => s.sentiment === 'positive').length,
    negative: sentiments.filter(s => s.sentiment === 'negative').length,
    neutral: sentiments.filter(s => s.sentiment === 'neutral').length
  };

  const averageScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  
  let overall: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (averageScore > 0.1) overall = 'positive';
  else if (averageScore < -0.1) overall = 'negative';

  return {
    overall,
    score: averageScore,
    distribution
  };
};

// Enhanced transcript extraction for Shorts (shorter content)
export const extractTranscript = async (videoId: string, isShort: boolean = false): Promise<string> => {
  checkApiKey();
  
  try {
    // Try to get captions from YouTube API
    const response = await axios.get('https://www.googleapis.com/youtube/v3/captions', {
      params: {
        part: 'snippet',
        videoId: videoId,
        key: YOUTUBE_API_KEY
      },
      timeout: 10000
    });

    if (response.data.items && response.data.items.length > 0) {
      // In a real implementation, you'd download the caption file
      // For now, we'll return a placeholder with Short-specific handling
      if (isShort) {
        return "Short-form content transcript extraction would be implemented here. Shorts typically contain concise, engaging content optimized for mobile viewing.";
      }
      return "Transcript extraction would be implemented here using yt-dlp or YouTube's caption API.";
    }
    
    return isShort 
      ? "No transcript available for this Short. Short-form content analysis will focus on visual elements and metadata."
      : "No transcript available for this video.";
  } catch (error) {
    console.error('Error extracting transcript:', error);
    return isShort 
      ? "Short transcript extraction failed or not available."
      : "Transcript extraction failed or not available.";
  }
};

// Enhanced download video (supports Shorts)
export const downloadVideo = async (videoId: string, title: string, isShort: boolean = false): Promise<string> => {
  try {
    // In production, this would use yt-dlp to download the video
    // For now, we'll simulate the download and return a mock path
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const prefix = isShort ? 'short' : 'video';
    const filename = `${prefix}_${videoId}_${sanitizedTitle}.mp4`;
    const downloadPath = `/library/${isShort ? 'shorts' : 'videos'}/${filename}`;
    
    console.log(`Mock download: ${isShort ? 'Short' : 'Video'} would be saved to ${downloadPath}`);
    
    // Simulate download delay (shorter for Shorts)
    await new Promise(resolve => setTimeout(resolve, isShort ? 1000 : 2000));
    
    return downloadPath;
  } catch (error) {
    console.error(`Error downloading ${isShort ? 'Short' : 'video'}:`, error);
    throw new Error(`Failed to download ${isShort ? 'Short' : 'video'}`);
  }
};

// Complete YouTube analysis pipeline (supports both videos and Shorts)
export const analyzeYouTubeVideo = async (url: string): Promise<VideoAnalysisResult> => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  const isShortUrl = isYouTubeShort(url);
  console.log(`Starting YouTube ${isShortUrl ? 'Short' : 'video'} analysis for:`, videoId);

  try {
    // Fetch video details first
    const video = await fetchVideoDetails(videoId);
    console.log(`${video.isShort ? 'Short' : 'Video'} details fetched`);

    // Fetch comments (non-blocking if it fails)
    let comments: YouTubeComment[] = [];
    try {
      // For Shorts, fetch fewer comments as they tend to be shorter
      const maxComments = video.isShort ? 50 : 100;
      comments = await fetchVideoComments(videoId, maxComments);
      console.log(`Comments fetched for ${video.isShort ? 'Short' : 'video'}`);
    } catch (error) {
      console.warn('Failed to fetch comments, continuing without them:', error);
    }

    // Extract transcript (with Short-specific handling)
    const transcript = await extractTranscript(videoId, video.isShort);
    
    // Analyze sentiment
    const sentimentAnalysis = analyzeCommentSentiment(comments);
    
    // Download video (optional, can be done in background)
    let downloadPath: string | undefined;
    try {
      downloadPath = await downloadVideo(videoId, video.title, video.isShort);
    } catch (error) {
      console.error(`${video.isShort ? 'Short' : 'Video'} download failed:`, error);
    }

    console.log(`YouTube ${video.isShort ? 'Short' : 'video'} analysis complete`);

    return {
      video,
      transcript,
      comments,
      sentimentAnalysis,
      downloadPath
    };
  } catch (error) {
    console.error(`Error in YouTube ${isShortUrl ? 'Short' : 'video'} analysis:`, error);
    throw error;
  }
};