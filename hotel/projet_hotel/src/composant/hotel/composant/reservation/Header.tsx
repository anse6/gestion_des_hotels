import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Réservations</h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Découvrez nos différentes options de réservation pour votre séjour ou événement
      </p>
    </div>
  );
};

export default Header;