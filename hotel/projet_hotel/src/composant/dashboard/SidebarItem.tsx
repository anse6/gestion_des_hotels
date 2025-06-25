// src/composant/dashboard/SidebarItem.tsx
import React from 'react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-indigo-100 ${active ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
};

export default SidebarItem;