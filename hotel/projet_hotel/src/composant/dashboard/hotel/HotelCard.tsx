import React, { useState } from 'react';
import type { Hotel } from './types';
import { motion } from 'framer-motion';
import ConfirmationModal from './ConfirmationModal';
import HotelDetailsModal from './HotelDetailsModal';

interface HotelCardProps {
  hotel: Hotel;
  onEdit: (hotel: Hotel) => void;
  onDelete: (id: number) => Promise<void>;
  showActionMenu: number | null;
  setShowActionMenu: (id: number | null) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onEdit,
  onDelete,
  showActionMenu,
  setShowActionMenu,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, index) => (
      <span key={index} className={index < count ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const cityQuery = hotel.city ? encodeURIComponent(hotel.city) : 'hotel';
    const countryQuery = hotel.country ? encodeURIComponent(hotel.country) : 'luxury';
    target.src = `https://readdy.ai/api/search-image?query=Luxury%20vineyard%20resort%20in%20Bordeaux%20with%20classic%20French%20chateau%20style%2C%20surrounded%20by%20rolling%20vineyards%20and%20wine%20estates.%20The%20hotel%20features%20stone%20architecture%2C%20elegant%20interiors%20with%20wine-themed%20decor%2C%20and%20outdoor%20dining%20areas%20overlooking%20the%20vines&width=600&height=400&seq=6&orientation=landscape'/?${cityQuery},${countryQuery},building`;
  };

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true);
      await onDelete(id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsDeleting(false);
      setShowActionMenu(null);
    }
  };

  const handleViewDetails = () => {
    setShowDetailsModal(true);
    setShowActionMenu(null);
  };

  return (
    <>
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        layout
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActionMenu(showActionMenu === hotel.id ? null : (hotel.id ?? null));
            }}
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white"
            disabled={isDeleting}
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showActionMenu === hotel.id && (
            <motion.div 
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(hotel);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 flex items-center transition-colors"
                disabled={isDeleting}
              >
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 flex items-center transition-colors"
                disabled={isDeleting}
              >
                <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                disabled={isDeleting}
              >
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Détails
              </button>
            </motion.div>
          )}
        </div>

        <div className="relative h-48 overflow-hidden">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="text-xl font-bold">{hotel.name}</h3>
            <div className="flex items-center mt-1">
              {renderStars(hotel.stars)}
            </div>
            <p className="mt-1 text-sm opacity-90">
              {hotel.city}, {hotel.country}
            </p>
          </div>
        </div>

        <div className="p-4">
          <p className="text-gray-600 line-clamp-2 text-sm h-12">
            {hotel.description}
          </p>
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{hotel.email}</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{hotel.phone}</span>
          </div>
        </div>
      </motion.div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDelete(hotel.id!)}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer l'hôtel "${hotel.name}" ? Cette action est irréversible.`}
        isLoading={isDeleting}
      />

      {/* Modal de détails de l'hôtel */}
      <HotelDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        hotel={hotel}
      />
    </>
  );
};

export default HotelCard;