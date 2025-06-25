import React from 'react';
import { Link } from 'react-router-dom';

interface Hotel {
  id: number;
  name: string;
  city: string;
  country: string;
  description: string;
  stars: number;
  email: string;
  phone: string;
  website: string;
  admin_id?: number;
  created_at?: string;
}

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const demoImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ];

  // Sélectionner une image unique pour cet hôtel
  const hotelImage = demoImages[hotel.id % demoImages.length];

  const renderStars = () => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < hotel.stars ? "text-yellow-400" : "text-gray-300"}>★</span>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={hotelImage}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
          }}
        />
        
        {/* Hotel Rating */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center border border-gray-200">
          <div className="text-sm font-bold text-gray-800 mr-1">
            {hotel.stars}
          </div>
          <div className="text-yellow-400 text-sm">{renderStars()}</div>
        </div>
      </div>

      {/* Hotel Information Section */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{hotel.city}, {hotel.country}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6 flex-grow leading-relaxed">{hotel.description}</p>

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-center group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${hotel.email}`} className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                {hotel.email}
              </a>
            </div>
            
            <div className="flex items-center group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0 text-green-500 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${hotel.phone}`} className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200">
                {hotel.phone}
              </a>
            </div>
            
            <div className="flex items-center group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 flex-shrink-0 text-purple-500 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a 
                href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 truncate"
              >
                {hotel.website}
              </a>
            </div>
          </div>
        </div>

        {/* View Options Button */}
        <Link 
          to={`/hotel/${hotel.id}/options`} 
          className="mt-6 w-full block text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Voir les options
        </Link>
      </div>
    </div>
  );
};

export default HotelCard;