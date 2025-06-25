import React from 'react';
import Header from '../composant/Header';
import Footer from '../composant/Footer';


// Types pour nos données de service
type Service = {
  id: number;
  title: string;
  description: string;
  image: string;
  features: string[];
};

const ServicesPage: React.FC = () => {
  // Données des services
  const services: Service[] = [
    {
      id: 1,
      title: "Restauration Gastronomique",
      description: "Découvrez une expérience culinaire exceptionnelle avec nos chefs étoilés et nos spécialités locales et internationales.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      features: [
        "Petit-déjeuner buffet",
        "Cuisine locale et internationale",
        "Service en chambre 24/7",
        "Restaurant gastronomique",
        "Bar à vin"
      ]
    },
    {
      id: 2,
      title: "Piscine & Spa",
      description: "Détendez-vous dans nos espaces aquatiques et profitez de nos soins de bien-être pour une relaxation totale.",
      image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      features: [
        "Piscine extérieure chauffée",
        "Piscine à débordement",
        "Jacuzzi",
        "Massages et soins corporels",
        "Hammam et sauna"
      ]
    },
    {
      id: 3,
      title: "Activités Touristiques",
      description: "Explorez les merveilles du Cameroun avec nos excursions organisées et nos guides professionnels.",
      image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      features: [
        "Visites guidées de la ville",
        "Randonnées en forêt",
        "Excursions vers les chutes",
        "Safari photo",
        "Circuits culturels"
      ]
    },
    {
      id: 4,
      title: "Événements & Conférences",
      description: "Organisez vos événements professionnels ou personnels dans nos espaces dédiés et équipés.",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      features: [
        "Salles de conférence modulables",
        "Équipements audiovisuels",
        "Service traiteur",
        "Organisation d'événements",
        "Espaces VIP"
      ]
    }
  ];

  return (
    <>
      <Header />
      
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-green-800 text-white py-32">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6">Nos Services Exceptionnels</h1>
              <p className="text-xl">
                Découvrez l'ensemble des services haut de gamme que nous mettons à votre disposition 
                pour rendre votre séjour inoubliable.
              </p>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Services hôteliers" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </section>

        {/* Services List */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-blue-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt à vivre une expérience unique ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Nos équipes sont à votre disposition pour personnaliser votre séjour selon vos envies.
            </p>
            <button className="bg-white text-blue-800 px-8 py-3 rounded-lg font-bold hover:bg-blue-100 transition duration-300">
              Contactez-nous
            </button>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
};

// Composant pour afficher une carte de service
const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col">
      <img 
        src={service.image} 
        alt={service.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6 flex-grow">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
        <p className="text-gray-600 mb-4">{service.description}</p>
        
        <div className="mt-auto">
          <h4 className="font-semibold text-gray-800 mb-2">Services inclus :</h4>
          <ul className="space-y-2">
            {service.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;