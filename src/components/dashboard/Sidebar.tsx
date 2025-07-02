import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MessageSquare, Settings, LogOut, X, Eye, FolderOpen, Trash2 } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { chats, currentChatId, createNewChat, selectChat, deleteChat, searchChats } = useChat();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats);

  const handleNewChat = () => {
    createNewChat();
  };

  const handleLibraryClick = () => {
    // Open library page in new tab
    window.open('/library', '_blank');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setFilteredChats(searchChats(query));
    } else {
      setFilteredChats(chats);
    }
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Update filtered chats when chats change
  React.useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredChats(searchChats(searchQuery));
    } else {
      setFilteredChats(chats);
    }
  }, [chats, searchQuery]);

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-80 bg-gray-950 border-r border-purple-500/20 z-50 lg:z-30 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Eye className="w-6 h-6 text-purple-400" />
                <div className="absolute inset-0 bg-purple-400 blur-md opacity-30"></div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                TruthSense AI
              </span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
              Quick Actions
            </div>
            
            <button 
              onClick={handleLibraryClick}
              className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all group"
            >
              <FolderOpen className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
              <span>Library</span>
            </button>
          </div>

          {/* Chats */}
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
              Recent Chats ({filteredChats.length})
            </div>
            
            <div className="space-y-1">
              {filteredChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No chats found' : 'No chats yet'}
                  </p>
                  <p className="text-xs">
                    {searchQuery ? 'Try a different search' : 'Start a new conversation'}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative rounded-xl transition-all ${
                      currentChatId === chat.id
                        ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <button
                      onClick={() => selectChat(chat.id)}
                      className="w-full text-left p-3 rounded-xl transition-all"
                    >
                      <div className="flex items-start space-x-3">
                        <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          currentChatId === chat.id ? 'text-purple-400' : 'text-gray-500 group-hover:text-purple-400'
                        } transition-colors`} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate text-sm ${
                            currentChatId === chat.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {chat.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(chat.updatedAt)}
                          </div>
                          {chat.messages.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1 truncate">
                              {chat.messages[chat.messages.length - 1].content.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.name}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {user?.type}
              </div>
            </div>
          </div>
          
          <div className="mt-3 space-y-1">
            <button className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all text-sm">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <button 
              onClick={logout}
              className="w-full flex items-center space-x-3 p-2 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;