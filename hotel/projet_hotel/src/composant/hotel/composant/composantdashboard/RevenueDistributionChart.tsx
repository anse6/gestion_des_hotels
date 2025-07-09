import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PieDataEntry {
  name: string;
  value: number;
  color?: string;
}

interface MonthlyDataItem {
  day: string;
  appartements: number;
  chambres: number;
  salles: number;
}

interface RevenueChartData {
  monthly_data: MonthlyDataItem[];
  period: {
    end_date: string;
    month: number;
    month_name: string;
    start_date: string;
    total_days: number;
    year: number;
  };
  pie_data: PieDataEntry[];
  totals: {
    appartements: number;
    chambres: number;
    salles: number;
    total: number;
  };
}

const RevenuePieChart: React.FC = () => {
  const [chartData, setChartData] = useState<RevenueChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/reservations/revenue-chart",
          {
            method: "GET",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data: RevenueChartData = await response.json();
        setChartData(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto flex items-center justify-center h-[400px]">
        <p className="text-gray-600">Chargement des données du graphique...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto flex items-center justify-center h-[400px]">
        <p className="text-red-500">Erreur lors du chargement: {error}</p>
      </div>
    );
  }

  if (!chartData || chartData.pie_data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto flex items-center justify-center h-[400px]">
        <p className="text-gray-600">Aucune donnée de revenu disponible pour le graphique.</p>
      </div>
    );
  }

  const pieData = chartData.pie_data;
  const totalRevenue = chartData.totals.total;
  const monthName = chartData.period.month_name;
  const year = chartData.period.year;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-2xl mx-auto">
      <h3 className="text-gray-700 text-lg font-semibold mb-4 text-center">
        Répartition des Revenus de {monthName} {year} (Total: {totalRevenue.toLocaleString()} FCFA)
      </h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value, percent }) =>
                `${name}: ${value.toLocaleString()} FCFA (${(percent * 100).toFixed(0)}%)`
              }
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} FCFA`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenuePieChart;
