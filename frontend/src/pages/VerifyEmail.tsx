import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MailCheck, ShieldCheck } from "lucide-react";
import useAuth from "../context/useAuth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const {checkAuth} = useAuth();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const digits = otp.padEnd(6, " ").split("");

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if(!clean){
      const next = otp.slice(0, index) + otp.slice(index + 1);
      setOtp(next);
      return;
    }
    const char = clean.slice(-1);
    const next = (otp.slice(0, index) + char + otp.slice(index + 1)).slice(0, 6);
    setOtp(next);
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      e.preventDefault();
      setOtp(pasted);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${API_BASE}/api/auth/verify-email`,
        {
          email,
          otp,
        },
        {
          withCredentials: true,
        }
      );

      await checkAuth();
      navigate("/");

    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError("");
      setSuccess("");

      const res = await axios.post(
        `${API_BASE}/api/auth/resend-otp`,
        {
          email,
        }
      );

      setSuccess(res.data.message);
      setOtp("");
      inputRefs.current[0]?.focus();
      setTimer(60);

    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5F2] px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-2xl border border-[#E4E2DC] p-8 w-full max-w-md overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#2F5D50] via-[#C08B2C] to-[#2F5D50]" />

        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF1EE] flex items-center justify-center">
            <MailCheck size={26} className="text-[#2F5D50]" />
          </div>
        </div>

        <h1 className="font-display text-2xl font-semibold text-center text-[#12151C] tracking-tight mb-2">
          Verify your email
        </h1>

        <p className="text-[#12151C]/55 text-center text-sm mb-1">
          Enter the 6-digit code sent to
        </p>

        <p className="text-center font-semibold text-[#2F5D50] break-all mb-6 text-sm">
          {email}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#FBEAE8] border border-[#F0CFC9] text-[#8C2F26] text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#EAF1EE] border border-[#D3E3DC] text-[#2F5D50] text-sm rounded-lg px-4 py-2.5 flex items-center gap-1.5">
                <ShieldCheck size={14} /> {success}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digits[i].trim()}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(i, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-display font-semibold bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-[#12151C] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow"
              />
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-[#12151C] hover:bg-[#2F5D50] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify email"}
          </motion.button>
        </form>

        <div className="text-center mt-6">
          {timer > 0 ? (
            <p className="font-mono text-xs text-[#12151C]/40">
              Resend OTP in <span className="text-[#12151C]/60 font-semibold">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-sm font-semibold text-[#2F5D50] hover:text-[#12151C] transition-colors"
            >
              Resend OTP
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}