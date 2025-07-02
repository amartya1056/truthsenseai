import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { analyzeWithGemini, analyzeYouTubeWithGemini, generateChatTitle, AnalysisResult } from '../services/geminiService';
import { containsYouTubeUrl, analyzeYouTubeVideo, VideoAnalysisResult, extractVideoId } from '../services/youtubeService';
import { downloadYouTubeVideo, saveVideoToLibrary, DownloadProgress } from '../services/videoDownloadService';
import { VideoFrameAnalysis } from '../services/frameAnalysisService';
import { ContentAnalysisResult } from '../services/contentAnalysisService';
import { saveChats, loadChats, autoSavePhotoFromChat, autoSaveVideoFromChat } from '../services/storageService';
import { extractTextFromFile } from '../services/ocrService';

export interface ChatContextData {
  userQueries: string[];
  aiResponses: string[];
  analyzedVideos: {
    id: string;
    title: string;
    channel: string;
    transcript: string;
    sentiment: string;
    verdict: string;
    confidence: number;
    url: string;
    frameAnalysis?: VideoFrameAnalysis;
    contentAnalysis?: ContentAnalysisResult;
  }[];
  analyzedDocuments: {
    name: string;
    extractedText: string;
    verdict: string;
    confidence: number;
  }[];
  analyzedImages: {
    name: string;
    extractedText?: string;
    verdict: string;
    confidence: number;
  }[];
  sourcesUsed: string[];
  verdictHistory: {
    claim: string;
    verdict: string;
    confidence: number;
    timestamp: Date;
  }[];
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  verdict?: 'true' | 'false' | 'misleading' | 'unverifiable';
  confidence?: number;
  sources?: string[];
  attachments?: {
    type: 'image' | 'pdf' | 'text' | 'youtube';
    name: string;
    url?: string;
    extractedText?: string;
  }[];
  videoAnalysis?: {
    title: string;
    channel: string;
    sentimentOverall: string;
    transcriptHighlights: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    downloadProgress?: DownloadProgress;
    downloadPath?: string;
  };
  frameAnalysis?: VideoFrameAnalysis;
  contentAnalysis?: ContentAnalysisResult;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  contextData: ChatContextData;
}

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  sendMessage: (content: string, attachments?: File[]) => Promise<AnalysisResult | null>;
  searchChats: (query: string) => Chat[];
  isLoading: boolean;
  getCurrentContext: () => ChatContextData;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

