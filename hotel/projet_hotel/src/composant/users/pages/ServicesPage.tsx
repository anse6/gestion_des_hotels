import React, { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../composant/Header';
import Footer from '../composant/Footer';
import { motion } from 'framer-motion';
import { FaWifi, FaSwimmingPool, FaUtensils, FaConciergeBell, FaSpa, FaParking, FaTv, FaSnowflake } from 'react-icons/fa';

// Types pour nos données de service
type Service = {
  id: number;
  title: string;
  description: string;
  image: string;
  features: {
    name: string;
    icon: JSX.Element;
  }[];
  price?: string;
  roomSize?: string;
  capacity?: string;
};

const ServicesPage: React.FC = () => {
 // const navigate = useNavigate();
  // Données des hébergements
  const services: Service[] = [
    {
      id: 1,
      title: "Chambre Deluxe",
      description: "Une chambre spacieuse avec vue sur la ville ou le jardin, équipée de tout le confort moderne pour un séjour agréable.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      roomSize: "30 m²",
      capacity: "2 personnes",
      price: "15000 fcfa/nuit",
      features: [
        { name: "Wi-Fi haut débit", icon: <FaWifi className="text-blue-500" /> },
        { name: "Climatisation", icon: <FaSnowflake className="text-blue-400" /> },
        { name: "TV écran plat", icon: <FaTv className="text-purple-500" /> },
        { name: "Service en chambre", icon: <FaConciergeBell className="text-yellow-500" /> },
        { name: "Petit-déjeuner inclus", icon: <FaUtensils className="text-green-500" /> }
      ]
    },
    {
      id: 2,
      title: "Suite Exécutive",
      description: "Une suite élégante avec espace salon séparé, parfaite pour les voyageurs d'affaires ou ceux qui recherchent plus d'espace.",
      image: "https://images.unsplash.com/photo-1566669437685-5f63c8edea6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      roomSize: "50 m²",
      capacity: "2 personnes",
      price: "10000 fcfa/nuit",
      features: [
        { name: "Wi-Fi haut débit", icon: <FaWifi className="text-blue-500" /> },
        { name: "Espace bureau", icon: <FaConciergeBell className="text-yellow-500" /> },
        { name: "Mini-bar", icon: <FaUtensils className="text-green-500" /> },
        { name: "Accès spa gratuit", icon: <FaSpa className="text-pink-500" /> },
        { name: "Parking privé", icon: <FaParking className="text-gray-500" /> }
      ]
    },
    {
      id: 3,
      title: "Suite Présidentielle",
      description: "Le summum du luxe avec salon, salle à manger et chambre séparée, offrant une expérience hôtelière exceptionnelle.",
      image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      roomSize: "80 m²",
      capacity: "2-4 personnes",
      price: "25000 fcfa/nuit",
      features: [
        { name: "Service de majordome", icon: <FaConciergeBell className="text-yellow-500" /> },
        { name: "Jacuzzi privé", icon: <FaSwimmingPool className="text-blue-300" /> },
        { name: "Vue panoramique", icon: <FaTv className="text-purple-500" /> },
        { name: "Accès VIP à tous les services", icon: <FaSpa className="text-pink-500" /> },
        { name: "Transfert aéroport", icon: <FaParking className="text-gray-500" /> }
      ]
    },
    {
      id: 4,
      title: "Chambre Familiale",
      description: "Un espace spacieux conçu pour les familles, avec des lits supplémentaires et des commodités adaptées aux enfants.",
      image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      roomSize: "45 m²",
      capacity: "2 adultes + 2 enfants",
      price: "15000 fcfa/nuit",
      features: [
        { name: "Lits supplémentaires", icon: <FaConciergeBell className="text-yellow-500" /> },
        { name: "Espace jeu enfants", icon: <FaSwimmingPool className="text-blue-300" /> },
        { name: "Menu enfants", icon: <FaUtensils className="text-green-500" /> },
        { name: "Baby-sitting sur demande", icon: <FaSpa className="text-pink-500" /> },
        { name: "Piscine enfants", icon: <FaSwimmingPool className="text-blue-300" /> }
      ]
    }
  ];

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section avec animation */}
        <motion.section 
          className="relative bg-blue-900 text-white py-32 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <motion.img 
            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Hébergements de luxe"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />
          <div className="container mx-auto px-4 relative z-10 flex items-center justify-center">
            <motion.div 
              className="max-w-3xl text-center"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold mb-6">Nos Hébergements Exceptionnels</h1>
              <p className="text-xl">
                Découvrez nos chambres et suites élégamment décorées, conçues pour offrir confort, 
                luxe et un service personnalisé pour rendre votre séjour inoubliable.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Services List avec animations */}
        <motion.section 
          className="container mx-auto px-4 py-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-12 text-gray-800"
            variants={item}
          >
            Choisissez Votre Hébergement Idéal
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={service.id}
                variants={item}
                whileHover={{ y: -5 }}
              >
                <ServiceCard service={service} index={index} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action avec animation */}
        <motion.section 
          className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-4 text-center">
            <motion.h2 
              className="text-3xl font-bold mb-6"
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              Prêt à réserver votre séjour de rêve ?
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 max-w-2xl mx-auto"
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
            >
              Nos conseillers sont disponibles 24/7 pour vous aider à choisir l'hébergement parfait.
            </motion.p>
            <motion.button 
              className="bg-white text-blue-800 px-8 py-4 rounded-lg font-bold hover:bg-blue-100 transition duration-300 shadow-lg hover:shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Réserver Maintenant
            </motion.button>
          </div>
        </motion.section>
      </div>
      
      <Footer />
    </>
  );
};

// Composant amélioré pour afficher une carte d'hébergement
const ServiceCard: React.FC<{ service: Service; index: number }> = ({ service }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  const handleAvailabilityClick = () => {
    const targetRoute = isLoggedIn && userRole !== 'user' ? '/' : '/users';
    navigate(targetRoute, { state: { message: 'Veuillez choisir votre hôtel de résidence.' } });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-500 h-full flex flex-col border border-gray-200">
      <div className="relative overflow-hidden h-60">
        <img 
          src={service.image} 
          alt={service.title} 
          className="w-full h-full object-cover transition duration-700 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-2xl font-bold text-white">{service.title}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-white bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
              {service.price}
            </span>
            <div className="text-white text-sm">
              <span className="mr-3">{service.roomSize}</span>
              <span>{service.capacity}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow">
        <p className="text-gray-600 mb-6">{service.description}</p>
        
        <div className="border-t border-gray-100 pt-4">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-100 p-2 rounded-full mr-2">
              <FaConciergeBell className="text-blue-600" />
            </span>
            Services inclus :
          </h4>
          <ul className="space-y-3">
            {service.features.map((feature, idx) => (
              <li key={idx} className="flex items-center">
                <span className="mr-3 text-lg">{feature.icon}</span>
                <span className="text-gray-700">{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <button 
          onClick={handleAvailabilityClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center"
        >
          Voir les disponibilités
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;