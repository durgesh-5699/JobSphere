import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // NOTE: Ensure this URL matches your backend's port and route!
      // If your standard login route is '/api/users/login' or '/api/auth/login', change it here.
     const response = await fetch("http://localhost:5000/api/admin/login", { 
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, password }),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid admin credentials");
      }

      // 1. Check if the user is actually an admin before letting them in
      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      // 2. Save the auth token and user data to localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.user));

      // 3. Redirect to the main Admin Dashboard
      navigate("/");
      
    } catch (err: any) {
      setError(err.message || "Login failed. Check your admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F6F5F2] overflow-hidden">
      
      {/* Left Side: Admin Branding */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden">
        
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-20 w-[420px] h-[420px] bg-[#2F5D50] rounded-full blur-[120px] opacity-[0.18] animate-pulse" />
          <div className="absolute top-1/3 -right-24 w-[380px] h-[380px] bg-[#8A6316] rounded-full blur-[120px] opacity-[0.14]" />
          <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-[#3D7A68] rounded-full blur-[130px] opacity-[0.14]" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#12151C 1px, transparent 1px), linear-gradient(90deg, #12151C 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/80 rounded-full px-4 py-1.5 mb-8 shadow-[0_4px_20px_rgba(47,93,80,0.1)]">
            <ShieldAlert size={14} className="text-[#2F5D50]" />
            <span className="font-mono text-xs font-semibold text-[#12151C]/70 uppercase tracking-[0.15em]">
              Secure Portal
            </span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.1] mb-5 tracking-tight">
            <span className="text-[#12151C]">jobSphere</span>
            <br />
            <span className="bg-gradient-to-r from-[#2F5D50] via-[#3D7A68] to-[#8A6316] bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-[#12151C]/50 text-base max-w-sm leading-relaxed">
            Log in to manage users, monitor platform activity, and moderate job postings across all rooms.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="relative z-10 grid grid-cols-2 gap-4 max-w-sm"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(18,21,28,0.05)] hover:bg-white/90 transition-colors">
            <p className="font-display text-2xl font-bold text-[#12151C]">Control</p>
            <p className="text-xs text-[#12151C]/50 mt-1">User Management</p>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(18,21,28,0.05)] hover:bg-white/90 transition-colors">
            <p className="font-display text-2xl font-bold text-[#12151C]">Monitor</p>
            <p className="text-xs text-[#12151C]/50 mt-1">Platform Activity</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="relative flex items-center justify-center px-6 py-10 min-h-screen">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#2F5D50] rounded-full blur-[140px] opacity-[0.12]" />
        </div>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white rounded-3xl p-8 shadow-[0_8px_50px_rgba(18,21,28,0.1)]"
        >
          <span className="inline-flex items-center gap-0.5 font-mono text-sm font-bold bg-[#EAF1EE] px-3 py-1.5 rounded-full mb-6">
            <span className="text-[#12151C]">job</span>
            <span className="text-[#2F5D50]">Sphere</span>
          </span>

          <h2 className="font-display text-3xl font-bold text-[#12151C] mb-2 tracking-tight">
            Admin Access
          </h2>
          <p className="text-[#12151C]/50 text-sm mb-8">
            Please verify your credentials.
          </p>

          {error && (
            <div className="mb-5 text-sm text-[#B3413A] bg-[#FBEAE8] border border-[#F0CFC9] rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12151C]/30 group-focus-within:text-[#2F5D50] transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@college.edu"
                className="w-full pl-11 pr-4 py-3.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/35 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/25 focus:border-[#2F5D50] transition-all"
              />
            </div>

            <div className="relative group">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12151C]/30 group-focus-within:text-[#2F5D50] transition-colors"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/35 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/25 focus:border-[#2F5D50] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#12151C]/30 hover:text-[#12151C] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#2F5D50] to-[#8A6316] text-white font-semibold text-sm py-3.5 rounded-xl transition-shadow shadow-[0_4px_20px_rgba(47,93,80,0.35)] hover:shadow-[0_4px_28px_rgba(47,93,80,0.5)] disabled:opacity-50 mt-6"
            >
              {loading ? "Verifying..." : "Access Dashboard"}
              {!loading && <ArrowRight size={16} />}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}