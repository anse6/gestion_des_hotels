import React, { useState } from 'react';
import RoomReservationModal from './RoomReservationModal';
import ApartmentReservationModal from './ApartmentReservationModal';
import EventRoomReservationModal from './EventRoomReservationModal';

interface OptionCardProps {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  capacity: number;
  isAvailable: boolean;
  itemId: number;
  itemType: 'room' | 'apartment' | 'event-room';
}

const OptionCard: React.FC<OptionCardProps> = ({ 
  title, 
  description, 
  price, 
  imageUrl,
  capacity,
  isAvailable,
  itemId,
  itemType
}) => {
  const [showReservationModal, setShowReservationModal] = useState(false);

  const renderReservationModal = () => {
    switch(itemType) {
      case 'room':
        return (
          <RoomReservationModal 
            isOpen={showReservationModal}
            onClose={() => setShowReservationModal(false)}
            roomId={itemId}
            pricePerNight={parseFloat(price.replace('€ / nuit', ''))}
          />
        );
      case 'apartment':
        return (
          <ApartmentReservationModal 
            isOpen={showReservationModal}
            onClose={() => setShowReservationModal(false)}
            apartmentId={itemId}
            pricePerNight={parseFloat(price.replace('€ / nuit', ''))}
          />
        );
      case 'event-room':
        return (
          <EventRoomReservationModal 
            isOpen={showReservationModal}
            onClose={() => setShowReservationModal(false)}
            eventRoomId={itemId}
            rentalPrice={parseFloat(price.replace('€ / jour', ''))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="h-64 overflow-hidden relative">
          <img 
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b";
            }}
          />
          <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
            <span className={`inline-block w-3 h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`}></span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          
          <div className="mb-4 flex items-center text-sm text-gray-500">
            <div className="mr-4">
              <i className="fas fa-users mr-2"></i>
              {capacity} {capacity > 1 ? 'personnes' : 'personne'}
            </div>
            {itemType !== 'event-room' && (
              <div>
                <i className="fas fa-bed mr-2"></i>
                {capacity > 1 ? '2 Lits' : '1 Lit'}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-blue-600">{price}</span>
            <button 
              onClick={() => setShowReservationModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
              disabled={!isAvailable}
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
      
      {renderReservationModal()}
    </>
  );
};

export default OptionCard;