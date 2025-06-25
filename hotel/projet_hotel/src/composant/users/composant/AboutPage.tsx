import React from 'react';
import Header from './Header';
import Footer from './Footer';

const AboutPage: React.FC = () => {
  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-blue-900 text-white py-32">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6">Notre Histoire</h1>
              <p className="text-xl">
                Découvrez la passion et la vision qui animent notre réseau d'hôtels d'exception au Cameroun.
              </p>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Hôtel de luxe" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
              <img 
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Mission" 
                className="rounded-xl shadow-xl w-full"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Notre Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Fondé en 2010, Hôtels du Cameroun est né d'une vision ambitieuse : redéfinir l'hôtellerie 
                de luxe en Afrique centrale en combinant hospitalité authentique et standards internationaux.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Chaque établissement de notre réseau a été conçu pour répondre à un besoin spécifique :
              </p>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">
                    <strong>Hilton Yaoundé</strong> - Pour les voyageurs d'affaires exigeants
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">
                    <strong>Djeuga Palace</strong> - Pour les événements et séminaires haut de gamme
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-gray-700">
                    <strong>Sawa Hotel</strong> - Pour les vacanciers en quête de détente
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-blue-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nos Valeurs Fondamentales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Excellence",
                  description: "Nous nous engageons à fournir un service irréprochable et des installations de classe mondiale.",
                  icon: "⭐"
                },
                {
                  title: "Authenticité",
                  description: "Chaque établissement reflète la culture et l'héritage unique de sa région.",
                  icon: "🌍"
                },
                {
                  title: "Innovation",
                  description: "Nous repoussons constamment les limites de l'expérience hôtelière en Afrique.",
                  icon: "💡"
                }
              ].map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Rejoignez Notre Aventure</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Vous partagez notre passion pour l'hôtellerie d'exception ? Découvrez nos opportunités de carrière.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-300">
            Voir les offres d'emploi
          </button>
        </section>
      </div>
      
      <Footer />
    </>
  );
};

export default AboutPage;