import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import PartyHallModal from './addrom/AddPartyHallModal';
import { toast } from "react-toastify";

interface PartyHallData {
  id: number;
  name: string;
  description: string;
  capacity: number;
  rental_price: number;
  is_available: boolean;
  hotel_id?: number;
  created_at?: string;
}

const API_BASE_URL = "http://localhost:5000/api";

const PartyHalls: React.FC = () => {
  // Récupération de l'ID de l'hôtel depuis le localStorage
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPartyHall, setSelectedPartyHall] = useState<PartyHallData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const queryClient = useQueryClient();

  // Au montage du composant, récupérer l'ID de l'hôtel
  useEffect(() => {
    const storedHotelId = localStorage.getItem("hotelId");
    if (storedHotelId) {
      setHotelId(storedHotelId);
    } else {
      toast.error("Aucun hôtel n'est associé à cet administrateur");
      // Rediriger si nécessaire
    }
  }, []);

  // Fetch party halls - seulement si hotelId est disponible
  const fetchPartyHalls = async () => {
    if (!hotelId) throw new Error("ID d'hôtel non disponible");
    
    try {
      const { data } = await axios.get(`${API_BASE_URL}/hotel/${hotelId}/event-rooms`);
      return data;
    } catch {
      throw new Error("Erreur lors du chargement des salles de fête");
    }
  };

  // Delete party hall
  const deletePartyHall = async (partyHallId: number) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/hotel/event-rooms/${partyHallId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // React Query hooks
  const { data: partyHalls, isLoading, error } = useQuery<PartyHallData[]>({
    queryKey: ["partyHalls", hotelId],
    queryFn: fetchPartyHalls,
    retry: 2,
    enabled: !!hotelId, // Ne s'exécute que si hotelId est disponible
  });

  const deleteMutation = useMutation({
    mutationFn: deletePartyHall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partyHalls", hotelId] });
      toast.success("Salle supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la salle");
    }
  });

  // Handlers
  const handleEdit = (partyHall: PartyHallData) => {
    setSelectedPartyHall(partyHall);
    setShowModal(true);
  };

  const handleDelete = (partyHallId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) {
      deleteMutation.mutate(partyHallId);
    }
  };

  // Filtering logic
  const filteredPartyHalls = partyHalls?.filter((hall) => {
    const matchesSearch = hall.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        hall.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCapacity = true;
    if (capacityFilter !== "all") {
      const capacity = hall.capacity;
      if (capacityFilter === "small") matchesCapacity = capacity <= 50;
      else if (capacityFilter === "medium") matchesCapacity = capacity > 50 && capacity <= 100;
      else if (capacityFilter === "large") matchesCapacity = capacity > 100;
    }
    
    return matchesSearch && matchesCapacity;
  });

  // Image handling
  const getImageUrl = (id: number) => {
    const images = [
      "https://images.unsplash.com/photo-1555244162-803834f70033",
      "https://images.unsplash.com/photo-1511578314322-379afb476865",
      "https://images.unsplash.com/photo-1531058020387-3be344556be6",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    ];
    return images[id % images.length];
  };

  // Test backend connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        if (hotelId) {
          await axios.get(`${API_BASE_URL}/hotel/${hotelId}/event-rooms`);
        }
      } catch (err) {
        console.error("Erreur de connexion au backend:", err);
      }
    };
    testConnection();
  }, [hotelId]);

  if (!hotelId) return <div className="p-6">Chargement de l'hôtel...</div>;
  if (isLoading) return <div className="p-6">Chargement des salles...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur: {error.message}</div>;

  return (
    <div className="p-6">
      <PartyHallModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPartyHall(null);
        }}
        partyHall={selectedPartyHall}
        hotelId={parseInt(hotelId)}
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["partyHalls", hotelId] });
          toast.success(selectedPartyHall ? "Salle mise à jour" : "Salle créée");
        }}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Salles de Fête</h2>
        <p className="text-gray-600">
          Gérer les salles d'événements de votre hôtel
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Rechercher des salles..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select 
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
          >
            <option value="all">Toutes les capacités</option>
            <option value="small">Jusqu'à 50 personnes</option>
            <option value="medium">50-100 personnes</option>
            <option value="large">100+ personnes</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i> Ajouter une Salle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartyHalls?.map((hall) => (
          <div
            key={hall.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="h-64 bg-gray-200 relative">
              <img
                src={getImageUrl(hall.id)}
                alt={hall.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // Fallback image
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555244162-803834f70033";
                }}
              />
              <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    hall.is_available ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{hall.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {hall.capacity <= 50 ? "Petite salle" : 
                     hall.capacity <= 100 ? "Moyenne salle" : "Grande salle"}
                  </p>
                </div>
                <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium">
                  {hall.rental_price.toFixed(2)} €/jour
                </div>
              </div>
              <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                {hall.description}
              </p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <div className="mr-4">
                  <i className="fas fa-users mr-2"></i>
                  {hall.capacity} Personnes max
                </div>
                <div>
                  <i className="fas fa-ruler-combined mr-2"></i>
                  {Math.round(hall.capacity * 0.8)}m² estimés
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <div>
                  <i className="fas fa-calendar-check mr-2"></i>
                  {hall.is_available ? "Disponible" : "Indisponible"}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(hall)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i> Modifier
                </button>
                <button
                  onClick={() => handleDelete(hall.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
         {filteredPartyHalls?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune salle trouvée</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i> Ajouter une salle
          </button>
        </div>
      )}
    </div>
  );
};

export default PartyHalls;