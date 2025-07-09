import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import RoomModal from './addrom/RoomModal';
import { toast } from "react-toastify";

interface RoomData {
  id: number;
  room_number: string;
  description: string | null;
  room_type: string;
  capacity: number;
  price_per_night: number;
  is_available: boolean;
  hotel_id: number;
  created_at: string;
}

const API_BASE_URL = "http://localhost:5000/api";

const Rooms: React.FC = () => {
  // Récupération de l'ID de l'hôtel depuis le localStorage
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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

  // Fetch rooms - seulement si hotelId est disponible
  const fetchRooms = async () => {
    if (!hotelId) throw new Error("ID d'hôtel non disponible");
    
    try {
      const { data } = await axios.get(`${API_BASE_URL}/hotel/${hotelId}/rooms`);
      return data;
    } catch {
      throw new Error("Erreur lors du chargement des chambres");
    }
  };

  // Delete room
  const deleteRoom = async (roomId: number) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/hotel/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // React Query hooks
  const { data: rooms, isLoading, error } = useQuery<RoomData[]>({
    queryKey: ["rooms", hotelId],
    queryFn: fetchRooms,
    retry: 2,
    enabled: !!hotelId, // Ne s'exécute que si hotelId est disponible
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", hotelId] });
      toast.success("Chambre supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la chambre");
    }
  });
  // Handlers
  const handleEdit = (room: RoomData) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleDelete = (roomId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette chambre ?")) {
      deleteMutation.mutate(roomId);
    }
  };

  // Filtering logic
  const filteredRooms = rooms?.filter((room) => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (room.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || room.room_type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Image handling
  const getImageUrl = (roomType: string) => {
    const images: Record<string, string> = {
      standard: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
      double: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b",
      deluxe: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      suite: "https://images.unsplash.com/photo-1566669437685-2c5a585aded0",
      family: "https://images.unsplash.com/photo-1611892440504-42a792e24d32"
    };
    return images[roomType] || images["standard"];
  };

  // Test backend connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await axios.get(`${API_BASE_URL}/hotel/1/rooms`);
      } catch (err) {
        console.error("Erreur de connexion au backend:", err);
      }
    };
    testConnection();
  }, []);

  if (!hotelId) return <div className="p-6">Chargement de l'hôtel...</div>;
  if (isLoading) return <div className="p-6">Chargement des chambres...</div>;
  if (error) return <div className="p-6 text-red-500">Erreur: {error.message}</div>;

  return (
    <div className="p-6">
      <RoomModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        hotelId={parseInt(hotelId)} // Conversion en number si nécessaire
        onSubmitSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["rooms", hotelId] });
          toast.success(selectedRoom ? "Chambre mise à jour" : "Chambre créée");
        }}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Chambres</h2>
        <p className="text-gray-600">
          Gérez toutes les chambres de l'hôtel et leur disponibilité
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Rechercher des chambres..."
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
            <option value="standard">Standard</option>
            <option value="double">Double</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="family">Familiale</option>
          </select>
        </div>
        <div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i> Ajouter une Chambre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms?.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-48 bg-gray-200 relative">
              <img
                src={getImageUrl(room.room_type)}
                alt={`Chambre ${room.room_number}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b";
                }}
              />
              <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-sm">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    room.is_available ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    {room.room_type} - {room.room_number}
                  </h3>
                  <p className="text-gray-500 text-sm capitalize">
                    {room.room_type.toLowerCase()} • {room.capacity} {room.capacity > 1 ? "personnes" : "personne"}
                  </p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
                  {room.price_per_night.toFixed(2)} fca/nuit
                </div>
              </div>
              {room.description && (
                <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                  {room.description}
                </p>
              )}
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <div className="mr-4">
                  <i className="fas fa-bed mr-2"></i>
                  {room.capacity > 1 ? "2 Lits" : "1 Lit"}
                </div>
                <div>
                  <i className="fas fa-bath mr-2"></i>
                  Salle de bain
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <div>
                  <i className="fas fa-wifi mr-2"></i>
                  WiFi gratuit
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i> Modifier
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune chambre trouvée</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i> Ajouter une chambre
          </button>
        </div>
      )}
    </div>
  );
};

export default Rooms;