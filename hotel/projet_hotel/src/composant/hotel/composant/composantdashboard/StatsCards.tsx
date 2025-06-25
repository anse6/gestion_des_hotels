import React from "react";

export interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface StatsCardsProps {
  stats: StatCard[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <span className="text-sm font-medium text-green-500 mt-1 inline-block">
                {stat.change}
              </span>
            </div>
            <div className={`${stat.color} p-3 rounded-full`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
