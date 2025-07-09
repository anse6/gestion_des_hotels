import React from "react";
import { Line } from "react-chartjs-2";

const RevenueChart: React.FC = () => {
  const data = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
    datasets: [
      {
        label: "Revenus (F)",
        data: [12000, 19000, 15000, 18000, 22000, 25000, 28000, 26000, 24000, 21000, 23000, 30000],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.3,
        fill: true,
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
        text: "Revenus mensuels",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Montant (F)",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <Line data={data} options={options} />
    </div>
  );
};

export default RevenueChart;