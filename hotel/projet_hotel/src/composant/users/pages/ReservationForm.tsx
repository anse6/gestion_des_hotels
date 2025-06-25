import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../composant/Header';
import Footer from '../composant/Footer';
import PaymentModal from './PaymentModal';

type ReservationData = {
  room_id: number;
  nom: string;
  prenom: string;
  email: string;
  date_arrivee: string;
  date_depart: string;
  nombre_personnes: number;
  methode_paiement: string;
  notes: string;
};

type RoomType = {
  id: number;
  type: string;
  description: string;
  price_per_night: number;
  capacity: number;
  room_number?: string;
};


const ReservationPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(location.state?.room);
  const [formData, setFormData] = useState<ReservationData>({
    room_id: parseInt(roomId || '0'),
    nom: '',
    prenom: '',
    email: '',
    date_arrivee: '',
    date_depart: '',
    nombre_personnes: 1,
    methode_paiement: 'orange',
    notes: ''
  });
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationId, setReservationId] = useState<number | null>(null);

  useEffect(() => {
    if (!room && roomId) {
      const fetchRoomDetails = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) throw new Error('Erreur lors de la récupération des détails de la chambre');
          const data = await response.json();
          setRoom(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchRoomDetails();
    }
  }, [room, roomId]);

  useEffect(() => {
    if (formData.date_arrivee && formData.date_depart && room?.price_per_night) {
      try {
        const start = new Date(formData.date_arrivee);
        const end = new Date(formData.date_depart);
        
        if (isNaN(start.getTime())) { throw new Error("Date d'arrivée invalide"); }
        if (isNaN(end.getTime())) { throw new Error("Date de départ invalide"); }
        if (end <= start) { throw new Error("La date de départ doit être après l'arrivée"); }

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTotalPrice(diffDays * room.price_per_night);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de calcul des dates');
        setTotalPrice(0);
      }
    }
  }, [formData.date_arrivee, formData.date_depart, room?.price_per_night]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'nombre_personnes' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation supplémentaire
      if (formData.nombre_personnes > (room?.capacity || 0)) {
        throw new Error(`Cette chambre ne peut accueillir que ${room?.capacity} personnes`);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reservations/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          total_price: totalPrice
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la réservation');
      }

      const reservationData = await response.json();
      setReservationId(reservationData.id);
      
      // Ouvrir le modal de paiement au lieu de rediriger directement
      setShowPaymentModal(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Rediriger vers la page de confirmation après le paiement
    navigate('/confirmation', { 
      state: { 
        reservation: formData, 
        room,
        reservationId,
        totalPrice
      } 
    });
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Réservation - {room?.type || 'Chambre #' + roomId}
            </h1>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="nom" className="block text-gray-700 font-medium mb-2">Nom</label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="prenom" className="block text-gray-700 font-medium mb-2">Prénom</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="date_arrivee" className="block text-gray-700 font-medium mb-2">Date d'arrivée</label>
                <input
                  type="date"
                  id="date_arrivee"
                  name="date_arrivee"
                  value={formData.date_arrivee}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label htmlFor="date_depart" className="block text-gray-700 font-medium mb-2">Date de départ</label>
                <input
                  type="date"
                  id="date_depart"
                  name="date_depart"
                  value={formData.date_depart}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                  min={formData.date_arrivee || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label htmlFor="nombre_personnes" className="block text-gray-700 font-medium mb-2">Nombre de personnes</label>
                <input
                  type="number"
                  id="nombre_personnes"
                  name="nombre_personnes"
                  value={formData.nombre_personnes}
                  min={1}
                  max={room?.capacity || 10}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">Notes (optionnel)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              {(formData.date_arrivee && formData.date_depart && room?.price_per_night) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">Détails du paiement</h3>
                  <div className="flex justify-between">
                    <span>Prix par nuit:</span>
                    <span className="font-semibold">
                      {room.price_per_night.toLocaleString()} XAF
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre de nuits:</span>
                    <span className="font-semibold">
                      {Math.ceil(
                        (new Date(formData.date_depart).getTime() - 
                        new Date(formData.date_arrivee).getTime()) / 
                        (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 mt-2 pt-2">
                    <span className="font-bold">Total:</span>
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
                  disabled={isSubmitting || !formData.date_arrivee || !formData.date_depart || totalPrice <= 0}
                >
                  {isSubmitting ? 'Traitement...' : 'Réserver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Modal de paiement */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentCancel}
          onPaymentSuccess={handlePaymentSuccess}
          amount={totalPrice}
        />
      )}
    </>
  );
};

export default ReservationPage;