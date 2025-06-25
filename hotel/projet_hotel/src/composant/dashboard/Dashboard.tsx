// src/composant/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MainContent from './MainContent';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="bg-white min-h-screen flex">
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        setActiveTab={setActiveTab} activeTab={''}      />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-30">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        <main className="flex-1 overflow-y-auto pt-16">
          <MainContent activeTab={activeTab} />
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;