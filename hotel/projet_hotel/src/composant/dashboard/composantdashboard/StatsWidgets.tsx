import React, { useEffect, useState } from 'react';
import { Hotel, Grid, Users, BarChart2 } from 'lucide-react'; // Added BarChart2 for a new icon option
import StatWidget from './StatWidget';

const StatsWidgets: React.FC = () => {
  const [totalHotels, setTotalHotels] = useState<number>(0);
  const [progression, setProgression] = useState<string>('0%');
  const [totalAdmins, setTotalAdmins] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0); // New state for total users
  const [activeAdmins, setActiveAdmins] = useState<number>(0); // New state for active admins

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

    const fetchTotalUsers = async () => { // New function to fetch total users
      try {
        const response = await fetch('http://localhost:5000/api/auth/user/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTotalUsers(data.total_users);
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre total d\'utilisateurs:', error);
      }
    };

    const fetchActiveAdmins = async () => { // New function to fetch active admins
      try {
        const response = await fetch('http://localhost:5000/api/auth/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setActiveAdmins(data.active_admins);
      } catch (error) {
        console.error('Erreur lors de la récupération des administrateurs actifs:', error);
      }
    };

    fetchHotelData();
    fetchAdminData();
    fetchTotalUsers(); // Call the new fetch function
    fetchActiveAdmins(); // Call the new fetch function
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
      title: "Utilisateurs inscrits", // Updated title for clarity
      value: totalUsers.toString(), // Use the fetched totalUsers state
      icon: <Users size={24} className="text-green-600" />, // Changed icon for users
      bgColor: "bg-green-100",
      trend: "+8% depuis le dernier mois", // This is a static trend, consider making it dynamic
      trendColor: "text-green-600",
      additionalInfo: null,
    },
    {
      title: "Administrateurs actifs", // Updated title for clarity
      value: activeAdmins.toString(), // Use the fetched activeAdmins state
      icon: <BarChart2 size={24} className="text-orange-600" />, // New icon for active admins
      bgColor: "bg-orange-100",
      trend: null, // As per your original code, no trend for this
      trendColor: "",
      additionalInfo: `Total: ${totalAdmins} admin(s)`, // Display total admins as additional info
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