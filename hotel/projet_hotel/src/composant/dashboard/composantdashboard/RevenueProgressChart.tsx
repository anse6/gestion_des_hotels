// ========== COMPOSANT REVENUE PROGRESS CHART ==========
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RevenueProgressChart: React.FC = () => {
  const hotels = ['Hôtel Paris', 'Hôtel Lyon', 'Hôtel Marseille', 'Hôtel Bordeaux'];
  const revenues = [12500, 9800, 7500, 6200];
  const targets = [15000, 12000, 9000, 8000];
  const percentages = revenues.map((rev, i) => Math.round((rev / targets[i]) * 100));

  const data = {
    labels: hotels,
    datasets: [
      {
        label: 'Revenu actuel (€)',
        data: revenues,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
      },
      {
        label: 'Objectif (€)',
        data: targets,
        backgroundColor: 'rgba(209, 213, 219, 0.7)',
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Progression des revenus par hôtel',
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: TooltipItem<'bar'>) => {
            const index = context.dataIndex;
            return `Progression: ${percentages[index]}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Montant (€)'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <Bar data={data} options={options} />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {hotels.map((hotel, index) => (
          <div key={index} className="text-center">
            <h4 className="text-sm font-medium text-gray-600">{hotel}</h4>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div 
                className={`h-2.5 rounded-full ${
                  percentages[index] >= 80 ? 'bg-green-500' : 
                  percentages[index] >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`} 
                style={{ width: `${percentages[index]}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1">
              {percentages[index]}% ({revenues[index]}€ / {targets[index]}€)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueProgressChart;
