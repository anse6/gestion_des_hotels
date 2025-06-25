import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../composant/Header';
import Footer from '../composant/Footer';
import EventSpaceCard from './EventSpaceCard';
import RoomCard from './RoomCard';
import ApartmentCard from './ApartmentCard';
import { fetchRooms, fetchEventRooms, fetchApartments } from './api/api';

type HotelOption = 'chambres' | 'appartements' | 'salle-fete';

// Images par défaut pour chaque type
const DEFAULT_IMAGES = {
  rooms: [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1566669437684-beb6facb0dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ],
  apartments: [
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ],
  eventSpaces: [
    "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1572119863284-1d6766f8f89c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ]
};

const getDefaultImage = (type: 'rooms' | 'apartments' | 'eventSpaces', id: number) => {
  const images = DEFAULT_IMAGES[type];
  return images[id % images.length];
};

const Apppet: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [selectedOption, setSelectedOption] = useState<HotelOption>('chambres');

  // Requête pour les chambres
  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['rooms', hotelId],
    queryFn: () => fetchRooms(Number(hotelId)),
    enabled: selectedOption === 'chambres'
  });

  // Requête pour les appartements
  const { data: apartments, isLoading: loadingApartments } = useQuery({
    queryKey: ['apartments', hotelId],
    queryFn: () => fetchApartments(Number(hotelId)),
    enabled: selectedOption === 'appartements'
  });

  // Requête pour les salles de fête
  const { data: eventSpaces, isLoading: loadingEventSpaces } = useQuery({
    queryKey: ['eventSpaces', hotelId],
    queryFn: () => fetchEventRooms(Number(hotelId)),
    enabled: selectedOption === 'salle-fete'
  });

  const isLoading = loadingRooms || loadingApartments || loadingEventSpaces;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (selectedOption) {
      case 'chambres':
        return rooms?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room: any) => (
              <RoomCard 
                key={room.id} 
                room={{
                  ...room,
                  type: `Chambre ${room.room_type}`,
                  price: `XAF ${room.price_per_night?.toLocaleString()}/nuit`,
                  image: getDefaultImage('rooms', room.id),
                  amenities: room.room_type === 'deluxe' ? 
                    ['Wi-Fi', 'TV', 'Mini-bar', 'Climatisation'] : 
                    ['Wi-Fi', 'TV', 'Climatisation']
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucune chambre disponible pour cet hôtel
          </div>
        );

      case 'appartements':
        return apartments?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apartments.map((apartment: any) => (
              <ApartmentCard 
                key={apartment.id} 
                apartment={{
                  ...apartment,
                  type: `Appartement ${apartment.apartment_type}`,
                  price: `XAF ${apartment.price_per_night?.toLocaleString()}/nuit`,
                  image: getDefaultImage('apartments', apartment.id),
                  amenities: apartment.has_wifi ? 
                    ['Wi-Fi', 'Cuisine', 'TV', 'Climatisation'] : 
                    ['Cuisine', 'TV', 'Climatisation']
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucun appartement disponible pour cet hôtel
          </div>
        );

      case 'salle-fete':
        return eventSpaces?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventSpaces.map((space: any) => (
              <EventSpaceCard 
                key={space.id} 
                space={{
                  ...space,
                  price: `XAF ${space.rental_price?.toLocaleString()}/jour`,
                  image: getDefaultImage('eventSpaces', space.id)
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucune salle de fête disponible pour cet hôtel
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Options de l'hôtel</h1>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setSelectedOption('chambres')}
              className={`px-6 py-2 rounded-lg font-medium transition duration-300 ${
                selectedOption === 'chambres' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Chambres
            </button>
            <button
              onClick={() => setSelectedOption('appartements')}
              className={`px-6 py-2 rounded-lg font-medium transition duration-300 ${
                selectedOption === 'appartements' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Appartements
            </button>
            <button
              onClick={() => setSelectedOption('salle-fete')}
              className={`px-6 py-2 rounded-lg font-medium transition duration-300 ${
                selectedOption === 'salle-fete' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Salles de fête
            </button>
          </div>

          {renderContent()}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Apppet;