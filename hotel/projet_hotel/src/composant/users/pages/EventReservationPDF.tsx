
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#333',
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  total: {
    fontWeight: 'bold',
    fontSize: 14,
    borderTop: 2,
    borderTopColor: '#333',
    paddingTop: 10,
    marginTop: 10,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    color: '#666',
  },
});

const EventReservationPDF = ({ 
  reservation, 
  space, 
  reservationId, 
  prixTotal,
  statut,
  duration
}: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>CONTRAT DE RÉSERVATION DE SALLE</Text>
        <Text>Réservation #{reservationId}</Text>
        <Text>Date: {new Date().toLocaleDateString('fr-FR')}</Text>
        <Text>Statut: {statut}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations Client</Text>
        <View style={styles.row}>
          <Text>Nom:</Text>
          <Text>{reservation.nom} {reservation.prenom}</Text>
        </View>
        <View style={styles.row}>
          <Text>Email:</Text>
          <Text>{reservation.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails de l'Événement</Text>
        <View style={styles.row}>
          <Text>Salle:</Text>
          <Text>{space.name}</Text>
        </View>
        <View style={styles.row}>
          <Text>Type:</Text>
          <Text style={{ textTransform: 'capitalize' }}>{reservation.type_evenement}</Text>
        </View>
        <View style={styles.row}>
          <Text>Date:</Text>
          <Text>{new Date(reservation.date_evenement).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={styles.row}>
          <Text>Horaire:</Text>
          <Text>{reservation.heure_debut} - {reservation.heure_fin} ({duration})</Text>
        </View>
        <View style={styles.row}>
          <Text>Nombre d'invités:</Text>
          <Text>{reservation.nombre_invites}</Text>
        </View>
        {reservation.notes && (
          <View style={styles.row}>
            <Text>Notes:</Text>
            <Text>{reservation.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails du Paiement</Text>
        <View style={styles.row}>
          <Text>Prix forfaitaire:</Text>
          <Text>{space.rental_price.toLocaleString('fr-FR')} XAF</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text>TOTAL:</Text>
          <Text>{prixTotal.toLocaleString('fr-FR')} XAF</Text>
        </View>
        <View style={styles.row}>
          <Text>Méthode de paiement:</Text>
          <Text>{reservation.methode_paiement}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Conditions générales :</Text>
        <Text>- Annulation possible jusqu'à 7 jours avant l'événement</Text>
        <Text>- Caution de 50 000 XAF à payer sur place</Text>
        <Text>- Respect des horaires et des lieux</Text>
      </View>
    </Page>
  </Document>
);

export default EventReservationPDF;