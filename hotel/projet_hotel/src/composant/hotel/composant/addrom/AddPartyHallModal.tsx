import React, { useState, useEffect } from "react";
import axios from "axios";

interface PartyHallData {
  id?: number;
  name: string;
  description: string;
  capacity: number;
  rental_price: number;
  is_available: boolean;
  hotel_id?: number;
  created_at?: string;
}

interface PartyHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyHall?: PartyHallData | null;
  hotelId: number;
  onSubmitSuccess: () => void;
}

const API_BASE_URL = "http://localhost:5000/api";

const PartyHallModal: React.FC<PartyHallModalProps> = ({
  isOpen,
  onClose,
  partyHall,
  hotelId,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState<PartyHallData>({
    name: "",
    description: "",
    capacity: 50,
    rental_price: 0,
    is_available: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (partyHall) {
      setFormData(partyHall);
    } else {
      setFormData({
        name: "",
        description: "",
        capacity: 50,
        rental_price: 0,
        is_available: true,
      });
    }
  }, [partyHall]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      (e.target as HTMLInputElement).type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : 
        type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (partyHall && partyHall.id) {
        await axios.put(
          `${API_BASE_URL}/hotel/event-rooms/${partyHall.id}`,
          formData,
          config
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/hotel/${hotelId}/event-rooms`,
          formData,
          config
        );
      }

      onSubmitSuccess();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement"
        );
      } else {
        setError("Une erreur est survenue lors de l'enregistrement");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {partyHall ? "Modifier la salle" : "Ajouter une nouvelle salle"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Nom de la salle
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Capacité (personnes)
            </label>
            <input
              type="number"
              name="capacity"
              min="10"
              max="1000"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Prix de location (€)
            </label>
            <input
              type="number"
              name="rental_price"
              min="0"
              step="0.01"
              value={formData.rental_price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Disponible à la réservation
            </label>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : partyHall ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartyHallModal;