import { useState, FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, { password });
      setSuccess(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5F2] px-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-[420px] h-[420px] bg-[#2F5D50] rounded-full blur-[120px] opacity-[0.14]" />
      <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-[#8A6316] rounded-full blur-[120px] opacity-[0.12]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white rounded-3xl p-8 shadow-[0_8px_50px_rgba(18,21,28,0.1)]"
      >
        <span className="inline-flex items-center gap-0.5 font-mono text-sm font-bold bg-[#EAF1EE] px-3 py-1.5 rounded-full mb-6">
          <span className="text-[#12151C]">job</span>
          <span className="text-[#2F5D50]">Sphere</span>
        </span>

        <h1 className="font-display text-3xl font-bold text-[#12151C] mb-2 tracking-tight">
          Reset password
        </h1>
        <p className="text-[#12151C]/50 text-sm mb-8">
          Choose a new password for your account.
        </p>

        {error && (
          <div className="mb-5 text-sm text-[#B3413A] bg-[#FBEAE8] border border-[#F0CFC9] rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 text-sm text-[#2F5D50] bg-[#EAF1EE] border border-[#CFE0D8] rounded-xl px-4 py-2.5">
            {success} Redirecting to login...
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                minLength={6}
                placeholder="New password (min. 6 characters)"
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

            <div className="relative group">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12151C]/30 group-focus-within:text-[#2F5D50] transition-colors"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
                className="w-full pl-11 pr-4 py-3.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/35 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/25 focus:border-[#2F5D50] transition-all"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#2F5D50] to-[#8A6316] text-white font-semibold text-sm py-3.5 rounded-xl transition-shadow shadow-[0_4px_20px_rgba(47,93,80,0.35)] hover:shadow-[0_4px_28px_rgba(47,93,80,0.5)] disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset password"}
              {!loading && <ArrowRight size={16} />}
            </motion.button>
          </form>
        )}

        {!success && (
          <p className="text-center text-sm text-[#12151C]/45 mt-8">
            Remembered your password?{" "}
            <Link to="/login" className="text-[#2F5D50] font-semibold hover:text-[#12151C] transition-colors">
              Log in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}