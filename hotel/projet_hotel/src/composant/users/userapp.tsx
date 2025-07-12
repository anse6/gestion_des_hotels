import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Header from './composant/Header';
import Footer from './composant/Footer';
import HotelCard from './composant/HotelCard';
import Testimonials from './pages/Testimonials';
import { motion } from "framer-motion";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaStar, FaGlobe } from 'react-icons/fa';
import HotelBalconyCarousel from './composant/HotelBalconyCarousel';

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

  // Obtenir les villes uniques pour le filtre
  const uniqueCities = ['Toutes', ...new Set(hotels?.map(hotel => hotel.city) || [])];

  // Animations variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <motion.div 
          className="container mx-auto px-4 py-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative mx-auto mb-8"
            style={{ width: '80px', height: '80px' }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-200"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-blue-500 border-t-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <motion.p 
            className="mt-4 text-lg text-gray-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Chargement des hôtels de rêve...
          </motion.p>
        </motion.div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <motion.div 
          className="container mx-auto px-4 py-20 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg max-w-md mx-auto shadow-lg"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.p 
              className="font-bold text-lg mb-2"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              ⚠️ Erreur de Connexion
            </motion.p>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Impossible de charger les hôtels. Veuillez réessayer plus tard.
            </motion.p>
          </motion.div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50">
        {/* Hero Section avec animations avancées */}
        <motion.section 
          className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Particules animées en arrière-plan */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 bg-black opacity-40"></div>
          
          <motion.img 
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Hôtel de luxe" 
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
          
          <div className="container mx-auto px-4 py-32 relative z-10">
            <motion.div 
              className="max-w-3xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
                variants={fadeInUp}
              >
                Découvrez les plus beaux hôtels
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 leading-relaxed"
                variants={fadeInUp}
              >
                Des expériences d'hébergement exceptionnelles à travers le monde. 
                Luxe, confort et hospitalité authentique vous attendent.
              </motion.p>
              <motion.button 
                className="bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-100 transition duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGlobe className="text-blue-600" />
                Explorer nos hôtels
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* Section de recherche et filtre avec animations */}
        <motion.section 
          className="container mx-auto px-4 py-8 bg-white shadow-sm relative z-10 -mt-8 mx-4 rounded-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <motion.div 
              className="w-full lg:w-1/2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaSearch className="text-blue-500" />
                Rechercher un hôtel
              </label>
              <motion.input
                type="text"
                id="search"
                placeholder="Rechercher par nom ou description..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                whileFocus={{ scale: 1.02 }}
              />
            </motion.div>
            
            <motion.div 
              className="w-full lg:w-1/3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" />
                Filtrer par ville
              </label>
              <motion.select
                id="city"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                whileFocus={{ scale: 1.02 }}
              >
                {uniqueCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </motion.select>
            </motion.div>
          </div>
        </motion.section>

        {/* Section des hôtels avec animations */}
        <motion.section 
          className="container mx-auto px-4 py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div 
            className="text-center mb-16 bg-gradient-to-r from-blue-50 via-white to-blue-50 py-12 px-8 rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.h2
              className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {selectedCity === 'Toutes' ? '🌟 Nos Hôtels Phares 🌟' : `🏨 Hôtels à ${selectedCity} 🏨`}
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {selectedCity === 'Toutes' 
                ? '✨ Découvrez une sélection des meilleurs établissements hôteliers, alliant élégance, confort et service exceptionnel pour un séjour inoubliable. ✨'
                : `💼 Les meilleurs établissements de ${selectedCity} vous attendent avec luxe, hospitalité et raffinement.`}
            </motion.p>

            <motion.div
              className="flex justify-center items-center gap-4 mt-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <motion.div
                className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <FaStar className="text-yellow-500" />
                <span className="text-sm font-medium text-yellow-800">
                  {filteredHotels?.length || 0} hôtels disponibles
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Grille des hôtels */}
          {filteredHotels?.length ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredHotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  custom={index}
                >
                  <HotelCard hotel={hotel} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16 bg-white rounded-2xl shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-6xl mb-4">🏨</div>
              </motion.div>
              <motion.h3 
                className="text-2xl font-bold text-gray-600 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Aucun hôtel ne correspond à votre recherche
              </motion.h3>
              <motion.p 
                className="text-gray-500 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Essayez avec d'autres critères de recherche
              </motion.p>
              <motion.button 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-xl"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('Toutes');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <FaFilter className="inline mr-2" />
                Réinitialiser les filtres
              </motion.button>
            </motion.div>
          )}
        </motion.section>

        {/* Section des témoignages avec animation d'entrée */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}

        >
           <HotelBalconyCarousel />
          <Testimonials />//
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default Userpep;