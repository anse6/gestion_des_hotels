import React, { useState, useEffect } from "react";

const QuickStats: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        // Retrieve the token from localStorage or another source
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/reservations/quick-stats", {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
        setLoading(false);
      }
    };

    fetchQuickStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Statistiques rapides</h3>
        <div className="text-center py-4">Chargement en cours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Statistiques rapides</h3>
        <div className="text-center py-4 text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">Statistiques rapides</h3>
        <div className="text-center py-4">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
      <h3 className="font-semibold text-lg text-gray-800 mb-4">Statistiques rapides</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-500 text-sm">Appartements occupés</p>
          <p className="text-xl font-bold">
            {stats.apartments.occupied}/{stats.apartments.total}
          </p>
          <p className="text-sm text-gray-500">{stats.apartments.percentage}% d'occupation</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-500 text-sm">Chambres occupées</p>
          <p className="text-xl font-bold">
            {stats.rooms.occupied}/{stats.rooms.total}
          </p>
          <p className="text-sm text-gray-500">{stats.rooms.percentage}% d'occupation</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-500 text-sm">Salles réservées</p>
          <p className="text-xl font-bold">
            {stats.event_rooms.reserved}/{stats.event_rooms.total}
          </p>
          <p className="text-sm text-gray-500">{stats.event_rooms.percentage}% d'occupation</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-500 text-sm">Revenu aujourd'hui</p>
          <p className="text-xl font-bold">{stats.revenue.amount} fcfa</p>
          <p className="text-sm text-gray-500">
            {stats.revenue.evolution > 0 ? "+" : ""}
            {stats.revenue.evolution}% hier
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-500 text-sm">Départs aujourd'hui</p>
          <p className="text-xl font-bold">{stats.departures.departures}</p>
          <p className="text-sm text-gray-500">Arrivées: {stats.departures.arrivals}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-indigo-500 text-sm">Taux de remplissage</p>
          <p className="text-xl font-bold">{stats.occupancy_rate.rate}%</p>
          <p className="text-sm text-gray-500">{stats.occupancy_rate.description}</p>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;