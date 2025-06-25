import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OptionCard from './OptionCard';

interface OptionsDisplayProps {
  section: string;
  onBackClick: () => void;
}

interface RoomItem {
  id: number;
  room_number: string;
  description: string | null;
  room_type: string;
  capacity: number;
  price_per_night: number;
  is_available: boolean;
}

interface ApartmentItem {
  id: number;
  name: string;
  description: string;
  apartment_type: string;
  capacity: number;
  room_count: number;
  price_per_night: number;
  is_available: boolean;
}

interface EventRoomItem {
  id: number;
  name: string;
  description: string;
  capacity: number;
  rental_price: number;
  is_available: boolean;
}

type ListingItem = RoomItem | ApartmentItem | EventRoomItem;

const API_BASE_URL = "http://localhost:5000/api";

const OptionsDisplay: React.FC<OptionsDisplayProps> = ({ section, onBackClick }) => {
  const [items, setItems] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let endpoint = '';
        if (section === 'rooms') endpoint = `${API_BASE_URL}/hotel/1/rooms`;
        else if (section === 'apartments') endpoint = `${API_BASE_URL}/hotel/1/apartments`;
        else if (section === 'event-rooms') endpoint = `${API_BASE_URL}/hotel/1/event-rooms`;

        const { data } = await axios.get<ListingItem[]>(endpoint);
        setItems(data);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [section]);

  const getImageUrl = (item: ListingItem) => {
    const roomImages = {
      standard: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
      double: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b",
      deluxe: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      suite: "https://images.unsplash.com/photo-1566669437685-2c5a585aded0",
      family: "https://images.unsplash.com/photo-1611892440504-42a792e24d32"
    };

    const apartmentImages = {
      studio: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1",
      "1-bedroom": "https://images.unsplash.com/photo-1554469384-e58fac16e23a",
      "2-bedroom": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      duplex: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
      penthouse: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
    };

    if (section === 'rooms') {
      const roomItem = item as RoomItem;
      return roomImages[roomItem.room_type as keyof typeof roomImages] || roomImages.standard;
    } else if (section === 'apartments') {
      const apartmentItem = item as ApartmentItem;
      return apartmentImages[apartmentItem.apartment_type as keyof typeof apartmentImages] || apartmentImages.studio;
    } else {
      return "https://images.unsplash.com/photo-1555244162-803834f70033";
    }
  };

  const getTitle = (item: ListingItem) => {
    if (section === 'rooms') {
      const roomItem = item as RoomItem;
      return `Chambre ${roomItem.room_type} - ${roomItem.room_number}`;
    }
    if (section === 'apartments') {
      const apartmentItem = item as ApartmentItem;
      return apartmentItem.name;
    }
    const eventRoomItem = item as EventRoomItem;
    return eventRoomItem.name;
  };

  const getDescription = (item: ListingItem) => {
    if (section === 'rooms') {
      const roomItem = item as RoomItem;
      return roomItem.description || "Chambre confortable avec toutes les commodités";
    }
    if (section === 'apartments') {
      const apartmentItem = item as ApartmentItem;
      return apartmentItem.description;
    }
    const eventRoomItem = item as EventRoomItem;
    return eventRoomItem.description;
  };

  const getPrice = (item: ListingItem) => {
    if (section === 'event-rooms') {
      const eventRoomItem = item as EventRoomItem;
      return `${eventRoomItem.rental_price}€ / jour`;
    }
    if (section === 'apartments') {
      const apartmentItem = item as ApartmentItem;
      return `${apartmentItem.price_per_night}€ / nuit`;
    }
    const roomItem = item as RoomItem;
    return `${roomItem.price_per_night}€ / nuit`;
  };

  const getCapacity = (item: ListingItem) => {
    return item.capacity;
  };

  const getAvailability = (item: ListingItem) => {
    return item.is_available;
  };

  if (isLoading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Chargement en cours...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-12 text-red-500">
      {error}
      <button 
        onClick={onBackClick}
        className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded"
      >
        Retour
      </button>
    </div>
  );

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {section === 'rooms' && 'Nos Chambres'}
        {section === 'apartments' && 'Nos Appartements'}
        {section === 'event-rooms' && 'Nos Salles de Fête'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
       {items.map(item => (
    <OptionCard 
        key={item.id}
        title={getTitle(item)}
        description={getDescription(item)}
        price={getPrice(item)}
        imageUrl={getImageUrl(item)}
        capacity={getCapacity(item)}
        isAvailable={getAvailability(item)}
        itemId={item.id}
        itemType={
        section === 'rooms' ? 'room' :
        section === 'apartments' ? 'apartment' :
        'event-room'
        }
    />
    ))}
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={onBackClick} 
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded transition duration-300"
        >
          Retour aux catégories
        </button>
      </div>
    </div>
  );
};

export default OptionsDisplay;