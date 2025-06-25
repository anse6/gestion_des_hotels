import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import HotelSearchHeader from './hotel/HotelSearchHeader';
import HotelList from './hotel/HotelList';
import HotelFormModal from './hotel/HotelFormModal';
import ConfirmationModal from './hotel/ConfirmationModal';
import HotelDetailsModal from './hotel/HotelDetailsModal';
import type { Hotel } from './hotel/types';

const API_URL = 'http://localhost:5000/api/hotel/';

const fetchHotels = async () => {
  const res = await axios.get<Hotel[]>(API_URL, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};

const createHotel = async (hotelData: Omit<Hotel, 'id' | 'created_at' | 'admin_id'>) => {
  const res = await axios.post(API_URL, hotelData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};

const updateHotel = async (hotel: Hotel) => {
  const res = await axios.put(`${API_URL}${hotel.id}`, hotel, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};

const deleteHotel = async (id: number) => {
  await axios.delete(`${API_URL}${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return id;
};

const HotelContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<number | null>(null);
  const [hotelDetails, setHotelDetails] = useState<Hotel | null>(null);
  const queryClient = useQueryClient();

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: fetchHotels,
  });

  const getDefaultHotelImage = (hotel: Hotel) => {
    const cityQuery = hotel.city ? encodeURIComponent(hotel.city) : 'hotel';
    const countryQuery = hotel.country ? encodeURIComponent(hotel.country) : 'luxury';
    const descriptors = ['hotel', 'luxury', 'resort', 'accommodation', 'travel'];
    const randomDescriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    
    return `https://readdy.ai/api/search-image?query=Luxury%20vineyard%20resort%20in%20Bordeaux%20with%20classic%20French%20chateau%20style%2C%20surrounded%20by%20rolling%20vineyards%20and%20wine%20estates.%20The%20hotel%20features%20stone%20architecture%2C%20elegant%20interiors%20with%20wine-themed%20decor%2C%20and%20outdoor%20dining%20areas%20overlooking%20the%20vines&width=600&height=400&seq=6&orientation=landscape'?${cityQuery},${countryQuery},${randomDescriptor}`;
  };

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: createHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setShowModal(false);
      setError(null);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || error.response?.data?.message || "Erreur lors de la création de l'hôtel");
      } else {
        setError("Erreur inconnue lors de la création de l'hôtel");
      }
    }
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setShowModal(false);
      setError(null);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || error.response?.data?.message || "Erreur lors de la mise à jour de l'hôtel");
      } else {
        setError("Erreur inconnue lors de la mise à jour de l'hôtel");
      }
    }
  });

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      setShowDeleteModal(false);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || error.response?.data?.message || "Erreur lors de la suppression de l'hôtel");
      } else {
        setError("Erreur inconnue lors de la suppression de l'hôtel");
      }
    }
  });

  const filteredHotels = hotels.map(hotel => ({
    ...hotel,
    image: hotel.image || getDefaultHotelImage(hotel)
  })).filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateHotel = () => {
    setCurrentHotel({
      name: "",
      description: "",
      stars: 3,
      email: "",
      phone: "",
      website: "",
      city: "",
      country: "",
      admin_email: "",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditHotel = (hotel: Hotel) => {
    setCurrentHotel(hotel);
    setIsEditing(true);
    setShowModal(true);
    setShowActionMenu(null);
  };

  const handleDeleteClick = async (id: number): Promise<void> => {
    setHotelToDelete(id);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const handleConfirmDelete = () => {
    if (hotelToDelete) {
      deleteMutate(hotelToDelete);
    }
  };

  const handleViewDetails = (hotel: Hotel) => {
    setHotelDetails(hotel);
    setShowDetailsModal(true);
    setShowActionMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHotel) return;

    const hotelData = {
      name: currentHotel.name,
      description: currentHotel.description,
      stars: currentHotel.stars,
      email: currentHotel.email,
      phone: currentHotel.phone,
      website: currentHotel.website || '',
      city: currentHotel.city,
      country: currentHotel.country,
      admin_email: currentHotel.admin_email
    };

    if (isEditing && currentHotel.id) {
      updateMutate({ ...currentHotel, ...hotelData });
    } else {
      createMutate(hotelData);
    }
  };

  return (
    <div className="p-6 min-h-[1024px] bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Gestion des Hôtels
      </h1>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <HotelSearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateHotel={handleCreateHotel}
      />

      <HotelList
        hotels={filteredHotels}
        onEdit={handleEditHotel}
        onDelete={handleDeleteClick}
        onViewDetails={handleViewDetails}
        showActionMenu={showActionMenu}
        setShowActionMenu={setShowActionMenu}
        isLoading={isLoading}
      />

      {showModal && currentHotel && (
        <HotelFormModal
          hotel={currentHotel}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onInputChange={(e) => {
            const { name, value } = e.target;
            setCurrentHotel(prev => prev ? { ...prev, [name]: value } : null);
          }}
          onStarChange={(rating) => {
            setCurrentHotel(prev => prev ? { ...prev, stars: rating } : null);
          }}
          onClose={() => setShowModal(false)}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer cet hôtel ? Cette action est irréversible.`}
        isLoading={isDeleting}
      />

      {hotelDetails && (
        <HotelDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          hotel={hotelDetails}
        />
      )}
    </div>
  );
};

export default HotelContent;