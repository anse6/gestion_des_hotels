import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../composant/Header';
import Footer from '../composant/Footer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EventReservationPDF from './EventReservationPDF';

const EventConfirmationPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reservation = state?.reservation;
  const space = state?.space;
  const reservationId = state?.reservationId;
  const prixTotal = state?.prixTotal;
  const statut = state?.statut;

  if (!reservation || !space) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Aucune réservation trouvée
            </h1>
            <button
              onClick={() => navigate('/users')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retour aux salles
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const calculateDuration = () => {
    if (!reservation.heure_debut || !reservation.heure_fin) return 'Non spécifié';
    
    try {
      const [startHour, startMinute] = reservation.heure_debut.split(':').map(Number);
      const [endHour, endMinute] = reservation.heure_fin.split(':').map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        hours--;
        minutes += 60;
      }
      
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    } catch {
      return 'Non spécifié';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* En-tête de confirmation */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Réservation Confirmée !
              </h1>
              <p className="text-gray-600">
                Votre réservation de salle a été traitée avec succès
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Numéro de réservation: #{reservationId}
              </p>
              <p className={`text-sm font-medium mt-2 ${
                statut === 'confirmée' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                Statut: {statut}
              </p>
            </div>

            {/* Détails de la réservation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">
                Détails de votre événement
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations personnelles</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom complet:</span>
                      <span className="font-medium">{reservation.nom} {reservation.prenom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{reservation.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Réservation #:</span>
                      <span className="font-medium text-blue-600">#{reservationId}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Détails de l'événement</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salle:</span>
                      <span className="font-medium">{space.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{reservation.type_evenement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(reservation.date_evenement)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horaire:</span>
                      <span className="font-medium">{reservation.heure_debut} - {reservation.heure_fin} ({calculateDuration()})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invités:</span>
                      <span className="font-medium">{reservation.nombre_invites} personnes</span>
                    </div>
                  </div>
                </div>
              </div>

              {reservation.notes && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h3 className="font-semibold text-gray-700 mb-2">Notes spéciales</h3>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                    {reservation.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Résumé financier */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-green-800 mb-4">
                Résumé du paiement
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Prix forfaitaire:</span>
                  <span>{space.rental_price.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2 font-bold text-lg">
                  <span>Total payé:</span>
                  <span className="text-green-600">{prixTotal.toLocaleString()} XAF</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    Paiement confirmé via {reservation.methode_paiement}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions importantes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informations importantes
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>Présentez cette confirmation à votre arrivée</li>
                <li>Accès à la salle 1 heure avant l'événement</li>
                <li>Nettoyage obligatoire avant départ</li>
                <li>Départ avant minuit (sauf accord préalable)</li>
                <li>Contactez-nous pour toute modification</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PDFDownloadLink 
                document={<EventReservationPDF 
                  reservation={reservation} 
                  space={space} 
                  reservationId={reservationId} 
                  prixTotal={prixTotal}
                  statut={statut}
                  duration={calculateDuration()}
                />}
                fileName={`reservation_salle_${reservationId}.pdf`}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger le contrat
              </PDFDownloadLink>
              
              <button
                onClick={() => navigate('/event-rooms')}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Réserver une autre salle
              </button>
            </div>

            {/* Message de remerciement */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Merci pour votre confiance !
              </h3>
              <p className="text-gray-600">
                Nous nous réjouissons d'accueillir votre événement.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventConfirmationPage;