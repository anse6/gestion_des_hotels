import { useState, useEffect } from 'react';
import { Edit, Trash2, X, Download } from 'lucide-react';
import axios from 'axios';
import Footer from '../composant/Footer';
import Header from '../composant/Header';

interface Reservation {
  id: number;
  type?: 'chambre' | 'appartement' | 'salle';
  nom: string;
  prenom: string;
  dates?: string;
  prix_total: number;
  statut?: 'en attente' | 'confirmée' | 'annulée';
  date_evenement?: string;
  date_arrivee?: string;
  date_depart?: string;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        }),
        axios.get('http://localhost:5000/api/reservations/apartments', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/reservations/event-rooms', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const rooms = roomsRes.data.map((r: Reservation) => ({
        ...r,
        type: 'chambre',
        nom: r.nom || '',
        prenom: r.prenom || '',
        statut: r.statut || 'en attente',
        dates: r.dates || (r.date_arrivee && r.date_depart ? `${r.date_arrivee} au ${r.date_depart}` : 'Dates non spécifiées')
      }));

      const apartments = apartmentsRes.data.map((a: Reservation) => ({
        ...a,
        type: 'appartement',
        nom: a.nom || '',
        prenom: a.prenom || '',
        statut: a.statut || 'en attente',
        dates: a.dates || (a.date_arrivee && a.date_depart ? `${a.date_arrivee} au ${a.date_depart}` : 'Dates non spécifiées')
      }));

      const eventRooms = eventRoomsRes.data.map((e: Reservation) => ({
        ...e,
        type: 'salle',
        nom: e.nom || '',
        prenom: e.prenom || '',
        statut: e.statut || 'en attente',
        dates: e.date_evenement || 'Date non spécifiée',
        date_evenement: e.date_evenement || ''
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
        default:
          setError('Type de réservation non reconnu');
          return;
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
    setReservationToEdit({
      ...reservation,
      statut: reservation.statut || 'en attente'
    });
    setShowEditModal(true);
  };

  const handleDownload = (reservation: Reservation) => {
    const content = `Réservation ${reservation.id}\n\n` +
                   `Client: ${reservation.prenom} ${reservation.nom}\n` +
                   `Type: ${reservation.type}\n` +
                   `Dates: ${reservation.dates}\n` +
                   `Prix: ${reservation.prix_total} XAF\n` +
                   `Statut: ${reservation.statut || 'Non spécifié'}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservation_${reservation.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateReservation = async () => {
    if (!reservationToEdit) return;

    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let data: Partial<Reservation> = {};

      if (reservationToEdit.type === 'salle') {
        data = {
          event_room_id: reservationToEdit.event_room_id || reservationToEdit.id,
          nom: reservationToEdit.nom || '',
          prenom: reservationToEdit.prenom || '',
          email: reservationToEdit.email || '',
          type_evenement: reservationToEdit.type_evenement || 'autre',
          date_evenement: reservationToEdit.date_evenement || '',
          heure_debut: reservationToEdit.heure_debut || '',
          heure_fin: reservationToEdit.heure_fin || '',
          nombre_invites: reservationToEdit.nombre_invites || 0,
          methode_paiement: reservationToEdit.methode_paiement?.trim() || '',
          prix_total: reservationToEdit.prix_total ?? 0,
          notes: reservationToEdit.notes?.trim() || '',
          statut: (reservationToEdit.statut?.toLowerCase() as 'en attente' | 'confirmée' | 'annulée') || 'en attente'
        };

        endpoint = `http://localhost:5000/api/reservations/event-rooms/${reservationToEdit.id}`;
      } else {
        data = {
          nom: reservationToEdit.nom || '',
          prenom: reservationToEdit.prenom || '',
          email: reservationToEdit.email || '',
          date_arrivee: reservationToEdit.date_arrivee || '',
          date_depart: reservationToEdit.date_depart || '',
          nombre_personnes: reservationToEdit.nombre_personnes || 0,
          methode_paiement: reservationToEdit.methode_paiement?.trim() || '',
          prix_total: reservationToEdit.prix_total ?? 0,
          notes: reservationToEdit.notes?.trim() || '',
          statut: (reservationToEdit.statut?.toLowerCase() as 'en attente' | 'confirmée' | 'annulée') || 'en attente'
        };

        if (reservationToEdit.type === 'chambre') {
          data.room_id = reservationToEdit.room_id || reservationToEdit.id;
          endpoint = `http://localhost:5000/api/reservations/rooms/${reservationToEdit.id}`;
        } else {
          data.apartment_id = reservationToEdit.apartment_id || reservationToEdit.id;
          endpoint = `http://localhost:5000/api/reservations/apartments/${reservationToEdit.id}`;
        }
      }

      const response = await axios.put(endpoint, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        setReservations(prev =>
          prev.map(r =>
            r.id === reservationToEdit.id ? { 
              ...response.data, 
              type: reservationToEdit.type,
              statut: response.data.statut || 'en attente',
              dates: reservationToEdit.type === 'salle' 
                ? response.data.date_evenement || reservationToEdit.date_evenement
                : `${response.data.date_arrivee || reservationToEdit.date_arrivee} au ${response.data.date_depart || reservationToEdit.date_depart}`
            } : r
          )
        );
        setShowEditModal(false);
        setReservationToEdit(null);
      } else {
        throw new Error('Réponse vide du serveur');
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erreur lors de la mise à jour: ${err.response?.data?.message || err.message}`);
      } else if (err instanceof Error) {
        setError(`Erreur lors de la mise à jour: ${err.message}`);
      } else {
        setError('Erreur inconnue lors de la mise à jour');
      }
    }
  };

  const getStatusColor = (statut?: string) => {
    const status = statut?.toLowerCase() || '';
    
    switch (status) {
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

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'chambre': return 'Chambre';
      case 'appartement': return 'Appartement';
      case 'salle': return 'Salle de fête';
      default: return type || 'Non spécifié';
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
    <>
      <Header />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Liste de mes Réservations</h1>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
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
                          {reservation.statut || 'Non défini'}
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
                            onClick={() => handleDownload(reservation)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Télécharger"
                          >
                            <Download size={16} />
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
            
            {reservations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune réservation trouvée.
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

        {/* Modal d'édition COMPLET */}
        {showEditModal && reservationToEdit && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Modifier la réservation - {getTypeLabel(reservationToEdit.type)}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informations personnelles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reservationToEdit.nom || ''}
                    onChange={(e) => setReservationToEdit({
                      ...reservationToEdit,
                      nom: e.target.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reservationToEdit.prenom || ''}
                    onChange={(e) => setReservationToEdit({
                      ...reservationToEdit,
                      prenom: e.target.value
                    })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reservationToEdit.email || ''}
                    onChange={(e) => setReservationToEdit({
                      ...reservationToEdit,
                      email: e.target.value
                    })}
                  />
                </div>

                {/* Dates - différentes selon le type */}
                {reservationToEdit.type === 'salle' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de l'événement</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={reservationToEdit.date_evenement || ''}
                        onChange={(e) => setReservationToEdit({
                          ...reservationToEdit,
                          date_evenement: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement</label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={reservationToEdit.type_evenement || 'autre'}
                        onChange={(e) => setReservationToEdit({
                          ...reservationToEdit,
                          type_evenement: e.target.value
                        })}
                      >
                        <option value="mariage">Mariage</option>
                        <option value="anniversaire">Anniversaire</option>
                        <option value="conference">Conférence</option>
                        <option value="reunion">Réunion</option>
                        <option value="formation">Formation</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={reservationToEdit.heure_fin || ''}
                        onChange={(e) => setReservationToEdit({
                          ...reservationToEdit,
                          heure_fin: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'invités</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={reservationToEdit.nombre_invites || ''}
                        onChange={(e) => setReservationToEdit({
                          ...reservationToEdit,
                          nombre_invites: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date d'arrivée</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={reservationToEdit.date_arrivee || ''}
                        onChange={(e) => setReservationToEdit({
                          ...reservationToEdit,
                          date_arrivee: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={reservationToEdit.date_depart || ''}
                        onChange={(e) => setReservationToEdit({
                          ...reservationToEdit,
                          date_depart: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={reservationToEdit.nombre_personnes || ''}
                        onChange={(e) => setReservationToEdit({
                          ...reservationToEdit,
                          nombre_personnes: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>
                  </>
                )}

                {/* Prix et méthode de paiement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix total (XAF)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reservationToEdit.prix_total || ''}
                    onChange={(e) => setReservationToEdit({
                      ...reservationToEdit,
                      prix_total: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reservationToEdit.methode_paiement || ''}
                    onChange={(e) => setReservationToEdit({
                      ...reservationToEdit,
                      methode_paiement: e.target.value
                    })}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="especes">Espèces</option>
                    <option value="carte">Carte bancaire</option>
                    <option value="virement">Virement</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reservationToEdit.statut || 'en attente'}
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

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={reservationToEdit.notes || ''}
                    onChange={(e) => setReservationToEdit({
                      ...reservationToEdit,
                      notes: e.target.value
                    })}
                    placeholder="Notes supplémentaires..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
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
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ReservationsList;