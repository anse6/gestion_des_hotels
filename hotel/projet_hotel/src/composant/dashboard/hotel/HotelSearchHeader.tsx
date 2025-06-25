import React from 'react';

interface HotelSearchHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateHotel: () => void;
}

const HotelSearchHeader: React.FC<HotelSearchHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onCreateHotel,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
      <div className="relative w-full md:w-3/5">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Rechercher un hôtel par nom, ville ou pays..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <button
        onClick={onCreateHotel}
        className="flex items-center px-5 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Créer un hôtel
      </button>
    </div>
  );
};

export default HotelSearchHeader;