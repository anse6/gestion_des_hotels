import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Trigger animations after component mount
    setTimeout(() => setIsVisible(true), 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'all 0.8s ease-out'
  };

  const staggeredAnimation = (delay: number) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.8s ease-out ${delay}s`
  });

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Parallax */}
        <section className="relative bg-blue-900 text-white py-32 overflow-hidden">
          {/* Parallax Background */}
          <div 
            className="absolute inset-0 bg-black opacity-40 z-10"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`
            }}
          ></div>
          
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Hôtel de luxe" 
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `translateY(${scrollY * 0.5}px) scale(1.1)`
            }}
          />
          
          <div className="container mx-auto px-4 relative z-20">
            <div className="max-w-3xl">
              <h1 
                className="text-5xl font-bold mb-6 animate-pulse"
                style={{
                  ...fadeInUp,
                  animationDelay: '0.2s'
                }}
              >
                Notre Histoire
              </h1>
              <p 
                className="text-xl"
                style={staggeredAnimation(0.3)}
              >
                Découvrez la passion et la vision qui animent notre réseau d'hôtels d'exception au Cameroun.
              </p>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-blue-400 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white rounded-full opacity-10 animate-pulse"></div>
        </section>

        {/* Mission Section with Hover Effects */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center">
            <div 
              className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12 group"
              style={staggeredAnimation(0.4)}
            >
              <img 
                src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Mission" 
                className="rounded-xl shadow-xl w-full transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:rotate-1"
              />
            </div>
            <div className="lg:w-1/2" style={staggeredAnimation(0.6)}>
              <h2 className="text-3xl font-bold text-gray-800 mb-6 relative">
                Notre Mission
                <div className="absolute -bottom-2 left-0 w-20 h-1 bg-blue-600 rounded-full transform origin-left transition-all duration-700 hover:w-32"></div>
              </h2>
              <p className="text-lg text-gray-600 mb-6 transform transition-all duration-300 hover:text-gray-800">
                Fondé en 2010, Hôtels du Cameroun est né d'une vision ambitieuse : redéfinir l'hôtellerie 
                de luxe en Afrique centrale en combinant hospitalité authentique et standards internationaux.
              </p>
              <p className="text-lg text-gray-600 mb-6 transform transition-all duration-300 hover:text-gray-800">
                Chaque établissement de notre réseau a été conçu pour répondre à un besoin spécifique :
              </p>
              <ul className="space-y-4 mb-6">
                {[
                  { hotel: "Hilton Yaoundé", desc: "Pour les voyageurs d'affaires exigeants", delay: 0.8 },
                  { hotel: "Djeuga Palace", desc: "Pour les événements et séminaires haut de gamme", delay: 1.0 },
                  { hotel: "Sawa Hotel", desc: "Pour les vacanciers en quête de détente", delay: 1.2 }
                ].map((item, index) => (
                  <li 
                    key={index}
                    className="flex items-start transform transition-all duration-500 hover:translate-x-2 hover:bg-blue-50 p-3 rounded-lg"
                    style={staggeredAnimation(item.delay)}
                  >
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-3 transform transition-all duration-300 hover:scale-110 hover:rotate-12">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-700">
                      <strong className="text-blue-800">{item.hotel}</strong> - {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Values Section with Card Animations */}
        <section className="bg-blue-50 py-16 relative overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <h2 
              className="text-3xl font-bold text-center text-gray-800 mb-12 relative"
              style={staggeredAnimation(0.2)}
            >
              Nos Valeurs Fondamentales
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Excellence",
                  description: "Nous nous engageons à fournir un service irréprochable et des installations de classe mondiale.",
                  icon: "⭐",
                  delay: 0.4,
                  color: "from-yellow-400 to-yellow-600"
                },
                {
                  title: "Authenticité",
                  description: "Chaque établissement reflète la culture et l'héritage unique de sa région.",
                  icon: "🌍",
                  delay: 0.6,
                  color: "from-green-400 to-green-600"
                },
                {
                  title: "Innovation",
                  description: "Nous repoussons constamment les limites de l'expérience hôtelière en Afrique.",
                  icon: "💡",
                  delay: 0.8,
                  color: "from-purple-400 to-purple-600"
                }
              ].map((value, index) => (
                <div 
                  key={index} 
                  className="group bg-white p-8 rounded-xl shadow-md text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 cursor-pointer relative overflow-hidden"
                  style={staggeredAnimation(value.delay)}
                >
                  {/* Hover Background Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="text-4xl mb-4 transform transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 relative z-10">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 relative z-10 transform transition-all duration-300 group-hover:text-blue-700">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 relative z-10 transform transition-all duration-300 group-hover:text-gray-800">
                    {value.description}
                  </p>
                  
                  {/* Animated Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-xl transition-all duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team CTA with Pulse Animation */}
        <section className="container mx-auto px-4 py-16 text-center relative">
          <div style={staggeredAnimation(0.5)}>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 relative">
              Rejoignez Notre Aventure
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 transform transition-all duration-300 hover:text-gray-800">
              Vous partagez notre passion pour l'hôtellerie d'exception ? Découvrez nos opportunités de carrière.
            </p>
           
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
};

export default AboutPage;