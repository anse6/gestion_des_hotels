
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

const ApartmentReservationPDF = ({ 
  reservation, 
  apartment, 
  reservationId, 
  prixTotal,
  statut,
  diffDays
}: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>FACTURE DE RÉSERVATION D'APPARTEMENT</Text>
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
        <Text style={styles.sectionTitle}>Détails de la Réservation</Text>
        <View style={styles.row}>
          <Text>Appartement:</Text>
          <Text>{apartment.type}</Text>
        </View>
        <View style={styles.row}>
          <Text>Nombre de pièces:</Text>
          <Text>{apartment.room_count || 'Non spécifié'}</Text>
        </View>
        <View style={styles.row}>
          <Text>Date d'arrivée:</Text>
          <Text>{new Date(reservation.date_arrivee).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={styles.row}>
          <Text>Date de départ:</Text>
          <Text>{new Date(reservation.date_depart).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={styles.row}>
          <Text>Nombre de nuits:</Text>
          <Text>{diffDays}</Text>
        </View>
        <View style={styles.row}>
          <Text>Nombre de personnes:</Text>
          <Text>{reservation.nombre_personnes}</Text>
        </View>
        {reservation.preferences && (
          <View style={styles.row}>
            <Text>Préférences:</Text>
            <Text>{reservation.preferences}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détail du Paiement</Text>
        <View style={styles.row}>
          <Text>Prix par nuit:</Text>
          <Text>{apartment.price_per_night.toLocaleString('fr-FR')} XAF</Text>
        </View>
        <View style={styles.row}>
          <Text>Nombre de nuits:</Text>
          <Text>{diffDays}</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text>TOTAL:</Text>
          <Text>{prixTotal.toLocaleString('fr-FR')} XAF</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Merci pour votre réservation !</Text>
        <Text>En cas de questions, veuillez nous contacter.</Text>
      </View>
    </Page>
  </Document>
);

export default ApartmentReservationPDF;