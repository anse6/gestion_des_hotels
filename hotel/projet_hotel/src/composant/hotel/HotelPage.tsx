import React, { useState } from "react";
import MainLayout from './composant/MainLayout';
import Dashboard from './composant/Dashboard';
import Reservations from "./composant/Reservations";
import Rooms from "./composant/Rooms";
import PartyHalls from "./composant/PartyHalls";
import Apartments from "./composant/Apartments";
import Settings from "./composant/Settings";
import ReservationsList from "./composant/Listereservation";


const HotelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "reservations":
        return <Reservations />;
      case "list":
        return <ReservationsList />;
      case "rooms":
        return <Rooms />;
      case "partyHalls":
        return <PartyHalls />;
      case "apartments":
        return <Apartments />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
};

export default HotelPage;