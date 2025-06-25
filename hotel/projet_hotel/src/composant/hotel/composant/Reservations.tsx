import React, { useState } from 'react';
import Header from './reservation/Header';
import MainCategories from './reservation/MainCategories';
import OptionsDisplay from './reservation/OptionsDisplay';

const Reservations: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    setActiveSection(category);
  };

  const handleBackClick = () => {
    setActiveSection(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Header />
      
      {activeSection ? (
        <OptionsDisplay 
          section={activeSection} 
          onBackClick={handleBackClick} 
        />
      ) : (
        <MainCategories onCategoryClick={handleCategoryClick} />
      )}
    </div>
  );
};

export default Reservations;