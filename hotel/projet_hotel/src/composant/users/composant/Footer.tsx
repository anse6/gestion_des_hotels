import React from 'react';
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo et description */}
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                <FaMapMarkerAlt />
              </span>
              Hôtels du Cameroun
            </h3>
            <p className="text-gray-400 mb-6">
              Leader dans l'hôtellerie de luxe au Cameroun, nous offrons des expériences 
              mémorables alliant confort moderne et hospitalité africaine authentique.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-300">
                <FaWhatsapp className="text-xl" />
              </a>
              <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-300">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-300">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-300">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-300">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700">Liens rapides</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Accueil
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Nos Hôtels
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Nos Services
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Galerie
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Témoignages
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700">Contactez-nous</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white p-2 rounded-lg mr-4">
                  <FaMapMarkerAlt />
                </span>
                <address className="text-gray-400 not-italic">
                  Avenue des Hôtels, BP 1234<br />
                  Yaoundé, Cameroun
                </address>
              </li>
              <li className="flex items-center">
                <span className="bg-blue-600 text-white p-2 rounded-lg mr-4">
                  <FaPhone />
                </span>
                <div>
                  <a href="tel:+237699999999" className="text-gray-400 hover:text-white transition duration-300">
                    +237 6 99 99 99 99
                  </a>
                  <br />
                  <a href="tel:+237222222222" className="text-gray-400 hover:text-white transition duration-300">
                    +237 2 22 22 22 22
                  </a>
                </div>
              </li>
              <li className="flex items-center">
                <span className="bg-blue-600 text-white p-2 rounded-lg mr-4">
                  <FaEnvelope />
                </span>
                <div>
                  <a href="mailto:contact@hotelscameroun.cm" className="text-gray-400 hover:text-white transition duration-300">
                    contact@hotelscameroun.cm
                  </a>
                  <br />
                  <a href="mailto:reservation@hotelscameroun.cm" className="text-gray-400 hover:text-white transition duration-300">
                    reservation@hotelscameroun.cm
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-700">Newsletter</h4>
            <p className="text-gray-400 mb-6">
              Abonnez-vous pour recevoir nos dernières offres et actualités.
            </p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="w-full px-4 py-3 rounded-lg text-gray-800 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300">
                <FaPaperPlane />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Nous ne partagerons jamais votre email avec qui que ce soit.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Hôtels du Cameroun. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-white transition duration-300 text-sm">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition duration-300 text-sm">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition duration-300 text-sm">
                Plan du site
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;