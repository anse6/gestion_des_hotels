import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ApartmentModal from "./addrom/ApartmentModal";
import { toast } from "react-toastify";

interface ApartmentData {
  id: number;
  name: string;
  description: string;
  apartment_type: string;
  capacity: number;
  room_count: number;
  has_wifi: boolean;
  price_per_night: number;
  is_available: boolean;
  hotel_id: number;
  created_at: string;
}

const API_BASE_URL = "http://localhost:5000/api";

const Apartments: React.FC = () => {
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<ApartmentData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    if (storedHotelId) {
      setHotelId(storedHotelId);
    } else {
      toast.error("Aucun hôtel n'est associé à cet administrateur");
    }
  }, []);

  const fetchApartments = async () => {
    if (!hotelId) throw new Error("ID d'hôtel non disponible");
    try {
      const { data } = await axios.get(`${API_BASE_URL}/hotel/${hotelId}/apartments`);
      return data;
    } catch {
      throw new Error("Erreur lors du chargement des appartements");
    }
  };

  const deleteApartment = async (apartmentId: number) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/hotel/apartments/${apartmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const { data: apartments, isLoading, error } = useQuery<ApartmentData[]>({
    queryKey: ["apartments", hotelId],
    queryFn: fetchApartments,
    retry: 2,
    enabled: !!hotelId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments", hotelId] });
      toast.success("Appartement supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'appartement");
    }
  });

  const getImageUrl = (apartmentType: string): string => {
    const images: Record<string, string> = {
      "studio": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      "1-bedroom": "https://images.unsplash.com/photo-1560448076-9ee6b1a8c83d",
      "2-bedroom": "https://images.unsplash.com/photo-1513694203232-719a280e022f",
      "duplex": "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      "penthouse": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
    };
    return images[apartmentType] || images["studio"];
  };

  const handleEdit = (apartment: ApartmentData) => {
    setSelectedApartment(apartment);
    setShowModal(true);
  };

  const handleDelete = (apartmentId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet appartement ?")) {
      deleteMutation.mutate(apartmentId);
    }
  };

  const filteredApartments = apartments?.filter((apt) => {
    const matchesSearch = apt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         apt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || apt.apartment_type === typeFilter;
    return matchesSearch && matchesType;
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        if (hotelId) {
          await axios.get(`${API_BASE_URL}/hotel/${hotelId}/apartments`);
        }
      } catch (err) {
        console.error("Erreur de connexion au backend:", err);
      }
    };
    testConnection();
  }, [hotelId]);

  if (!hotelId) return <div className="p-6">Chargement de l'hôtel...</div>;
  if (isLoading) return <div className="p-6">Chargement des appartements...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur: {error.message}</div>;

  return (
    <div className="p-6">
      <ApartmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedApartment(null);
        }}
        apartment={selectedApartment}
        hotelId={parseInt(hotelId)} // Conversion en number si nécessaire
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["apartments", hotelId] });
          toast.success(selectedApartment ? "Appartement mis à jour" : "Appartement créé");
        }}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Appartements</h2>
        <p className="text-gray-600">
          Gérer les appartements et résidences de longue durée
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Rechercher un appartement..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select 
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="studio">Studio</option>
            <option value="1-bedroom">1 Chambre</option>
            <option value="2-bedroom">2 Chambres</option>
            <option value="duplex">Duplex</option>
            <option value="penthouse">Penthouse</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i> Ajouter un appartement
          </button>
        </div>
      </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApartments?.map((apartment) => (
          <div key={apartment.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <img
                src={getImageUrl(apartment.apartment_type)}
                alt={apartment.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "../../assets/anser.jpg";
                }}
              />

              <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    apartment.is_available ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{apartment.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {{
                      "studio": "Studio",
                      "1-bedroom": "1 Chambre",
                      "2-bedroom": "2 Chambres",
                      "duplex": "Duplex",
                      "penthouse": "Penthouse"
                    }[apartment.apartment_type] || "Appartement"}
                  </p>
                </div>
                <div className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm font-medium">
                  {apartment.price_per_night.toFixed(2)} fca/nuit
                </div>
              </div>
              <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                {apartment.description}
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <div className="mr-4">
                  <i className="fas fa-user-friends mr-2"></i>
                  {apartment.capacity} Personnes
                </div>
                <div>
                  <i className="fas fa-bed mr-2"></i>
                  {apartment.room_count} Pièces
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <div className="mr-4">
                  <i className="fas fa-wifi mr-2"></i>
                  {apartment.has_wifi ? "WiFi inclus" : "Pas de WiFi"}
                </div>
                <div>
                  <i className="fas fa-calendar-check mr-2"></i>
                  {apartment.is_available ? "Disponible" : "Indisponible"}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(apartment)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i> Modifier
                </button>
                <button
                  onClick={() => handleDelete(apartment.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

       {filteredApartments?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun Appartement  trouvée</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i> Ajouter un Appartement
          </button>
        </div>
      )}
    </div>
  );
};

export default Apartments;