import React from 'react';

interface StatWidgetProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  trend?: string | null;
  trendColor?: string;
  additionalInfo?: string | null;
  onClick?: () => void;
}

const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  icon,
  bgColor,
  trend,
  trendColor,
  additionalInfo,
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg ${onClick ? 'cursor-pointer hover:border-2 hover:border-blue-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        {trend && (
          <p className={`${trendColor} text-sm font-medium`}>{trend}</p>
        )}
        {additionalInfo && (
          <p className="text-gray-600 text-sm font-medium">{additionalInfo}</p>
        )}
      </div>
    </div>
  );
};

export default StatWidget;