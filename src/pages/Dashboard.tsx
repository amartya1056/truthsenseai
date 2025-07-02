import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ChatInterface from '../components/dashboard/ChatInterface';
import { ChatProvider } from '../contexts/ChatContext';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-950 flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'} lg:ml-80`}>
          <ChatInterface 
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Dashboard;