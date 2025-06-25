import React, { useEffect, useState } from 'react';
import { Hotel } from 'lucide-react';

interface RecentHotel {
  name: string;
  location: string;
  admin: string;
  createdDate: string;
  stars: number;
}

const RecentHotels: React.FC = () => {
  const [hotels, setHotels] = useState<RecentHotel[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/hotel/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // Transformation des données brutes en données pour le tableau
        type ApiHotel = {
          name: string;
          city: string;
          country: string;
          email: string;
          created_at: string;
          stars: number;
        };

        const formattedHotels: RecentHotel[] = data.map((hotel: ApiHotel) => ({
          name: hotel.name,
          location: `${hotel.city}, ${hotel.country}`,
          admin: hotel.email,
          createdDate: new Date(hotel.created_at).toLocaleDateString('fr-FR'),
          stars: hotel.stars,
        }));

        setHotels(formattedHotels);
      } catch (error) {
        console.error('Erreur lors de la récupération des hôtels:', error);
      }
    };

    fetchHotels();
  }, []);

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, index) => (
      <span key={index} className={index < count ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Hôtels récemment créés</h3>
        <Hotel className="text-gray-400" />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="pb-3 font-medium">Nom</th>
              <th className="pb-3 font-medium">Localisation</th>
              <th className="pb-3 font-medium">Adresse</th>
              <th className="pb-3 font-medium">Créé le</th>
              <th className="pb-3 font-medium">Étoiles</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 font-medium">{hotel.name}</td>
                <td className="py-3 text-sm">{hotel.location}</td>
                <td className="py-3 text-sm text-blue-600">{hotel.admin}</td>
                <td className="py-3 text-sm">{hotel.createdDate}</td>
                <td className="py-3">
                  <div className="flex">{renderStars(hotel.stars)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-right">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Voir tous les hôtels →
        </button>
      </div>
    </div>
  );
};

export default RecentHotels;
