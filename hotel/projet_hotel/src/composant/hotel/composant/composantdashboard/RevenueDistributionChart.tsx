import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const RevenueDistributionChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token"); // 🔐 Assure-toi que ton token est stocké ici

        const response = await fetch("http://localhost:5000/api/reservations/revenue-distribution", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }

        const data = await response.json();
        setChartData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Répartition des revenus",
      },
    },
  };

  if (loading) {
    return <div className="p-6">Chargement des données…</div>;
  }

  if (error || !chartData) {
    return <div className="p-6 text-red-600">Erreur : {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default RevenueDistributionChart;
