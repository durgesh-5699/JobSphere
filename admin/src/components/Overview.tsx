
import { useState, useEffect } from 'react';
import { Briefcase, Users, Activity, ArrowUpRight, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Overview() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/overview`, {
        withCredentials: true
      });
      setDashboardData(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching overview:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#3b6051]" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex justify-between items-center">
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="text-sm font-bold underline hover:text-red-800">
          Retry
        </button>
      </div>
    );
  }

  const recentUsers = dashboardData?.newUsersTrend?.reduce((sum: number, day: any) => sum + (day.users || 0), 0) || 0;

  const stats = [
    { 
      title: 'Total Jobs', 
      value: dashboardData?.totalJobs?.toString() || "0", 
      icon: Briefcase,
      trend: 'Open listings'
    },
    { 
      title: 'Total Applications', 
      value: dashboardData?.totalApplications?.toString() || "0", 
      icon: FileText, 
      trend: 'Active submissions'
    },
    { 
      title: 'Total Users', 
      value: dashboardData?.totalUsers?.toString() || "0", 
      icon: Users,
      trend: `+${recentUsers} this week`
    },
    { 
      title: 'Active Rooms', 
      value: dashboardData?.totalRooms?.toString() || "0", 
      icon: Activity,
      trend: 'Steady'
    },
  ];

  const recentActivity = [
    { id: 1, action: 'New role posted', subject: 'Software Engineer at TechCorp', time: '2 hours ago' },
    { id: 2, action: 'Company onboarded', subject: 'Global Innovations Inc.', time: '5 hours ago' },
    { id: 3, action: 'Room created', subject: 'Summer 2027 Internships', time: '1 day ago' },
    { id: 4, action: 'User registered', subject: 'alex.doe@college.edu', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-gradient-to-r from-[#2a4539] to-[#826229] rounded-2xl p-8 text-white shadow-sm flex items-center justify-between">
        <div>
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
            Admin Dashboard
          </span>
          <h1 className="text-3xl font-bold mb-2">Welcome back.</h1>
          <p className="text-white/80 max-w-md">
            Here is what's happening on jobSphere today. Review new companies, monitor student activity, and manage job postings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#eef2ef] text-[#3b6051] rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{stat.title}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center text-xs text-gray-500">
                <ArrowUpRight className="w-3 h-3 mr-1 text-[#3b6051]" />
                {stat.trend}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <button className="text-sm font-medium text-[#3b6051] hover:text-[#2a4539] transition-colors">
            View all
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.subject}</p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}