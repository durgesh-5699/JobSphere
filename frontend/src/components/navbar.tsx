import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Briefcase, Send, Menu, X } from "lucide-react";
import useAuth from "../context/useAuth";

export default function Navbar(){
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-white border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="font-display font-extrabold text-xl tracking-tight" onClick={closeMenu}>
          <span className="text-slate-900">Campus</span>
          <span className="text-indigo-600">Hire</span>
        </Link>

        {/* Desktop nav links */}
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
              <Link
                to="/applied-jobs"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Send size={16} />
                Applied Jobs
              </Link>
            </>
          )}
        </div>

        {/* Desktop auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-600">
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

        {/* Mobile: hamburger badge */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-40">
          <div className="px-6 py-4 flex flex-col gap-1">
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            {user && (
              <>
                <Link
                  to="/post-job"
                  onClick={closeMenu}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                >
                  <Briefcase size={16} />
                  Post a Job
                </Link>
                <Link
                  to="/my-jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                >
                  <Briefcase size={16} />
                  My Jobs
                </Link>
                <Link
                  to="/applied-jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                >
                  <Send size={16} />
                  Applied Jobs
                </Link>
              </>
            )}

            <div className="border-t border-slate-100 mt-2 pt-3">
              {user ? (
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm text-slate-600">
                    Hi, <span className="font-semibold text-slate-900">{user.name}</span>
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="text-sm font-semibold text-red-600 px-3 py-1.5"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="text-sm font-semibold text-slate-700 text-center py-2.5 border border-slate-200 rounded-xl"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="text-sm font-semibold text-white bg-indigo-600 text-center py-2.5 rounded-xl"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
