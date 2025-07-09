import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

//import { dashboardStats, recentBookings } from "./composantdashboard/mock";
import Dashboard1 from './composantdashboard/Dashboard1';
import RevenueDistributionChart from "./composantdashboard/RevenueDistributionChart";
import OccupancyChart from "./composantdashboard/OccupancyChart";
import QuickStats from "./composantdashboard/QuickStats";
import BookingsDashboard from './composantdashboard/BookingsDashboard';
//import RecentBookingsTable from "./RecentBookingsTable";
//import DashboardHeader from "./composantdashboard/DashboardHeader";
//import { recentBookings } from "./mockData";

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      {/* <DashboardHeader 
        title="Tableau de bord" 
        description="Bienvenue sur le tableau de bord de gestion de votre hôtel" 
      /> */}
      
      <Dashboard1 />
      
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 px-4">
      <RevenueDistributionChart />
      <OccupancyChart /> 
    </div>


      <div className="w-6x1 max-w-screen-2xl mx-auto">
      <QuickStats />
    </div>

      <BookingsDashboard  />
    </div>
  );
};

export default Dashboard;