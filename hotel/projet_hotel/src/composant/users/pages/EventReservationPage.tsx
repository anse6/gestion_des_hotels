import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../composant/Header';
import Footer from '../composant/Footer';
import EventPaymentModal from './EventPaymentModal';

type EventReservationData = {
  event_room_id: number;
  nom: string;
  prenom: string;
  email: string;
  type_evenement: string;
  date_evenement: string;
  heure_debut: string;
  heure_fin: string;
  nombre_invites: number;
  methode_paiement: string;
  notes: string;
};

type EventSpaceType = {
  id: number;
  name: string;
  description: string;
  rental_price: number;
  capacity: number;
};

const EventReservationPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [space, setSpace] = useState<EventSpaceType | null>(location.state?.space);
  const [formData, setFormData] = useState<EventReservationData>({
    event_room_id: parseInt(roomId || '0'),
    nom: '',
    prenom: '',
    email: '',
    type_evenement: 'mariage',
    date_evenement: '',
    heure_debut: '',
    heure_fin: '',
    nombre_invites: 50,
    methode_paiement: 'orange',
    notes: ''
  });
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationId, setReservationId] = useState<number | null>(null);

  const eventTypes = [
    'mariage',
    'conférence',
    'séminaire',
    'anniversaire',
    'réunion',
    'autre'
  ];

  const paymentMethods = [
    'orange',
    'mtn',
    'espèces'
  ];

  useEffect(() => {
    if (!space && roomId) {
      const fetchSpaceDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/event-rooms/${roomId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) throw new Error('Erreur lors de la récupération des détails');
          const data = await response.json();
          setSpace(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchSpaceDetails();
    }
  }, [space, roomId]);

  useEffect(() => {
    if (space?.rental_price) {
      setTotalPrice(space.rental_price);
    }
  }, [space?.rental_price]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nombre_invites' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation du nombre d'invités
      if (formData.nombre_invites > (space?.capacity || 0)) {
        throw new Error(`Cette salle ne peut accueillir que ${space?.capacity} personnes`);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reservations/event-rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          prix_total: totalPrice
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // CORRECTION: Vérifier d'abord 'error', puis 'message', puis un message par défaut
        throw new Error(errorData.error || errorData.message || 'Une erreur est survenue lors de la réservation.');
      }

      const reservationData = await response.json();
      setReservationId(reservationData.id);
      setShowPaymentModal(true);

    } catch (err) {
      // S'assurer que 'err' est bien une instance de Error avant d'accéder à 'message'
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/confirmation-evenement', {
      state: {
        reservation: formData,
        space,
        reservationId,
        prixTotal: totalPrice,
        statut: 'confirmée'
      }
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  // Classes TailwindCSS pour la bordure bleue et le style professionnel
  const commonInputClasses = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-blue-400 text-gray-800 placeholder-gray-400";
  const datePickerClasses = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-blue-400 appearance-none date-input-style text-gray-800"; // Added appearance-none for potential custom styling hooks

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Réservation - {space?.name || 'Salle #' + roomId}
            </h1>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={commonInputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={commonInputClasses}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={commonInputClasses}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="type_evenement" className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'événement
                  </label>
                  <select
                    id="type_evenement"
                    name="type_evenement"
                    value={formData.type_evenement}
                    onChange={handleChange}
                    className={commonInputClasses}
                    required
                  >
                    {eventTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="date_evenement" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de l'événement
                  </label>
                  <input
                    type="date"
                    id="date_evenement"
                    name="date_evenement"
                    value={formData.date_evenement}
                    onChange={handleChange}
                    className={datePickerClasses}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="heure_debut" className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    id="heure_debut"
                    name="heure_debut"
                    value={formData.heure_debut}
                    onChange={handleChange}
                    className={datePickerClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="heure_fin" className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    id="heure_fin"
                    name="heure_fin"
                    value={formData.heure_fin}
                    onChange={handleChange}
                    className={datePickerClasses}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="nombre_invites" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'invités
                </label>
                <input
                  type="number"
                  id="nombre_invites"
                  name="nombre_invites"
                  value={formData.nombre_invites}
                  onChange={handleChange}
                  min="1"
                  max={space?.capacity || 500}
                  className={commonInputClasses}
                  required
                />
                {space && (
                  <p className="text-sm text-gray-500 mt-1">
                    Capacité maximale: {space.capacity} personnes
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="methode_paiement" className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <select
                  id="methode_paiement"
                  name="methode_paiement"
                  value={formData.methode_paiement}
                  onChange={handleChange}
                  className={commonInputClasses}
                  required
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes supplémentaires
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className={commonInputClasses}
                  placeholder="Décoration, équipements spéciaux, etc."
                />
              </div>

              {space && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">Détails du paiement</h3>
                  <div className="flex justify-between">
                    <span>Prix forfaitaire:</span>
                    <span className="font-semibold">{space.rental_price.toLocaleString()} XAF</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 mt-2 pt-2">
                    <span className="font-bold">Total à payer:</span>
                    <span className="font-bold text-blue-600">
                      {totalPrice.toLocaleString()} XAF
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isSubmitting || !formData.date_evenement || !formData.heure_debut || !formData.heure_fin}
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />

      {showPaymentModal && (
        <EventPaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentCancel}
          onPaymentSuccess={handlePaymentSuccess}
          amount={totalPrice}
        />
      )}
    </>
  );
};

export default EventReservationPage;  