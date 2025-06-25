import React, { useEffect, useState } from 'react';
import { Hotel, Grid, Users } from 'lucide-react';
import StatWidget from './StatWidget';

const StatsWidgets: React.FC = () => {
  const [totalHotels, setTotalHotels] = useState<number>(0);
  const [progression, setProgression] = useState<string>('0%');
  const [totalAdmins, setTotalAdmins] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchHotelData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/hotel/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTotalHotels(data.total_hotels);
        setProgression(data.progression);
      } catch (error) {
        console.error('Erreur lors de la récupération des données des hôtels:', error);
      }
    };

    const fetchAdminData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/admin/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTotalAdmins(data.total_admins);
      } catch (error) {
        console.error('Erreur lors de la récupération des données des administrateurs:', error);
      }
    };

    fetchHotelData();
    fetchAdminData();
  }, []);

  const widgets = [
    {
      title: "Nombre d'hôtels",
      value: totalHotels.toString(),
      icon: <Hotel size={24} className="text-blue-600" />,
      bgColor: "bg-blue-100",
      trend: progression,
      trendColor: "text-green-600",
      additionalInfo: null,
    },
    {
      title: "Nombre d'administrateurs",
      value: totalAdmins.toString(),
      icon: <Grid size={24} className="text-purple-600" />,
      bgColor: "bg-purple-100",
      trend: null,
      trendColor: "",
      additionalInfo: null,
    },

      {
      title: "Revenus",
      value: "14,350 €",
      icon: <span className="text-green-600 text-xl font-bold">€</span>,
      bgColor: "bg-green-100",
      trend: "+8% depuis le dernier mois",
      trendColor: "text-green-600",
      additionalInfo: null
    },
    {
      title: "Personnel actif",
      value: "24",
      icon: <Users size={24} className="text-orange-600" />,
      bgColor: "bg-orange-100",
      trend: null,
      trendColor: "",
      additionalInfo: "Total: 28 employés"
    }
    
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {widgets.map((widget, index) => (
        <StatWidget key={index} {...widget} />
      ))}
    </div>
  );
};

export default StatsWidgets;
