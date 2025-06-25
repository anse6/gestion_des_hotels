import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrer les éléments de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OccupancyChart: React.FC = () => {
  const [occupancyData, setOccupancyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOccupancyStats = async () => {
      try {
        const token = localStorage.getItem("token"); // récupération du JWT
        const response = await fetch("http://localhost:5000/api/reservations/occupancy-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const data = await response.json();

        // On garde l’ordre: Appartements, Chambres, Salles de fête
        setOccupancyData([data.apartments, data.rooms, data.event_rooms]);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccupancyStats();
  }, []);

  const chartData = {
    labels: ["Appartements", "Chambres", "Salles de fête"],
    datasets: [
      {
        label: "Taux d'occupation (%)",
        data: occupancyData,
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Taux d'occupation par catégorie",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {loading ? (
        <p className="text-gray-500 text-center">Chargement en cours...</p>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};

export default OccupancyChart;
