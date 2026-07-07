import { Link } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export default function Footer(){
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-[#E4E2DC]">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Link
              to="/"
              className="group flex items-center gap-3 cursor-pointer"
            >
              <img
                src="/Logo.png"
                alt="JobSphere"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E4E2DC] transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6"
              />

              <div className="leading-tight">
                <h2 className="font-display font-semibold text-lg tracking-tight">
                  <span className="text-[#12151C]">job</span>
                  <span className="text-[#2F5D50]">Sphere</span>
                </h2>
              </div>
            </Link>

            <span className="text-[#E4E2DC]">·</span>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#FBF3E3] border border-[#EADFC4] px-4 py-2 transition-colors duration-200 hover:bg-[#F5E7C8]">
              <GraduationCap size={14} className="text-[#C08B2C]" />
              <span className="font-mono text-[11px] font-medium tracking-wide text-[#12151C]/60">
                Built by students, for students
              </span>
            </span>
          </div>

          {/* Center */}
          <div className="flex justify-center">
            <Link
              to="/privacy"
              className="text-sm font-medium text-[#12151C]/50 hover:text-[#2F5D50] transition-colors duration-200 cursor-pointer"
            >
              Privacy
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center justify-center md:justify-end gap-4">
            <p className="font-mono text-xs text-[#12151C]/40">© {year} jobSphere.</p>

            <a
              href="mailto:hello@jobSphere.com"
              aria-label="Email"
              className="p-2 rounded-full hover:bg-[#EAF1EE] text-[#12151C]/40 hover:text-[#2F5D50] transition-colors duration-200 cursor-pointer"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};