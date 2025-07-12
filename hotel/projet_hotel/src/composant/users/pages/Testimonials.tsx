import React from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  date: string;
}

const Testimonials: React.FC = () => {
  // Données des témoignages
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Jean Dupont",
      role: "Voyageur d'affaires",
      content: "Un séjour exceptionnel dans cet hôtel. Le service était impeccable et les chambres très confortables. Je recommande vivement !",
      rating: 5,
      date: "15 Mars 2023"
    },
    {
      id: 2,
      name: "Marie Kwemo",
      role: "Touriste",
      content: "L'accueil était chaleureux et la vue depuis la chambre magnifique. La piscine et le spa sont des atouts majeurs de cet établissement.",
      rating: 4,
      date: "22 Avril 2023"
    },
    {
      id: 3,
      name: "Paul Biya",
      role: "Organisateur d'événements",
      content: "Nous avons organisé un séminaire dans cet hôtel et tout était parfait : les salles, la restauration et l'équipe très professionnelle.",
      rating: 5,
      date: "5 Mai 2023"
    }
  ];

  // Fonction pour afficher les étoiles de notation
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <FaStar 
        key={i} 
        className={`text-2xl ${i < rating ? "text-yellow-400" : "text-gray-300"} animate-pulse`} 
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
      <style>
        {`
          @keyframes slideIn {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes fadeInUp {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-infinite {
            animation: slideIn 10s infinite ease-in-out;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .animate-pulse-slow {
            animation: pulse 2s infinite ease-in-out;
          }
          .card-delay-1 { animation-delay: 0.2s; }
          .card-delay-2 { animation-delay: 0.4s; }
          .card-delay-3 { animation-delay: 0.6s; }
        `}
      </style>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-slide-infinite">
            Ce que disent nos clients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up">
            Découvrez les expériences de nos clients et partagez la vôtre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:scale-105 transition duration-500 flex flex-col animate-fade-in-up card-delay-${index + 1}`}
            >
              <div className="mb-4">
                <h4 className="font-bold text-gray-800 text-lg">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>

              <div className="relative mb-4 flex-grow">
                <FaQuoteLeft className="text-gray-200 text-3xl absolute -top-2 left-0 animate-pulse-slow" />
                <p className="text-gray-700 pl-8 italic">
                  {testimonial.content}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="text-sm text-gray-500">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:scale-110 transition duration-300 animate-pulse-slow">
            Laisser un témoignage
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;