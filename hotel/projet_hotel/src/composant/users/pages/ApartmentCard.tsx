import React from 'react';
import { useNavigate } from 'react-router-dom';

type Apartment = {
  id: number;
  type: string;
  description: string;
  price_per_night: number;
  image: string;
  amenities: string[];
  room_count?: number;
  capacity?: number;
};

const ApartmentCard: React.FC<{ apartment: Apartment }> = ({ apartment }) => {
  const navigate = useNavigate();

  const handleReservationClick = () => {
    navigate(`/reservation-appartement/${apartment.id}`, { state: { apartment } });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={apartment.image} 
          alt={apartment.type} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
          }}
        />
        {apartment.room_count && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm">
            {apartment.room_count} pièces
          </div>
        )}
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{apartment.type}</h3>
        {apartment.capacity && (
          <p className="text-gray-600 mb-2">Capacité: {apartment.capacity} personnes</p>
        )}
        <p className="text-gray-600 mb-4">{apartment.description}</p>
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Équipements :</h4>
          <ul className="flex flex-wrap gap-2">
            {apartment.amenities.map((amenity, index) => (
              <li key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {amenity}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            {apartment.price_per_night.toLocaleString()} XAF/nuit
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

export default ApartmentCard;