const createEmptyContext = (): ChatContextData => ({
  userQueries: [],
  aiResponses: [],
  analyzedVideos: [],
  analyzedDocuments: [],
  analyzedImages: [],
  sourcesUsed: [],
  verdictHistory: []
});

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  // Load chats from storage on mount
  useEffect(() => {
    const storedChats = loadChats();
    // Ensure all chats have contextData
    const chatsWithContext = storedChats.map(chat => ({
      ...chat,
      contextData: chat.contextData || createEmptyContext()
    }));
    setChats(chatsWithContext);
    
    // Set the most recent chat as current if none selected
    if (chatsWithContext.length > 0 && !currentChatId) {
      setCurrentChatId(chatsWithContext[0].id);
    }
  }, []);

  // Save chats to storage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      saveChats(chats);
    }
  }, [chats]);

  const createNewChat = (): string => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      contextData: createEmptyContext(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat.id;
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const searchChats = (query: string): Chat[] => {
    if (!query.trim()) return chats;
    
    const lowercaseQuery = query.toLowerCase();
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(lowercaseQuery) ||
      chat.messages.some(msg => 
        msg.content.toLowerCase().includes(lowercaseQuery)
      ) ||
      chat.contextData.userQueries.some(q => 
        q.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const getCurrentContext = (): ChatContextData => {
    return currentChat?.contextData || createEmptyContext();
  };

  const updateChatContext = (chatId: string, updater: (context: ChatContextData) => ChatContextData) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            contextData: updater(chat.contextData),
            updatedAt: new Date(),
          }
        : chat
    ));
  };

  const updateMessageWithDownloadProgress = (messageId: string, progress: DownloadProgress) => {
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? {
            ...chat,
            messages: chat.messages.map(msg => 
              msg.id === messageId && msg.videoAnalysis
                ? {
                    ...msg,
                    videoAnalysis: {
                      ...msg.videoAnalysis,
                      downloadProgress: progress
                    }
                  }
                : msg
            )
          }
        : chat
    ));
  };

  const updateMessageWithFrameAnalysis = (messageId: string, frameAnalysis: VideoFrameAnalysis) => {
    setChats(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? {
            ...chat,
            messages: chat.messages.map(msg => 
              msg.id === messageId
                ? {
                    ...msg,
                    frameAnalysis
                  }
                : msg
            )
          }
        : chat
    ));
  };

  const sendMessage = async (content: string, attachments?: File[]): Promise<AnalysisResult | null> => {
    let chatId = currentChatId;
    
    // Create new chat if none exists
    if (!chatId) {
      chatId = createNewChat();
    }

    setIsLoading(true);

    // Check if message contains YouTube URL
    const isYouTubeAnalysis = containsYouTubeUrl(content);

    // Process attachments and extract text
    const processedAttachments: Message['attachments'] = [];
    if (attachments) {
      for (const file of attachments) {
        const attachment: Message['attachments'][0] = {
          type: file.type.startsWith('image/') ? 'image' : 
                file.type === 'application/pdf' ? 'pdf' : 'text',
          name: file.name,
          url: URL.createObjectURL(file),
        };

        // Extract text from documents and images
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          try {
            const extractedText = await extractTextFromFile(file);
            attachment.extractedText = extractedText;
          } catch (error) {
            console.error('Error extracting text from file:', error);
          }
        }

        processedAttachments.push(attachment);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      attachments: processedAttachments,
    };

    // Add YouTube attachment if URL detected
    if (isYouTubeAnalysis) {
      userMessage.attachments = [
        ...(userMessage.attachments || []),
        {
          type: 'youtube',
          name: 'YouTube Video',
          url: content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/)?.[0] || ''
        }
      ];
    }

    // Add user message
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            updatedAt: new Date(),
          }
        : chat
    ));

    // Update context with user query
    updateChatContext(chatId, (context) => ({
      ...context,
      userQueries: [...context.userQueries, content]
    }));

    try {
      // Generate chat title if this is the first message
      const currentChatData = chats.find(c => c.id === chatId);
      if (currentChatData && currentChatData.messages.length === 0) {
        try {
          let title: string;
          if (isYouTubeAnalysis) {
            const videoId = extractVideoId(content);
            title = videoId ? `YouTube: ${videoId}` : 'YouTube Analysis';
          } else {
            title = await generateChatTitle(content);
          }
          
          setChats(prev => prev.map(chat => 
            chat.id === chatId 
              ? { ...chat, title }
              : chat
          ));
        } catch (error) {
          console.error('Error generating title:', error);
        }
      }

      let analysis: AnalysisResult;
      let videoAnalysis: VideoAnalysisResult | undefined;

      // Get current context for analysis
      const currentContext = getCurrentContext();

      if (isYouTubeAnalysis) {
        console.log('YouTube URL detected, starting comprehensive video analysis...');
        
        // Analyze YouTube video
        videoAnalysis = await analyzeYouTubeVideo(content);
        
        // Use specialized YouTube analysis with Gemini (including context and rich content analysis)
        analysis = await analyzeYouTubeWithGemini(content, videoAnalysis, currentContext);

        // Update context with video analysis including rich content
        updateChatContext(chatId, (context) => ({
          ...context,
          analyzedVideos: [...context.analyzedVideos, {
            id: extractVideoId(content) || Date.now().toString(),
            title: videoAnalysis!.video.title,
            channel: videoAnalysis!.video.channelTitle,
            transcript: videoAnalysis!.transcript,
            sentiment: videoAnalysis!.sentimentAnalysis.overall,
            verdict: analysis.verdict,
            confidence: analysis.confidence,
            url: content,
            contentAnalysis: analysis.contentAnalysis
          }],
          sourcesUsed: [...context.sourcesUsed, ...analysis.sources],
          verdictHistory: [...context.verdictHistory, {
            claim: `YouTube: ${videoAnalysis!.video.title}`,
            verdict: analysis.verdict,
            confidence: analysis.confidence,
            timestamp: new Date()
          }]
        }));

        // Auto-save video to library
        const videoId = extractVideoId(content);
        if (videoId && videoAnalysis) {
          autoSaveVideoFromChat(
            videoId,
            videoAnalysis.video.title,
            videoAnalysis.video.channelTitle,
            videoAnalysis.video.thumbnails.medium,
            content,
            analysis.verdict,
            analysis.confidence,
            videoAnalysis.transcript,
            undefined, // frameAnalysis will be added later
            analysis.contentAnalysis,
            videoAnalysis.sentimentAnalysis
          );
        }
      } else {
        // Regular text/claim analysis with context
        console.log('Starting regular analysis for:', content);
        analysis = await analyzeWithGemini(content, attachments, currentContext);
        
        // Update context with document/image analysis
        if (processedAttachments) {
          updateChatContext(chatId, (context) => {
            const newContext = { ...context };
            
            processedAttachments.forEach(attachment => {
              if (attachment.type === 'pdf' || attachment.type === 'text') {
                newContext.analyzedDocuments = [...newContext.analyzedDocuments, {
                  name: attachment.name,
                  extractedText: attachment.extractedText || '',
                  verdict: analysis.verdict,
                  confidence: analysis.confidence
                }];
              } else if (attachment.type === 'image') {
                newContext.analyzedImages = [...newContext.analyzedImages, {
                  name: attachment.name,
                  extractedText: attachment.extractedText,
                  verdict: analysis.verdict,
                  confidence: analysis.confidence
                }];
              }
            });

            return {
              ...newContext,
              sourcesUsed: [...newContext.sourcesUsed, ...analysis.sources],
              verdictHistory: [...newContext.verdictHistory, {
                claim: content,
                verdict: analysis.verdict,
                confidence: analysis.confidence,
                timestamp: new Date()
              }]
            };
          });
        }
        
        // Auto-save photos to library
        if (attachments) {
          attachments.forEach(file => {
            if (file.type.startsWith('image/')) {
              autoSavePhotoFromChat(
                file,
                analysis.verdict,
                analysis.confidence,
                processedAttachments.find(a => a.name === file.name)?.extractedText,
                analysis.sources
              );
            }
          });
        }
      }
      
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        type: 'ai',
        content: analysis.explanation,
        timestamp: new Date(),
        verdict: analysis.verdict,
        confidence: analysis.confidence,
        sources: analysis.sources,
      };

      // Add video analysis data if available
      if (videoAnalysis && analysis.videoAnalysis) {
        aiMessage.videoAnalysis = {
          title: analysis.videoAnalysis.title,
          channel: analysis.videoAnalysis.channel,
          sentimentOverall: analysis.videoAnalysis.sentimentOverall,
          transcriptHighlights: analysis.videoAnalysis.transcriptHighlights,
          thumbnailUrl: videoAnalysis.video.thumbnails.medium,
          videoUrl: userMessage.attachments?.find(a => a.type === 'youtube')?.url
        };
      }

      // Add rich content analysis if available
      if (analysis.contentAnalysis) {
        aiMessage.contentAnalysis = analysis.contentAnalysis;
      }

      // Start video download and frame analysis in background
      if (isYouTubeAnalysis && videoAnalysis) {
        const videoId = extractVideoId(content);
        if (videoId) {
          downloadYouTubeVideo(
            videoId,
            videoAnalysis.video.title,
            (progress) => {
              updateMessageWithDownloadProgress(aiMessage.id, progress);
              
              // If frame analysis is complete, update the message and library
              if (progress.frameAnalysis && progress.frameAnalysis.analysisComplete) {
                updateMessageWithFrameAnalysis(aiMessage.id, progress.frameAnalysis as VideoFrameAnalysis);
                
                // Update context with frame analysis
                updateChatContext(chatId, (context) => ({
                  ...context,
                  analyzedVideos: context.analyzedVideos.map(video => 
                    video.id === videoId 
                      ? { ...video, frameAnalysis: progress.frameAnalysis as VideoFrameAnalysis }
                      : video
                  )
                }));

                // Update library with frame analysis
                autoSaveVideoFromChat(
                  videoId,
                  videoAnalysis.video.title,
                  videoAnalysis.video.channelTitle,
                  videoAnalysis.video.thumbnails.medium,
                  content,
                  analysis.verdict,
                  analysis.confidence,
                  videoAnalysis.transcript,
                  progress.frameAnalysis as VideoFrameAnalysis,
                  analysis.contentAnalysis,
                  videoAnalysis.sentimentAnalysis
                );
              }
            }
          ).then(result => {
            if (result.success && result.downloadPath) {
              // Update message with download path
              setChats(prev => prev.map(chat => 
                chat.id === chatId 
                  ? {
                      ...chat,
                      messages: chat.messages.map(msg => 
                        msg.id === aiMessage.id && msg.videoAnalysis
                          ? {
                              ...msg,
                              videoAnalysis: {
                                ...msg.videoAnalysis,
                                downloadPath: result.downloadPath
                              }
                            }
                          : msg
                      )
                    }
                  : chat
              ));

              // Final save to library with all analysis data
              autoSaveVideoFromChat(
                videoId,
                videoAnalysis.video.title,
                videoAnalysis.video.channelTitle,
                videoAnalysis.video.thumbnails.medium,
                content,
                analysis.verdict,
                analysis.confidence,
                videoAnalysis.transcript,
                result.frameAnalysis,
                analysis.contentAnalysis,
                videoAnalysis.sentimentAnalysis,
                result.fileSize
              );
            }
          }).catch(error => {
            console.error('Video download failed:', error);
          });
        }
      }
      
      // Add AI message
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, aiMessage],
              updatedAt: new Date(),
            }
          : chat
      ));

      // Update context with AI response
      updateChatContext(chatId, (context) => ({
        ...context,
        aiResponses: [...context.aiResponses, analysis.explanation]
      }));

      return analysis;

    } catch (error) {
      console.error('Error analyzing message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        type: 'ai',
        content: isYouTubeAnalysis 
          ? 'I apologize, but I encountered an error while analyzing this YouTube video. Please check the URL and try again.'
          : 'I apologize, but I encountered an error while fetching live news data from MediaStack and SerpAPI. Please check your internet connection and try again.',
        timestamp: new Date(),
        verdict: 'unverifiable',
        confidence: 0,
        sources: [],
      };
      
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, errorMessage],
              updatedAt: new Date(),
            }
          : chat
      ));

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    chats,
    currentChatId,
    currentChat,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    searchChats,
    isLoading,
    getCurrentContext,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};