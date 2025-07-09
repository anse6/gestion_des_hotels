// ========== COMPOSANT REVENUE PROGRESS CHART ==========
import React, { useEffect, useState } from 'react';
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

interface HotelRevenueData {
  city: string;
  country: string;
  current_revenue: number;
  hotel_id: number;
  hotel_name: string;
  percentage: number;
  target_revenue: number;
}

const RevenueProgressChart: React.FC = () => {
  const [hotelsData, setHotelsData] = useState<HotelRevenueData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        const response = await fetch('http://localhost:5000/api/hotel/revenue-stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setHotelsData(result.data);
        } else {
          setError('Failed to fetch revenue data: ' + (result.message || 'Unknown error'));
        }
      } catch (e: any) {
        console.error("Error fetching revenue stats:", e);
        setError('Error fetching revenue data: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueStats();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-xl shadow-md p-6 text-center">Chargement des données de revenu...</div>;
  }

  if (error) {
    return <div className="bg-white rounded-xl shadow-md p-6 text-center text-red-500">Erreur: {error}</div>;
  }

  const hotelNames = hotelsData.map(hotel => hotel.hotel_name);
  const currentRevenues = hotelsData.map(hotel => hotel.current_revenue);
  const targetRevenues = hotelsData.map(hotel => hotel.target_revenue);
  const percentages = hotelsData.map(hotel => hotel.percentage);

  const data = {
    labels: hotelNames,
    datasets: [
      {
        label: 'Revenu actuel (fcfa)',
        data: currentRevenues,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
      },
      {
        label: 'Objectif (fcfa)',
        data: targetRevenues,
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
          text: 'Montant (fcfa)'
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <Bar data={data} options={options} />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {hotelsData.map((hotel) => (
          <div key={hotel.hotel_id} className="text-center">
            <h4 className="text-sm font-medium text-gray-600">{hotel.hotel_name}</h4>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className={`h-2.5 rounded-full ${
                  hotel.percentage >= 80 ? 'bg-green-500' :
                  hotel.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hotel.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1">
              {hotel.percentage}% ({hotel.current_revenue} fcfa / {hotel.target_revenue} fcfa)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueProgressChart;