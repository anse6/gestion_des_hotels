// src/components/Header.tsx
import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Menu, ChevronDown, ChevronUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../composant/authentification/hooks/useAuth';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = queryClient.getQueryData<{
    email: string;
    role: string;
    name: string;
  }>(['user']);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 relative">
      <div className="flex items-center lg:hidden">
        <button onClick={toggleSidebar} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <Menu size={22} />
        </button>
      </div>
      <div className="flex-1 max-w-xl ml-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="bg-gray-100 w-full py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center gap-2 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            <User size={20} />
            {user && (
              <span className="hidden md:inline text-sm font-medium">
                {user.name}
              </span>
            )}
            {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-500">{user.email}</div>
                    <div className="text-xs text-indigo-600">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-700">
                  Non connecté
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;