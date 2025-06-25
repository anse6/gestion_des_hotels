
export interface Booking {
  id: string;
  guest: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

export const recentBookings: Booking[] = [
  {
    id: "#BK-2023-001",
    guest: "Jean Dupont",
    room: "Appartement Royal",
    checkIn: "15/06/2023",
    checkOut: "20/06/2023",
    status: "Checked In",
  },
  {
    id: "#BK-2023-002",
    guest: "Marie Lambert",
    room: "Chambre Deluxe",
    checkIn: "16/06/2023",
    checkOut: "18/06/2023",
    status: "Reserved",
  },
  {
    id: "#BK-2023-003",
    guest: "Entreprise XYZ",
    room: "Salle de conférence",
    checkIn: "14/06/2023",
    checkOut: "14/06/2023",
    status: "Checked Out",
  },
  {
    id: "#BK-2023-004",
    guest: "Paul Martin",
    room: "Suite Présidentielle",
    checkIn: "20/06/2023",
    checkOut: "25/06/2023",
    status: "Reserved",
  },
];