import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

interface RoomFormData {
  room_number: string;
  description: string | null;
  room_type: string;
  capacity: number;
  price_per_night: number;
  is_available: boolean;
}

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomFormData & { id: number };
  onSubmit: (formData: RoomFormData) => void;
  onDelete: () => void;
  isLoading: boolean;
  isDeleting: boolean;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  onSubmit,
  onDelete,
  isLoading,
  isDeleting
}) => {
  const [formData, setFormData] = React.useState<RoomFormData>({
    room_number: "",
    description: null, // Correction ici: Initialisation à null pour correspondre à l'interface
    room_type: "standard",
    capacity: 1,
    price_per_night: 0,
    is_available: true
  });

  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Charger les données de la chambre lorsque le modal s'ouvre
  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number,
        description: room.description,
        room_type: room.room_type,
        capacity: room.capacity,
        price_per_night: room.price_per_night,
        is_available: room.is_available
      });
    }
  }, [room]);

  const roomTypes = [
    { value: "standard", label: "Standard" },
    { value: "double", label: "Double" },
    { value: "deluxe", label: "Deluxe" },
    { value: "suite", label: "Suite" },
    { value: "family", label: "Familiale" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked :
        type === 'number' ? (value === '' ? 0 : parseFloat(value)) :
        value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation simple
    if (!formData.room_number.trim()) {
      toast.error("Le numéro de chambre est obligatoire");
      return;
    }

    if (formData.price_per_night <= 0) {
      toast.error("Le prix doit être supérieur à 0");
      return;
    }

    onSubmit(formData);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // Réinitialise après 3 secondes
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Modifier la Chambre {room.room_number}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isLoading || isDeleting}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de chambre *
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading || isDeleting}
                placeholder="Ex: 101, 202A..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description ?? ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isLoading || isDeleting}
                placeholder="Décrivez la chambre (équipements, vue, etc.)"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de chambre *
              </label>
              <select
                name="room_type"
                value={formData.room_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading || isDeleting}
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité (personnes) *
                </label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  max="10"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading || isDeleting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix par nuit (fcfa) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  <input
                    type="number"
                    name="price_per_night"
                    min="0"
                    step="0.01"
                    value={formData.price_per_night}
                    onChange={handleInputChange}
                    className="w-full pl-8 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isLoading || isDeleting}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleInputChange}
                className="mr-2"
                id="is_available_edit"
                disabled={isLoading || isDeleting}
              />
              <label htmlFor="is_available_edit" className="text-sm font-medium text-gray-700">
                Disponible immédiatement
              </label>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                  confirmDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                } transition-colors`}
                disabled={isDeleting || isLoading}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suppression...
                  </>
                ) : confirmDelete ? (
                  "Confirmer la suppression"
                ) : (
                  <>
                    <i className="fas fa-trash-alt mr-2"></i> Supprimer
                  </>
                )}
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isLoading || isDeleting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-w-24"
                  disabled={isLoading || isDeleting}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;