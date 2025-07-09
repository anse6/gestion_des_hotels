import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Interface pour l'API /daily-revenue ---
interface DailyRevenueData {
  appartements: number;
  chambres: number;
  day: string;
  salles: number;
  total: number;
}

interface DailyRevenueAPIResponse {
  currency: string;
  daily_data: DailyRevenueData[];
  monthly_totals: {
    appartements: number;
    chambres: number;
    salles: number;
    total: number;
  };
  period: {
    days_in_month: number;
    month: number;
    month_name: string;
    year: number;
  };
  status: string;
}

const DailyRevenueChart: React.FC = () => {
  const [chartData, setChartData] = useState<DailyRevenueAPIResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Couleurs pour les différentes catégories
  const BAR_COLORS = {
    chambres: "#4e73df", // Blue
    salles: "#1cc88a", // Green
    appartements: "#36b9cc", // Cyan
  };

  useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        const token = localStorage.getItem("token"); // Récupérer le token

        const response = await fetch(
          "http://localhost:5000/api/reservations/daily-revenue",
          {
            method: "GET",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data: DailyRevenueAPIResponse = await response.json();
        setChartData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDailyRevenue();
  }, []); // Le tableau de dépendances vide signifie que cela s'exécute une seule fois au montage

  if (loading) {
    return (
      <div
        className="bg-white p-4 rounded-xl shadow-md w-full flex items-center justify-center"
        style={{ height: "500px" }}
      >
        <p className="text-gray-600">Chargement des données journalières...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-white p-4 rounded-xl shadow-md w-full flex items-center justify-center"
        style={{ height: "500px" }}
      >
        <p className="text-red-500">Erreur lors du chargement: {error}</p>
      </div>
    );
  }

  // Vérifier si chartData et daily_data existent et ne sont pas vides
  if (!chartData || !chartData.daily_data || chartData.daily_data.length === 0) {
    return (
      <div
        className="bg-white p-4 rounded-xl shadow-md w-full flex items-center justify-center"
        style={{ height: "500px" }}
      >
        <p className="text-gray-600">Aucune donnée de revenu journalier disponible.</p>
      </div>
    );
  }

  const { daily_data, period, currency } = chartData;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: "white",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        height: "500px",
      }}
    >
      <h2
        style={{
          color: "#2e3a59",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        Revenus Journaliers de {period.month_name} {period.year}
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={daily_data} // Utiliser les données de l'API
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            angle={-45}
            textAnchor="end"
            height={60}
            label={{
              value: "Jours du mois",
              position: "insideBottom",
              offset: -50,
            }}
          />
          <YAxis
            label={{
              value: `Revenus (${currency})`, // Utiliser la devise de l'API
              angle: -90,
              position: "insideLeft",
            }}
            // Optionnel: formateur pour l'axe Y si vous voulez des milliers séparés
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            formatter={(value) => [`${value.toLocaleString()} ${currency}`, "Revenu"]} // Formater le tooltip avec la devise
            labelFormatter={(day) => `Jour ${day}`}
          />
          <Legend />
          <Bar
            dataKey="chambres"
            fill={BAR_COLORS.chambres}
            name="Chambres"
          />
          <Bar
            dataKey="salles"
            fill={BAR_COLORS.salles}
            name="Salles de fête"
          />
          <Bar
            dataKey="appartements"
            fill={BAR_COLORS.appartements}
            name="Appartements"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyRevenueChart;