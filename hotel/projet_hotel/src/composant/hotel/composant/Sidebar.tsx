import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "fa-tachometer-alt" },
    { id: "reservations", label: "Reservations", icon: "fa-calendar-alt" },
    { id: "list", label: "Liste des reservation", icon: "fa-building" },
    { id: "rooms", label: "Chambre", icon: "fa-bed" },
    { id: "partyHalls", label: "Salle de fete", icon: "fa-glass-cheers" },
    { id: "apartments", label: "Appartments", icon: "fa-building" },
    { id: "personnel", label: "Personnels", icon: "fa-user" },
    { id: "settings", label: "Parametre", icon: "fa-cog" },
  ];

  return (
    <aside className="bg-white shadow-sm fixed left-0 top-16 bottom-0 w-64 overflow-y-auto transition-all duration-300 ease-in-out z-20">
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-1">
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center w-full px-4 py-3 text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                } whitespace-nowrap cursor-pointer !rounded-button`}
              >
                <i className={`fas ${item.icon} w-5 text-center mr-3`}></i>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;