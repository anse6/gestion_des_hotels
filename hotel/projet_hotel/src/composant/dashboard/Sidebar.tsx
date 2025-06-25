// src/composant/dashboard/Sidebar.tsx
import React from 'react';
import { Grid, Users, Home, X } from 'lucide-react'; // Ajout de l'icône Home
import Logo from './logo';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  activeTab: string; // Ajout de la prop activeTab
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, setActiveTab, activeTab }) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <Logo />
        <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden">
          <X size={20} />
        </button>
      </div>
      <div className="py-4 space-y-1">
        <SidebarItem 
          icon={<Grid size={20} />} 
          label="Tableau de bord" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')}
        />
        <SidebarItem 
          icon={<Home size={20} />} // Utilisation de l'icône Home pour Hôtel
          label="Hôtel" 
          active={activeTab === 'hotel'} 
          onClick={() => setActiveTab('hotel')}
        />
        <SidebarItem 
          icon={<Users size={20} />} 
          label="Admin" 
          active={activeTab === 'admin'}
          onClick={() => setActiveTab('admin')}
        />
        {/* Autres éléments... */}
      </div>
    </div>
  );
};

export default Sidebar;