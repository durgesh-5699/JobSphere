import { useState, useRef, useEffect } from "react";
import { Link, useLocation, } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Send,
  Menu,
  X,
  User,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import useAuth from "../context/useAuth";

export default function Navbar(){
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);
  
  const location = useLocation();
  const navItemClass = (path: string) =>
  `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
    location.pathname === path
      ? "bg-indigo-50 text-indigo-600 font-semibold"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
  }`;

  useEffect(()=>{
    const handleClickOutside=(e: MouseEvent)=>{
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/80 shadow-sm">      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3 transition-all duration-300"
        >
          <img
            src="/Logo.png"
            alt="JobSphere"
            className="w-11 h-11 rounded-full object-cover shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-6"
          />

          <div className="leading-tight">
            <h1 className="font-black text-2xl tracking-tight transition-colors">
              <span className="text-slate-900">job</span>
              <span className="text-indigo-600">Sphere</span>
            </h1>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={navItemClass("/")}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </Link>

          {user && (
            <Link
              to="/post-job"
              className={navItemClass("/post-job")}
            >
              <Briefcase size={17} />
              Post a Job
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.name}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                  <Link
                    to="/profile"
                    onClick={closeUserMenu}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg mx-2 text-sm font-medium transition-all ${location.pathname === "/profile"? "bg-indigo-50 text-indigo-600": "text-slate-700 hover:bg-slate-50"}`}                  >
                    <UserCircle size={16} className="text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/my-jobs"
                    onClick={closeUserMenu}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg mx-2 text-sm font-medium transition-all ${location.pathname === "/my-jobs"? "bg-indigo-50 text-indigo-600": "text-slate-700 hover:bg-slate-50"}`}>
                    <Briefcase size={16} className="text-slate-400" />
                    My Jobs
                  </Link>
                  <Link
                    to="/applied-jobs"
                    onClick={closeUserMenu}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg mx-2 text-sm font-medium transition-all ${location.pathname === "/applied-jobs"? "bg-indigo-50 text-indigo-600": "text-slate-700 hover:bg-slate-50"}`}>
                    <Send size={16} className="text-slate-400" />
                    Applied Jobs
                  </Link>

                  <div className="border-t border-slate-100 my-1.5" />

                  <button
                    onClick={() => {
                      logout();
                      closeUserMenu();
                    }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-40">
          <div className="px-6 py-4 flex flex-col gap-1">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            {user && (
              <>
                <Link
                  to="/post-job"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                >
                  <Briefcase size={16} />
                  Post a Job
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                >
                  <UserCircle size={16} />
                  My Profile
                </Link>
                <Link
                  to="/my-jobs"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                >
                  <Briefcase size={16} />
                  My Jobs
                </Link>
                <Link
                  to="/applied-jobs"
                  onClick={closeMobileMenu}
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
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-600">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
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
                    onClick={closeMobileMenu}
                    className="text-sm font-semibold text-slate-700 text-center py-2.5 border border-slate-200 rounded-xl"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
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
