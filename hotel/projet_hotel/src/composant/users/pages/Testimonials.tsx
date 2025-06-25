import React from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
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
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      date: "15 Mars 2023"
    },
    {
      id: 2,
      name: "Marie Kwemo",
      role: "Touriste",
      content: "L'accueil était chaleureux et la vue depuis la chambre magnifique. La piscine et le spa sont des atouts majeurs de cet établissement.",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "22 Avril 2023"
    },
    {
      id: 3,
      name: "Paul Biya",
      role: "Organisateur d'événements",
      content: "Nous avons organisé un séminaire dans cet hôtel et tout était parfait : les salles, la restauration et l'équipe très professionnelle.",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      date: "5 Mai 2023"
    }
  ];

  // Fonction pour afficher les étoiles de notation
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <FaStar 
        key={i} 
        className={i < rating ? "text-yellow-400" : "text-gray-300"} 
      />
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ce que disent nos clients</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les expériences de nos clients et partagez la vôtre.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 flex flex-col"
            >
              <div className="mb-4 flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>

              <div className="relative mb-4 flex-grow">
                <FaQuoteLeft className="text-gray-200 text-3xl absolute -top-2 left-0" />
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
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300">
            Laisser un témoignage
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;