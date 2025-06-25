// src/composant/dashboard/MainContent.tsx
import React from 'react';
import DashboardHeader from './composantdashboard/DashboardHeader';
import RecentBookings from './composantdashboard/RecentBookings';
import RecentMessages from './composantdashboard/RecentMessages';
import StatsWidgets from './composantdashboard/StatsWidgets';
import RevenueProgressChart from './composantdashboard/RevenueProgressChart';
import OccupationPieChart from './composantdashboard/OccupationPieChart';
import AdminContent from './AdminContent';
import HotelContent from './HotelContent';

interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  return (
    <div className="p-6">
      {activeTab === 'dashboard' ? (
        <>
          <DashboardHeader />
          <StatsWidgets />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueProgressChart />
            <OccupationPieChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 translate-y-5">
            <RecentBookings />
            <RecentMessages />
          </div>
        </>
      ) : activeTab === 'admin' ? (
        <AdminContent />
      ) : activeTab === 'hotel' ? (
        <HotelContent />
      ) : null}
    </div>
  );
};

export default MainContent;