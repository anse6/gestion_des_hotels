import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from './../../authentification/hooks/useAuth';

const Header: React.FC = () => {
  const { logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const hotelName = localStorage.getItem('hotelName');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link 
              to={isLoggedIn && userRole !== 'user' ? '/' : '/users'} 
              className="text-xl md:text-2xl font-bold hover:text-blue-200 transition duration-300 flex items-center"
            >
              
              <span className="hidden sm:inline">
                 Anseehoʊ.t̬əl<span className="text-blue-500">T</span> {/* Signature avec le T stylisé */}
              </span>
              <span className="sm:hidden">
                A<span className="text-blue-500">T</span> {/* Version abrégée */}
              </span>
            </Link>
          </div>
          
          {/* Menu Desktop (visible à partir de md) */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-2 lg:space-x-4">
              <li>
                <Link 
                  to={isLoggedIn && userRole !== 'user' ? '/' : '/users'} 
                  className="px-2 py-1 lg:px-3 lg:py-2 bg-white text-blue-800 rounded-lg font-medium hover:bg-blue-100 transition duration-300 text-xs lg:text-sm"
                >
                  Accueil
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/about" 
                  className="px-2 py-1 lg:px-3 lg:py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300 text-xs lg:text-sm"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="px-2 py-1 lg:px-3 lg:py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300 text-xs lg:text-sm"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="px-2 py-1 lg:px-3 lg:py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300 text-xs lg:text-sm"
                >
                  Contact
                </Link>
              </li>
              
              {isLoggedIn && (
                <li>
                  <Link 
                    to="/my_reservation" 
                    className="px-2 py-1 lg:px-3 lg:py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300 text-xs lg:text-sm"
                  >
                    mes Réservations
                  </Link>
                </li>
              )}
              
              {isLoggedIn ? (
                <li className="flex items-center space-x-2 lg:space-x-4">
                  <div className="hidden lg:flex items-center space-x-3 bg-blue-700/50 px-3 lg:px-4 py-1 lg:py-2 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium text-xs lg:text-sm">{userName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-200">
                          {userRole === 'admin' && hotelName ? `${hotelName.substring(0, 10)}${hotelName.length > 10 ? '...' : ''} • ` : ''}
                          {userEmail ? `${userEmail.substring(0, 10)}${userEmail.length > 10 ? '...' : ''}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="h-6 w-6 lg:h-8 lg:w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <FaUserCircle className="text-sm lg:text-xl" />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex items-center px-2 py-1 lg:px-3 lg:py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition duration-300 text-xs lg:text-sm"
                  >
                    <FaSignOutAlt className="mr-1" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </li>
              ) : (
                <li>
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center px-3 py-1 lg:px-4 lg:py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-medium transition duration-300 text-xs lg:text-sm"
                  >
                    <FaUserCircle className="mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Connexion</span>
                  </button>
                </li>
              )}
            </ul>
          </nav>
          
          {/* Menu Mobile (visible en dessous de md) */}
          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <div className="flex items-center mr-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                  <FaUserCircle className="text-lg" />
                </div>
              </div>
            )}
            
            <button 
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        
        {/* Menu Mobile déroulant */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <ul className="flex flex-col space-y-3">
              <li>
                <Link 
                  to={isLoggedIn && userRole !== 'user' ? '/' : '/users'} 
                  className="block px-4 py-2 bg-white text-blue-800 rounded-lg font-medium hover:bg-blue-100 transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accueil
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/about" 
                  className="block px-4 py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  to="/services" 
                  className="block px-4 py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="block px-4 py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              
              {isLoggedIn && (
                <li>
                  <Link 
                    to="/my_reservation" 
                    className="block px-4 py-2 hover:bg-white hover:text-blue-800 rounded-lg font-medium transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mes réservations
                  </Link>
                </li>
              )}
              
              {isLoggedIn ? (
                <>
                  <li className="px-4 py-2 bg-blue-700/50 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium">{userName}</span>
                      <span className="text-sm text-blue-200">
                        {userRole === 'admin' && hotelName ? `${hotelName} • ` : ''}
                        {userEmail}
                      </span>
                    </div>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition duration-300"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={handleLoginClick}
                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-medium transition duration-300"
                  >
                    <FaUserCircle className="mr-2" />
                    Connexion
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;