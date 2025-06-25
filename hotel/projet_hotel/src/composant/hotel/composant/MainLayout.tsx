import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header toggleSidebar={function (): void {
              throw new Error("Function not implemented.");
          } } />

      {/* Mobile menu button */}
      <div className="fixed top-16 left-4 z-30 md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-md shadow-sm border border-gray-200 whitespace-nowrap cursor-pointer !rounded-button"
        >
          <i
            className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"} text-gray-600`}
          ></i>
        </button>
      </div>

      {/* Sidebar - responsive */}
      <div className={`md:block ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main content area */}
      <div className="pt-16 md:pl-64">{children}</div>
    </div>
  );
};

export default MainLayout;