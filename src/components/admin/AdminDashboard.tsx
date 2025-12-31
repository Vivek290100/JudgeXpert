import React, { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

import {
  getDashboardStats,
  getRevenueStats,
} from "@/services/adminDashboardService";
// ───────────────────────────────────────────────────────────────

import { StatCardProps, DashboardStatsApiResponse } from "@/types/AdminTypes";

const StatCard = ({ title, value, label, color }: StatCardProps) => (
  <div className="bg-card p-3 sm:p-4 md:p-6 rounded-lg border border-border shadow-sm">
    <div className={`text-${color} text-sm sm:text-base font-medium mb-2`}>{title}</div>
    <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1">{value}</div>
    <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
  </div>
);

const RevenueBarChart = ({
  height,
  data,
  period,
}: {
  height: number;
  data: { period: string; revenue: number; date: string }[];
  period: "monthly" | "yearly";
}) => {
  const formatPeriodLabel = (periodValue: string, date: string) => {
    if (period === "yearly") return periodValue;
    if (period === "monthly") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[parseInt(periodValue) - 1] || periodValue;
      const year = new Date(date).getFullYear();
      return `${month} ${year}`;
    }
    return periodValue;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 30, left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="period"
          tickFormatter={(value, index) => formatPeriodLabel(value, data[index].date)}
          angle={0}
          fontSize={12}
        />
        <YAxis fontSize={12} />
        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
        <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
        <Bar dataKey="revenue" fill="#1e40af" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsApiResponse["data"]>({
    totalUsers: 0,
    subscribers: 0,
    totalProblems: 0,
    totalContests: 0,
  });

  const [revenueData, setRevenueData] = useState<{ period: string; revenue: number; date: string }[]>([]);
  const [period, setPeriod] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        toast.error("Failed to load dashboard stats");
        console.error("Dashboard stats error:", err);
      }
    };

    fetchStats();
  }, []);

  // Fetch revenue data when period changes
  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const data = await getRevenueStats(period);
        setRevenueData(
          data.map((stat) => ({
            period: stat.period,
            revenue: stat.revenue,
            date: stat.date,
          }))
        );
      } catch (err: any) {
        toast.error("Failed to load revenue data");
        console.error("Revenue stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [period]);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toString();
  };

  const totalRevenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + item.revenue, 0),
    [revenueData]
  );

  const topRevenue = useMemo(() => {
    const max = Math.max(...revenueData.map((d) => d.revenue));
    return revenueData.find((d) => d.revenue === max);
  }, [revenueData]);

  return (
    <div className="w-full bg-background text-foreground p-4 sm:p-6 mt-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={formatNumber(stats.totalUsers)} label="Total Users" color="sky-500" />
        <StatCard title="Subscribers" value={formatNumber(stats.subscribers)} label="Subscribers" color="orange-500" />
        <StatCard title="Total Problems" value={formatNumber(stats.totalProblems)} label="Total Problems" color="purple-500" />
        <StatCard title="Total Contests" value={formatNumber(stats.totalContests)} label="Total Contests" color="pink-500" />
      </div>

      {/* Period Toggle + (Commented Download) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              period === "monthly" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            } hover:bg-opacity-90 transition-colors`}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              period === "yearly" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            } hover:bg-opacity-90 transition-colors`}
            onClick={() => setPeriod("yearly")}
          >
            Yearly
          </button>
        </div>
        {/* Uncomment if you want to add download later */}
        {/* <button className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-sm font-medium rounded-lg hover:bg-opacity-90 transition-colors w-full sm:w-auto">
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </button> */}
      </div>

      {/* Revenue Chart + Insights */}
      <div className="w-full flex flex-col lg:flex-row gap-6 bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="w-full lg:w-8/12">
          <h3 className="text-foreground text-lg font-semibold mb-4">Revenue Chart</h3>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Loading revenue data...</p>
            </div>
          ) : (
            <div className="h-96">
              <RevenueBarChart height={360} data={revenueData} period={period} />
            </div>
          )}
        </div>

        <div className="w-full lg:w-4/12 flex flex-col gap-6">
          <h3 className="text-foreground text-lg font-semibold mb-2">Revenue Insights</h3>

          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            label="Across selected period"
            color="green-500"
          />

          {topRevenue && (
            <StatCard
              title="Top Earning Period"
              value={`₹${topRevenue.revenue.toLocaleString()}`}
              label={
                period === "monthly"
                  ? `${new Date(topRevenue.date).toLocaleString("default", { month: "long" })} ${new Date(topRevenue.date).getFullYear()}`
                  : `Year ${topRevenue.period}`
              }
              color="blue-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;