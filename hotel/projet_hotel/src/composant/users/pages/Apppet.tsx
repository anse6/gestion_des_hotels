import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate(); // Hook pour la navigation
  const [selectedOption, setSelectedOption] = useState<HotelOption>('chambres');
  const [searchTerm, setSearchTerm] = useState<string>(''); // État pour le terme de recherche

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

  // Filtrer les données en fonction du terme de recherche
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter((room: any) =>
      room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rooms, searchTerm]);

  const filteredApartments = useMemo(() => {
    if (!apartments) return [];
    return apartments.filter((apartment: any) =>
      apartment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apartment.apartment_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [apartments, searchTerm]);

  const filteredEventSpaces = useMemo(() => {
    if (!eventSpaces) return [];
    return eventSpaces.filter((space: any) =>
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [eventSpaces, searchTerm]);

  const handleBackClick = () => {
    navigate(-1); // Retourne à la page précédente dans l'historique
  };

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
        return filteredRooms?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRooms.map((room: any) => (
              <RoomCard
                key={room.id}
                room={{
                  ...room,
                  type: `Chambre ${room.room_type}`,
                  price: `XAF ${room.price_per_night?.toLocaleString()}/nuit`,
                  image: getDefaultImage('rooms', room.id),
                  amenities: room.room_type === 'deluxe'
                    ? ['Wi-Fi', 'TV', 'Mini-bar', 'Climatisation']
                    : ['Wi-Fi', 'TV', 'Climatisation']
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucune chambre disponible pour cet hôtel ou ne correspond à votre recherche.
          </div>
        );

      case 'appartements':
        return filteredApartments?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredApartments.map((apartment: any) => (
              <ApartmentCard
                key={apartment.id}
                apartment={{
                  ...apartment,
                  type: `Appartement ${apartment.apartment_type}`,
                  price: `XAF ${apartment.price_per_night?.toLocaleString()}/nuit`,
                  image: getDefaultImage('apartments', apartment.id),
                  amenities: apartment.has_wifi
                    ? ['Wi-Fi', 'Cuisine', 'TV', 'Climatisation']
                    : ['Cuisine', 'TV', 'Climatisation']
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Aucun appartement disponible pour cet hôtel ou ne correspond à votre recherche.
          </div>
        );

      case 'salle-fete':
        return filteredEventSpaces?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEventSpaces.map((space: any) => (
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
            Aucune salle de fête disponible pour cet hôtel ou ne correspond à votre recherche.
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
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackClick}
              className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition duration-300"
              title="Retour"
            >
              {/* Icône de flèche gauche SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Options de l'hôtel</h1>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 items-center">
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
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {renderContent()}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Apppet;