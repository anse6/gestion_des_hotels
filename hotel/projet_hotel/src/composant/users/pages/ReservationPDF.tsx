import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2b6cb0'
  },
  invoiceInfo: {
    textAlign: 'right'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2b6cb0',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  label: {
    fontWeight: 'bold',
    width: '40%'
  },
  value: {
    width: '60%'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc'
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    fontSize: 10,
    textAlign: 'center'
  },
  logo: {
    width: 120
  },
  companyInfo: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center'
  }
});

interface Reservation {
  date_arrivee: string;
  date_depart: string;
  prenom: string;
  nom: string;
  email: string;
  nombre_personnes: number;
  methode_paiement: string;
  notes?: string;
}

interface Room {
  type: string;
  room_number?: string | number;
  description: string;
  price: number;
}

interface ReservationPDFProps {
  reservation: Reservation;
  room: Room;
  reservationId: string | number;
  totalPrice: number;
}

const ReservationPDF = ({ reservation, room, reservationId, totalPrice }: ReservationPDFProps) => {
  const dateArrivee = new Date(reservation.date_arrivee);
  const dateDepart = new Date(reservation.date_depart);
  const diffTime = Math.abs(dateDepart.getTime() - dateArrivee.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Image src="/logo.png" style={styles.logo} />
            <Text style={styles.companyInfo}>
              123 Avenue de l'Hôtel, Ville\nTél: +123 456 789\nEmail: contact@hotel.com
            </Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.title}>Facture de réservation</Text>
            <Text>Numéro: #{reservationId}</Text>
            <Text>Date: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom complet:</Text>
            <Text style={styles.value}>{reservation.prenom} {reservation.nom}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{reservation.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la réservation</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Chambre:</Text>
            <Text style={styles.value}>{room.type} {room.room_number && `(N°${room.room_number})`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{room.description}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Période:</Text>
            <Text style={styles.value}>
              Du {dateArrivee.toLocaleDateString()} au {dateDepart.toLocaleDateString()} ({diffDays} nuit(s))
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre de personnes:</Text>
            <Text style={styles.value}>{reservation.nombre_personnes}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de paiement</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Prix par nuit:</Text>
            <Text style={styles.value}>{room.price.toLocaleString()} XAF</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre de nuits:</Text>
            <Text style={styles.value}>{diffDays}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.label, { fontSize: 14 }]}>Total:</Text>
            <Text style={[styles.value, { fontSize: 14, fontWeight: 'bold' }]}>
              {totalPrice.toLocaleString()} XAF
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Méthode de paiement:</Text>
            <Text style={styles.value}>{reservation.methode_paiement}</Text>
          </View>
        </View>

        {reservation.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{reservation.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Merci pour votre confiance !</Text>
          <Text>Pour toute question, contactez-nous à contact@hotel.com</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReservationPDF;