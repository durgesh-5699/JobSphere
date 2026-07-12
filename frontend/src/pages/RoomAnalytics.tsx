import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  ArrowLeft, Users, Briefcase, Send, TrendingUp, Trophy, Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { fetchRoomAnalytics, type RoomAnalytics } from "../services/analyticsService";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: Math.min(i, 6) * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function RoomAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<RoomAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  const load = async (roomId: string) => {
    try {
      setLoading(true);
      const result = await fetchRoomAnalytics(roomId);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F6F5F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#12151C]/50">
          <span className="w-4 h-4 rounded-full border-2 border-[#12151C]/20 border-t-[#2F5D50] animate-spin" />
          <span className="font-mono text-xs tracking-[0.15em] uppercase">Loading analytics</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-[#B3413A]">{error || "Something went wrong."}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <motion.button
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#12151C]/50 hover:text-[#12151C] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to room
        </motion.button>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <h1 className="font-display text-3xl font-semibold text-[#12151C] tracking-tight mb-1">
            Room Analytics
          </h1>
          <p className="text-[#12151C]/55 mb-8">Insights into your room's activity</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={2}
            className="relative overflow-hidden bg-[#12151C] rounded-2xl p-6 text-white"
          >
            <Users size={20} className="mb-3 opacity-70" />
            <p className="font-display text-3xl font-semibold">{data.totalMembers}</p>
            <p className="text-xs text-white/50 mt-1 font-mono uppercase tracking-wide">Total members</p>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="relative overflow-hidden bg-[#2F5D50] rounded-2xl p-6 text-white"
          >
            <Briefcase size={20} className="mb-3 opacity-70" />
            <p className="font-display text-3xl font-semibold">{data.totalJobs}</p>
            <p className="text-xs text-white/60 mt-1 font-mono uppercase tracking-wide">Jobs posted</p>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="relative overflow-hidden bg-gradient-to-br from-[#C08B2C] to-[#8A6316] rounded-2xl p-6 text-white"
          >
            <Send size={20} className="mb-3 opacity-80" />
            <p className="font-display text-3xl font-semibold">{data.totalApplications}</p>
            <p className="text-xs text-white/75 mt-1 font-mono uppercase tracking-wide">Applications received</p>
          </motion.div>
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={5}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-[#2F5D50]" />
              <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">
                Jobs posted (last 30 days)
              </p>
            </div>
            {data.jobsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.jobsOverTime}>
                  <defs>
                    <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F5D50" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2F5D50" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE5" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "#12151C55" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#12151C55" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={formatDate}
                    contentStyle={{ borderRadius: 12, border: "1px solid #E4E2DC", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="jobs" stroke="#2F5D50" strokeWidth={2} fill="url(#jobsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#12151C]/35 text-center py-16">No jobs posted in the last 30 days.</p>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={6}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={15} className="text-[#C08B2C]" />
              <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">
                Member growth (last 30 days)
              </p>
            </div>
            {data.memberGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.memberGrowth}>
                  <defs>
                    <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C08B2C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#C08B2C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE5" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "#12151C55" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#12151C55" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={formatDate}
                    contentStyle={{ borderRadius: 12, border: "1px solid #E4E2DC", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="members" stroke="#C08B2C" strokeWidth={2} fill="url(#memberGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#12151C]/35 text-center py-16">No new members in the last 30 days.</p>
            )}
          </motion.div>
        </div>

        {/* Top posters + Top jobs */}
        <div className="grid md:grid-cols-2 gap-5">
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={7}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-[#C08B2C]" />
              <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">
                Top contributors
              </p>
            </div>
            {data.topPosters.length > 0 ? (
              <div className="space-y-2.5">
                {data.topPosters.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl p-3"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-semibold flex-shrink-0 ${
                        i === 0
                          ? "bg-[#C08B2C] text-white"
                          : i === 1
                          ? "bg-[#12151C]/15 text-[#12151C]"
                          : i === 2
                          ? "bg-[#8A6316] text-white"
                          : "bg-[#EDEBE5] text-[#12151C]/50"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-[#12151C] flex-1 truncate">{p.name}</p>
                    <span className="text-xs font-semibold text-[#2F5D50] bg-[#EAF1EE] px-2 py-0.5 rounded-full">
                      {p.count} jobs
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#12151C]/35 text-center py-8">No data yet.</p>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={8}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award size={15} className="text-[#2F5D50]" />
              <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">
                Most applied-to jobs
              </p>
            </div>
            {data.topJobs.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.topJobs} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#12151C55" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={90}
                    tick={{ fontSize: 11, fill: "#12151C88" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E4E2DC", fontSize: 12 }} />
                  <Bar dataKey="applications" fill="#2F5D50" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[#12151C]/35 text-center py-8">No applications yet.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}