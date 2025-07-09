import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../composant/Header';
import Footer from '../composant/Footer';

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservation, room, reservationId, totalPrice } = location.state || {};

  // Si pas de données de réservation, rediriger
  if (!reservation || !room) {
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
              Retour aux chambres
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const calculateNights = () => {
    const start = new Date(reservation.date_arrivee);
    const end = new Date(reservation.date_depart);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateInvoicePDF = () => {
    // Créer le contenu de la facture en HTML
    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture de Réservation #${reservationId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .info-section { margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURE DE RÉSERVATION</h1>
          <p>Réservation #${reservationId}</p>
          <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="info-section">
          <h3>Informations Client</h3>
          <div class="info-row"><span>Nom:</span> <span>${reservation.nom} ${reservation.prenom}</span></div>
          <div class="info-row"><span>Email:</span> <span>${reservation.email}</span></div>
        </div>
        
        <div class="info-section">
          <h3>Détails de la Réservation</h3>
          <div class="info-row"><span>Chambre:</span> <span>${room.type}</span></div>
          <div class="info-row"><span>Date d'arrivée:</span> <span>${formatDate(reservation.date_arrivee)}</span></div>
          <div class="info-row"><span>Date de départ:</span> <span>${formatDate(reservation.date_depart)}</span></div>
          <div class="info-row"><span>Nombre de nuits:</span> <span>${calculateNights()}</span></div>
          <div class="info-row"><span>Nombre de personnes:</span> <span>${reservation.nombre_personnes}</span></div>
          ${reservation.notes ? `<div class="info-row"><span>Notes:</span> <span>${reservation.notes}</span></div>` : ''}
        </div>
        
        <div class="info-section">
          <h3>Détail du Paiement</h3>
          <div class="info-row"><span>Prix par nuit:</span> <span>${room.price_per_night.toLocaleString()} XAF</span></div>
          <div class="info-row"><span>Nombre de nuits:</span> <span>${calculateNights()}</span></div>
          <div class="info-row total"><span>TOTAL:</span> <span>${totalPrice.toLocaleString()} XAF</span></div>
        </div>
        
        <div class="footer">
          <p>Merci pour votre réservation !</p>
          <p>En cas de questions, veuillez nous contacter.</p>
        </div>
      </body>
      </html>
    `;

    // Créer un blob avec le contenu HTML
    const blob = new Blob([invoiceContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `Facture_Reservation_${reservationId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL
    URL.revokeObjectURL(url);
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
                Votre réservation a été traitée avec succès
              </p>
            </div>

            {/* Détails de la réservation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">
                Détails de votre réservation
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
                <h3 className="font-semibold text-gray-700 mb-3">Détails du séjour</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chambre:</span>
                    <span className="font-medium">{room.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro:</span>
                    <span className="font-medium">{room.room_number || 'Non spécifié'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrivée:</span>
                    <span className="font-medium">{formatDate(reservation.date_arrivee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Départ:</span>
                    <span className="font-medium">{formatDate(reservation.date_depart)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-medium">{calculateNights()} nuit(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Personnes:</span>
                    <span className="font-medium">{reservation.nombre_personnes}</span>
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
                  <span>Prix par nuit:</span>
                  <span>{room.price_per_night.toLocaleString()} XAF</span>
                </div>
                <div className="flex justify-between">
                  <span>Nombre de nuits:</span>
                  <span>{calculateNights()}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2 font-bold text-lg">
                  <span>Total payé:</span>
                  <span className="text-green-600">{totalPrice.toLocaleString()} XAF</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    Paiement confirmé via Mobile Money
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
                <li>Veuillez vous présenter à la réception avec une pièce d'identité valide</li>
                {/* <li>L'enregistrement se fait à partir de 14h00</li> */}
                <li>La libération de la chambre doit se faire avant 11h00</li>
                <li>Conservez cette confirmation pour votre arrivée</li>
                <li>En cas de modification, contactez-nous au moins 24h à l'avance</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={generateInvoicePDF}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger la facture
              </button>
              
              <button
                onClick={() => navigate('/users')}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Nouvelle réservation
              </button>
            </div>

            {/* Message de remerciement */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Merci pour votre confiance !
              </h3>
              <p className="text-gray-600">
                Nous nous réjouissons de vous accueillir et de vous offrir un séjour mémorable.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ConfirmationPage;