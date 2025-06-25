// ========== COMPOSANT OCCUPATION PIE CHART ==========
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface OccupationStats {
  rooms: number;
  event_rooms: number;
  apartments: number;
}

const OccupationPieChart: React.FC = () => {
  const [stats, setStats] = useState<OccupationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token non trouvé');
        }

        const response = await axios.get('http://localhost:5000/api/hotel/occupation-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setStats(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center h-64 md:h-80">
        <div className="animate-pulse text-gray-500">Chargement des données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center h-64 md:h-80">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex justify-center items-center h-64 md:h-80">
        <div className="text-gray-500">Aucune donnée disponible</div>
      </div>
    );
  }

  const total = stats.rooms + stats.event_rooms + stats.apartments;
  const percentages = {
    rooms: Math.round((stats.rooms / total) * 100),
    event_rooms: Math.round((stats.event_rooms / total) * 100),
    apartments: Math.round((stats.apartments / total) * 100),
  };

  const data = {
    labels: ['Chambres', 'Salles de fête', 'Appartements'],
    datasets: [
      {
        data: [stats.rooms, stats.event_rooms, stats.apartments],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(249, 168, 37, 0.7)',
          'rgba(16, 185, 129, 0.7)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(249, 168, 37, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Répartition des unités par type',
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((Number(value) / total) * 100);
            return `${label}: ${percentage}% (${value} unités)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="h-64 md:h-80">
        <Pie data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        {data.labels.map((label, index) => (
          <div key={index}>
            <div className="flex items-center justify-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
              ></span>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-lg font-bold">
              {data.datasets[0].data[index]} unités
            </p>
            <p className="text-sm text-gray-500">
              ({percentages[['rooms', 'event_rooms', 'apartments'][index] as keyof typeof percentages]}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccupationPieChart;