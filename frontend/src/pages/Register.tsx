import { useState } from "react";
import useAuth from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, Mail, User } from "lucide-react";

export default function Register(){
    const [name,setName] = useState<string | null>(null);
    const [email,setEmail] = useState<string | null>(null);
    const [password,setPassword] = useState<string | null>(null);
    const [showPassword,setShowPassword] = useState<boolean>(false);
    const [error,setError] = useState<string | null>(null);
    const [loading,setLoading] = useState<boolean>(false);

    const {register} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e:FormEvent)=>{
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await register(name!,email!,password!);
            navigate("/");
        }catch(err:any){
            setError(err.response?.data?.message || "regsitration failed. Try again");
        }finally{
            setLoading(false);
        }
    }

    return (
    <div className="grid lg:grid-cols-2 bg-white">
      {/* Left panel — same brand identity as Login */}
      <div className="hidden lg:flex relative flex-col justify-between px-12 py-12 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700">
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
              BUILT FOR STUDENTS
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Join the students
            <br />
            already sharing roles.
          </h1>
          <p className="text-indigo-100 text-base max-w-sm">
            One account, every opening your seniors and batchmates find —
            in one place.
          </p>
        </div>

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
            <p className="font-display text-2xl font-bold text-slate-900">Free</p>
            <p className="text-xs text-slate-800 mt-1 font-medium">
              Always free for students — no catch, no paywall.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-6">
            CampusHire
          </span>

          <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">
            Create your account
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Takes less than a minute.
          </p>

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={name!}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                value={email!}
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
                value={password!}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Password (min. 6 characters)"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}