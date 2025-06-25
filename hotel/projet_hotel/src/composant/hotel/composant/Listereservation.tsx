import { useState, useEffect } from 'react';
import { Edit, Trash2, X, Search, Filter } from 'lucide-react';
import axios from 'axios';

interface Reservation {
  id: number;
  type?: 'chambre' | 'appartement' | 'salle';
  nom: string;
  prenom: string;
  dates?: string;
  prix_total: number;
  statut: 'en attente' | 'confirmée' | 'annulée';
  date_evenement?: string;
  room_id?: number;
  apartment_id?: number;
  event_room_id?: number;
  email?: string;
  nombre_personnes?: number;
  nombre_invites?: number;
  methode_paiement?: string;
  notes?: string;
  type_evenement?: string;
  heure_debut?: string;
  heure_fin?: string;
}

const ReservationsList = () => {
  const [activeFilter, setActiveFilter] = useState<'toutes' | 'chambre' | 'appartement' | 'salle'>('toutes');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filters = [
    { key: 'toutes', label: 'Toutes les réservations' },
    { key: 'chambre', label: 'Chambres' },
    { key: 'appartement', label: 'Appartements' },
    { key: 'salle', label: 'Salles de fête' }
  ];

  const statusOptions = [
    { value: 'tous', label: 'Tous les statuts' },
    { value: 'en attente', label: 'En attente' },
    { value: 'confirmée', label: 'Confirmées' },
    { value: 'annulée', label: 'Annulées' }
  ];

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [roomsRes, apartmentsRes, eventRoomsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/reservations/rooms', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm,
            status: statusFilter !== 'tous' ? statusFilter : undefined,
            from_date: dateRange.start,
            to_date: dateRange.end
          }
        }),
        axios.get('http://localhost:5000/api/reservations/apartments', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm,
            status: statusFilter !== 'tous' ? statusFilter : undefined,
            from_date: dateRange.start,
            to_date: dateRange.end
          }
        }),
        axios.get('http://localhost:5000/api/reservations/event-rooms', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchTerm,
            status: statusFilter !== 'tous' ? statusFilter : undefined,
            from_date: dateRange.start,
            to_date: dateRange.end
          }
        })
      ]);

      const rooms = roomsRes.data.map((r: any) => ({
        ...r,
        type: 'chambre',
        nom: r.nom,
        prenom: r.prenom,
        dates: r.dates || `${r.date_arrivee} au ${r.date_depart}`
      }));

      const apartments = apartmentsRes.data.map((a: any) => ({
        ...a,
        type: 'appartement',
        nom: a.nom,
        prenom: a.prenom,
        dates: a.dates || `${a.date_arrivee} au ${a.date_depart}`
      }));

      const eventRooms = eventRoomsRes.data.map((e: any) => ({
        ...e,
        type: 'salle',
        nom: e.nom,
        prenom: e.prenom,
        dates: e.date_evenement,
        date_evenement: e.date_evenement
      }));

      setReservations([...rooms, ...apartments, ...eventRooms]);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des réservations');
      setLoading(false);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!reservationToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (reservationToDelete.type) {
        case 'chambre':
          endpoint = `http://localhost:5000/api/reservations/rooms/${reservationToDelete.id}`;
          break;
        case 'appartement':
          endpoint = `http://localhost:5000/api/reservations/apartments/${reservationToDelete.id}`;
          break;
        case 'salle':
          endpoint = `http://localhost:5000/api/reservations/event-rooms/${reservationToDelete.id}`;
          break;
      }

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReservations(prev => prev.filter(r => r.id !== reservationToDelete.id));
      setShowDeleteModal(false);
      setReservationToDelete(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setReservationToEdit(reservation);
    setShowEditModal(true);
  };

