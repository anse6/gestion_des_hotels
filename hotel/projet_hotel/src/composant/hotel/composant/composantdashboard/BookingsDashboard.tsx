import React, { useEffect, useState } from "react";
import RecentBookingsTable, { type Booking } from "./RecentBookingsTable";

const BookingsDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/reservations/rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des réservations");
        }

        const data = await response.json();

        type ApiBooking = {
          id: number;
          prenom: string;
          nom: string;
          room_id: number;
          dates: string; // ex: "2025-06-06 au 2025-06-07"
          statut: string;
        };

        // Transformer + trier + garder les 6 plus récentes
        const bookingsAdapted: Booking[] = (data as ApiBooking[])
          .map((item) => {
            const [checkIn, checkOut] = item.dates.split(" au ");
            return {
              id: item.id,
              guest: `${item.prenom} ${item.nom}`,
              room: `Chambre ${item.room_id}`,
              checkIn,
              checkOut,
              status: item.statut,
            };
          })
          .sort((a, b) => {
            // Tri par date checkIn décroissante (plus récent premier)
            const dateA = new Date(a.checkIn);
            const dateB = new Date(b.checkIn);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 6); // garder les 6 premières

        setBookings(bookingsAdapted);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Une erreur est survenue");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p>Chargement des réservations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Réservations des chambres</h2>
      <RecentBookingsTable bookings={bookings} />
    </div>
  );
};

export default BookingsDashboard;
