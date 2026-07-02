import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from "lucide-react";
import useAuth from "../context/useAuth";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 bg-white">
      {/* Left panel — brand/signature side */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">
        {/* subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10">
  <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-8">
    <GraduationCap size={16} className="text-amber-300" />
    <span className="text-xs font-semibold text-white/90 tracking-wide">
      WELCOME BACK
    </span>
  </div>

  <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
    Your batchmates have
    <br />
    posted since you left.
  </h1>
  <p className="text-indigo-100 text-base max-w-sm">
    Log back in to see what's new — new roles, new companies, new
    deadlines to catch.
  </p>
</div>

        {/* Floating stat cards — signature element */}
        <div className="relative z-10 grid grid-cols-2 gap-4 max-w-sm">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <p className="font-display text-2xl font-bold text-white">2,400+</p>
            <p className="text-xs text-indigo-100 mt-1">Open roles listed</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <p className="font-display text-2xl font-bold text-white">180</p>
            <p className="text-xs text-indigo-100 mt-1">Companies hiring</p>
          </div>
          <div className="col-span-2 bg-amber-400 rounded-2xl p-4">
            <p className="font-display text-2xl font-bold text-slate-900">92%</p>
            <p className="text-xs text-slate-800 mt-1 font-medium">
              of shared roles get at least one applicant within 48 hrs
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
            <span className="inline-block text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-6">
                <span className="text-slate-900 font-extrabold">job</span>
                <span className="text-indigo-600 font-extrabold">Sphere</span>
            </span>

          <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">
            Welcome back
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Log in to see today's openings.
          </p>

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@college.edu"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            New here?{" "}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