const handleUpdateReservation = async () => {
  if (!reservationToEdit) return;

  try {
    const token = localStorage.getItem('token');
    let endpoint = '';
    let data: any = {};

    // Préparer les données différemment selon le type de réservation
    if (reservationToEdit.type === 'salle') {
      data = {
        event_room_id: reservationToEdit.event_room_id || reservationToEdit.id,
        nom: reservationToEdit.nom,
        prenom: reservationToEdit.prenom,
        email: reservationToEdit.email || '',
        type_evenement: reservationToEdit.type_evenement || 'autre',
        date_evenement: reservationToEdit.date_evenement,
        heure_debut: reservationToEdit.heure_debut || '',
        heure_fin: reservationToEdit.heure_fin || '',
        nombre_invites: reservationToEdit.nombre_invites,
        methode_paiement: reservationToEdit.methode_paiement?.trim(),
        prix_total: reservationToEdit.prix_total?.toString(),
        notes: reservationToEdit.notes?.trim(),
        statut: reservationToEdit.statut?.toLowerCase()
      };

      endpoint = `http://localhost:5000/api/reservations/event-rooms/${reservationToEdit.id}`;
    } else {
      // Pour chambres et appartements
      data = {
        nom: reservationToEdit.nom,
        prenom: reservationToEdit.prenom,
        email: reservationToEdit.email || '',
        nombre_personnes: reservationToEdit.nombre_personnes,
        heure_debut: reservationToEdit.heure_debut,
        heure_fin: reservationToEdit.heure_fin,
        methode_paiement: reservationToEdit.methode_paiement?.trim(),
        prix_total: reservationToEdit.prix_total?.toString(),
        notes: reservationToEdit.notes?.trim(),
        statut: reservationToEdit.statut?.toLowerCase()
      };

      if (reservationToEdit.type === 'chambre') {
        data.room_id = reservationToEdit.room_id || reservationToEdit.id;
        endpoint = `http://localhost:5000/api/reservations/rooms/${reservationToEdit.id}`;
      } else {
        data.apartment_id = reservationToEdit.apartment_id || reservationToEdit.id;
        endpoint = `http://localhost:5000/api/reservations/apartments/${reservationToEdit.id}`;
      }
    }

    console.log('Données envoyées:', data);

    const response = await axios.put(endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    setReservations(prev =>
      prev.map(r =>
        r.id === reservationToEdit.id ? { ...response.data, type: reservationToEdit.type } : r
      )
    );
    setShowEditModal(false);
    setReservationToEdit(null);
  } catch (err) {
    if (err && typeof err === 'object' && 'response' in err) {
      const errorResponse = (err as any).response;
      console.error('Erreur détaillée:', {
        error: err,
        response: errorResponse?.data
      });
      setError(`Erreur lors de la mise à jour: ${errorResponse?.data?.error || (err as any).message}`);
    } else {
      console.error('Erreur détaillée:', err);
      setError(`Erreur lors de la mise à jour: ${(err as any).message || 'Erreur inconnue'}`);
    }
  }
};


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('tous');
    setDateRange({ start: '', end: '' });
    fetchReservations();
  };

  const filteredReservations = reservations.filter(reservation => {
    if (activeFilter === 'toutes') return true;
    return reservation.type === activeFilter;
  });

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'confirmée':
        return 'bg-green-100 text-green-800';
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'chambre': return 'Chambre';
      case 'appartement': return 'Appartement';
      case 'salle': return 'Salle de fête';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
            <button 
              onClick={fetchReservations}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Réessayer 
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Liste des Réservations</h1>
        
        {/* Barre de recherche et filtres */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Rechercher
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Filter size={16} />
                Filtres
              </button>
            </div>
          </form>

          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Appliquer les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filtres par type */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as 'toutes' | 'chambre' | 'appartement' | 'salle')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau des réservations */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={`${reservation.type}-${reservation.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.prenom} {reservation.nom}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTypeLabel(reservation.type)}
                      </div>
                      {reservation.type === 'chambre' && reservation.room_id && (
                        <div className="text-xs text-gray-500">Chambre #{reservation.room_id}</div>
                      )}
                      {reservation.type === 'appartement' && reservation.apartment_id && (
                        <div className="text-xs text-gray-500">Appartement #{reservation.apartment_id}</div>
                      )}
                      {reservation.type === 'salle' && reservation.event_room_id && (
                        <div className="text-xs text-gray-500">Salle #{reservation.event_room_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.dates}
                      {reservation.type === 'chambre' || reservation.type === 'appartement' ? (
                        <div className="text-xs text-gray-500">
                          {reservation.nombre_personnes} personne{reservation.nombre_personnes !== 1 ? 's' : ''}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          {reservation.nombre_invites} invité{reservation.nombre_invites !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.prix_total?.toLocaleString()} XAF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.statut)}`}>
                        {reservation.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(reservation)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setReservationToDelete(reservation);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReservations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune réservation trouvée pour ce filtre.
            </div>
          )}
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la réservation de {reservationToDelete?.prenom} {reservationToDelete?.nom} ?
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && reservationToEdit && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Modifier la réservation
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reservationToEdit.statut}
                  onChange={(e) => setReservationToEdit({
                    ...reservationToEdit,
                    statut: e.target.value as 'en attente' | 'confirmée' | 'annulée'
                  })}
                >
                  <option value="en attente">En attente</option>
                  <option value="confirmée">Confirmée</option>
                  <option value="annulée">Annulée</option>
                </select>
              </div>
              
{reservationToEdit.type === 'chambre' || reservationToEdit.type === 'appartement' ? (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
      <input
        type="number"
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={reservationToEdit.nombre_personnes || ''}
        onChange={(e) => setReservationToEdit({
          ...reservationToEdit,
          nombre_personnes: parseInt(e.target.value) || 0
        })}
      />
    </div>
  </>
) : (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'invités</label>
    <input
      type="number"
      className="w-full border border-gray-300 rounded-lg px-3 py-2"
      value={reservationToEdit.nombre_invites || ''}
      onChange={(e) => setReservationToEdit({
        ...reservationToEdit,
        nombre_invites: parseInt(e.target.value) || 0
      })}
    />
  </div>
)}

{reservationToEdit.type === 'salle' && (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
      <input
        type="time"
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={reservationToEdit.heure_debut || ''}
        onChange={(e) => setReservationToEdit({
          ...reservationToEdit,
          heure_debut: e.target.value
        })}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
      <input
        type="time"
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        value={reservationToEdit.heure_fin || ''}
        onChange={(e) => setReservationToEdit({
          ...reservationToEdit,
          heure_fin: e.target.value
        })}
      />
    </div>
  </>
)}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={reservationToEdit.methode_paiement || ''}
                  onChange={(e) => setReservationToEdit({
                    ...reservationToEdit,
                    methode_paiement: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  value={reservationToEdit.notes || ''}
                  onChange={(e) => setReservationToEdit({
                    ...reservationToEdit,
                    notes: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateReservation}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsList;