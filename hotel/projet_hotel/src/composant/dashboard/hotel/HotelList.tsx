import React from 'react';
import type { Hotel } from './types';
import HotelCard from './HotelCard';

interface HotelListProps {
  hotels: Hotel[];
  onEdit: (hotel: Hotel) => void;
  onDelete: (id: number) => Promise<void>;
  onViewDetails: (hotel: Hotel) => void;
  showActionMenu: number | null;
  setShowActionMenu: (id: number | null) => void;
  isLoading: boolean;
}

const HotelList: React.FC<HotelListProps> = ({
  hotels,
  onEdit,
  onDelete,
  onViewDetails,
  showActionMenu,
  setShowActionMenu,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          Aucun hôtel trouvé
        </h3>
        <p className="text-gray-500">
          Aucun résultat ne correspond à votre recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.id}
          hotel={hotel}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          showActionMenu={showActionMenu}
          setShowActionMenu={setShowActionMenu}
        />
      ))}
    </div>
  );
};

export default HotelList;