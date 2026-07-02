import { Link } from "react-router-dom";
import { LayoutDashboard, Briefcase } from "lucide-react";
import useAuth from "../context/useAuth";

export default function Navbar(){
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-xl tracking-tight">
          <span className="text-slate-900">job</span>
          <span className="text-indigo-600">Sphere</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          {user && (
  <>
    <Link
      to="/post-job"
      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      <Briefcase size={16} />
      Post a Job
    </Link>
    <Link
      to="/my-jobs"
      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      My Jobs
    </Link>
  </>
)}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-600 hidden sm:block">
                Hi, <span className="font-semibold text-slate-900">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors px-3 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-full transition-colors shadow-sm shadow-indigo-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
