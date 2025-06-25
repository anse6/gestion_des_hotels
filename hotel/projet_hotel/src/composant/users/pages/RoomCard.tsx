import React from 'react';
import { useNavigate } from 'react-router-dom';

type Room = {
  id: number;
  type: string;
  description: string;
  price_per_night: number;
  image: string;
  amenities: string[];
  room_number?: string;
  capacity?: number;
};

const RoomCard: React.FC<{ room: Room }> = ({ room }) => {
  const navigate = useNavigate();

  const handleReservationClick = () => {
    navigate(`/reservation/${room.id}`, { state: { room } });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={room.image} 
          alt={room.type} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
          }}
        />
        {room.room_number && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm">
            N°{room.room_number}
          </div>
        )}
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{room.type}</h3>
        {room.capacity && (
          <p className="text-gray-600 mb-2">Capacité: {room.capacity} personnes</p>
        )}
        <p className="text-gray-600 mb-4">{room.description}</p>
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Équipements :</h4>
          <ul className="flex flex-wrap gap-2">
            {room.amenities.map((amenity, index) => (
              <li key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {amenity}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            {room.price_per_night.toLocaleString()} XAF/nuit
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

export default RoomCard;