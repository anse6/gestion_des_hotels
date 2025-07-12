import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Header from './composant/Header';
import Footer from './composant/Footer';
import HotelCard from './composant/HotelCard';
import Testimonials from './pages/Testimonials';
import { motion } from "framer-motion";

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
  admin_id: number;
  created_at: string;
}

const fetchHotels = async (): Promise<Hotel[]> => {
  const response = await axios.get('http://localhost:5000/api/hotel/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

const Userpep: React.FC = () => {
  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Toutes');

  // Filtrer les hôtels en fonction de la recherche et de la ville sélectionnée
  const filteredHotels = hotels?.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         hotel.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'Toutes' || hotel.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Chargement des hôtels...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded max-w-md mx-auto">
            <p className="font-bold">Erreur</p>
            <p>Impossible de charger les hôtels. Veuillez réessayer plus tard.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-blue-900 text-white">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="container mx-auto px-4 py-32 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold mb-6">Découvrez les plus beaux hôtels</h1>
              <p className="text-xl mb-8">
                Des expériences d'hébergement exceptionnelles à travers le monde. 
                Luxe, confort et hospitalité authentique.
              </p>
              <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-100 transition duration-300">
                Explorer nos hôtels
              </button>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Hôtel de luxe" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </section>

        {/* Search and Filter Section */}
        <section className="container mx-auto px-4 py-8 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
             <div className="w-full md:w-1/2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher un hôtel
            </label>
            <input
              type="text"
              id="search"
              placeholder="Rechercher par nom ou description..."
              className="w-full px-4 py-2 border-3 border-blue-500 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          </div>
        </section>

        {/* Featured Hotels */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 bg-gradient-to-b from-blue-50 to-white py-12 px-4 rounded-xl">
  <motion.h2
    className="text-4xl font-extrabold text-blue-700 mb-6"
    animate={{ y: [0, -10, 0] }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {selectedCity === 'Toutes' ? '🌟 Nos Hôtels Phares 🌟' : `🏨 Hôtels à ${selectedCity} 🏨`}
  </motion.h2>

  <motion.p
    className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto px-4"
    animate={{ opacity: [1, 0.7, 1] }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {selectedCity === 'Toutes' 
      ? '✨ Découvrez une sélection des meilleurs établissements hôteliers, alliant élégance, confort et service exceptionnel pour un séjour inoubliable. ✨'
      : `💼 Les meilleurs établissements de ${selectedCity} vous attendent avec luxe, hospitalité et raffinement.`}
  </motion.p>
</div>

    
          
          {filteredHotels?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredHotels.map(hotel => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-600">
                Aucun hôtel ne correspond à votre recherche.
              </h3>
              <button 
                className="mt-4 text-blue-600 hover:text-blue-800"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('Toutes');
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

       
        <Testimonials />
      </div>
      <Footer />
    </>
  );
};

export default Userpep;