import React from 'react';
import { useNavigate } from 'react-router-dom';

type EventSpace = {
  id: number;
  name: string;
  capacity: number;
  rental_price: number;
  image: string;
  description?: string;
};

const EventSpaceCard: React.FC<{ space: EventSpace }> = ({ space }) => {
  const navigate = useNavigate();

  const handleReservationClick = () => {
    navigate(`/reservation-salle/${space.id}`, { state: { space } });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={space.image} 
          alt={space.name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
          }}
        />
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{space.name}</h3>
        <p className="text-gray-600 mb-2">Capacité: {space.capacity} personnes</p>
        {space.description && (
          <p className="text-gray-600 mb-4">{space.description}</p>
        )}
      </div>
      <div className="p-6 pt-0">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            {space.rental_price.toLocaleString()} XAF/jour
          </span>
          <button 
            onClick={handleReservationClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Réserver
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSpaceCard;