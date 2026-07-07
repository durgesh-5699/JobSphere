import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Send,
  Menu,
  X,
  UserCircle,
  LogOut,
  ChevronDown,
  Users,
} from "lucide-react";
import useAuth from "../context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);

  const location = useLocation();
  const navItemClass = (path: string) =>
    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      location.pathname === path
        ? "bg-[#EAF1EE] text-[#2F5D50] font-semibold"
        : "text-[#12151C]/60 hover:text-[#12151C] hover:bg-[#F6F5F2]"
    }`;

  const userLinkClass = (path: string) =>
    `flex items-center gap-2.5 px-4 py-2.5 rounded-lg mx-2 text-sm font-medium transition-all ${
      location.pathname === path
        ? "bg-[#EAF1EE] text-[#2F5D50]"
        : "text-[#12151C]/70 hover:bg-[#F6F5F2]"
    }`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-[#E4E2DC]">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-3"
        >
          <img
            src="/Logo.png"
            alt="JobSphere"
            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E4E2DC] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6"
          />

          <div className="leading-tight">
            <h1 className="font-display font-semibold text-xl tracking-tight">
              <span className="text-[#12151C]">job</span>
              <span className="text-[#2F5D50]">Sphere</span>
            </h1>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className={navItemClass("/")}>
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          {user && (
            <Link to="/post-job" className={navItemClass("/post-job")}>
              <Briefcase size={16} />
              Post a Job
            </Link>
          )}

          <Link to="/rooms" onClick={closeUserMenu} className={navItemClass("/rooms")}>
            <Users size={16} />
            Rooms
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-full bg-white border border-[#E4E2DC] hover:border-[#2F5D50]/40 hover:bg-[#F6F5F2] transition-all duration-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#12151C] text-white flex items-center justify-center text-xs font-display font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#12151C]/80">
                  {user.name}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-[#12151C]/35 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#E4E2DC] rounded-xl shadow-[0_12px_32px_-8px_rgba(18,21,28,0.15)] py-2 z-50 origin-top-right"
                  >
                    <Link to="/profile" onClick={closeUserMenu} className={userLinkClass("/profile")}>
                      <UserCircle size={16} className="text-[#12151C]/35" />
                      My Profile
                    </Link>
                    <Link to="/my-jobs" onClick={closeUserMenu} className={userLinkClass("/my-jobs")}>
                      <Briefcase size={16} className="text-[#12151C]/35" />
                      My Jobs
                    </Link>
                    <Link to="/applied-jobs" onClick={closeUserMenu} className={userLinkClass("/applied-jobs")}>
                      <Send size={16} className="text-[#12151C]/35" />
                      Applied Jobs
                    </Link>

                    <div className="border-t border-[#EDEBE5] my-1.5" />

                    <button
                      onClick={() => {
                        logout();
                        closeUserMenu();
                      }}
                      className="flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium text-[#B3413A] hover:bg-[#FBEAE8] transition-colors w-[calc(100%-1rem)] text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#12151C]/70 hover:bg-[#F6F5F2] transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-[#12151C] text-white text-sm font-semibold hover:bg-[#2F5D50] transition-colors duration-200"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-[#EAF1EE] text-[#2F5D50] hover:bg-[#D3E3DC] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#E4E2DC] shadow-[0_12px_32px_-8px_rgba(18,21,28,0.15)] z-40 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 text-sm font-medium text-[#12151C]/70 hover:bg-[#F6F5F2] px-3 py-2.5 rounded-lg transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              {user && (
                <>
                  <Link
                    to="/post-job"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 text-sm font-medium text-[#12151C]/70 hover:bg-[#F6F5F2] px-3 py-2.5 rounded-lg transition-colors"
                  >
                    <Briefcase size={16} />
                    Post a Job
                  </Link>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 text-sm font-medium text-[#12151C]/70 hover:bg-[#F6F5F2] px-3 py-2.5 rounded-lg transition-colors"
                  >
                    <UserCircle size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/my-jobs"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 text-sm font-medium text-[#12151C]/70 hover:bg-[#F6F5F2] px-3 py-2.5 rounded-lg transition-colors"
                  >
                    <Briefcase size={16} />
                    My Jobs
                  </Link>
                  <Link
                    to="/applied-jobs"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 text-sm font-medium text-[#12151C]/70 hover:bg-[#F6F5F2] px-3 py-2.5 rounded-lg transition-colors"
                  >
                    <Send size={16} />
                    Applied Jobs
                  </Link>
                </>
              )}

              <div className="border-t border-[#EDEBE5] mt-2 pt-3">
                {user ? (
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#12151C] text-white flex items-center justify-center text-xs font-display font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-[#12151C]/70">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="text-sm font-semibold text-[#B3413A] px-3 py-1.5"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-3">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="text-sm font-semibold text-[#12151C]/70 text-center py-2.5 border border-[#E4E2DC] rounded-xl"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="text-sm font-semibold text-white bg-[#12151C] text-center py-2.5 rounded-xl"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}