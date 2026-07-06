import { Link } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export default function Footer(){
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-xl border-t border-slate-200">
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
                className="w-10 h-10 rounded-full object-cover shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-6"
              />

              <div className="leading-tight">
                <h2 className="font-black text-lg tracking-tight">
                  <span className="text-slate-900">job</span>
                  <span className="text-indigo-600">Sphere</span>
                </h2>
              </div>
            </Link>

            <span className="text-slate-300">·</span>

            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-2 transition-all duration-300 hover:bg-indigo-100">
              <GraduationCap size={15} className="text-amber-500" />
              <span className="text-xs font-medium text-slate-600">
                Built by students, for students
              </span>
            </span>
          </div>

          {/* Center */}
          <div className="flex justify-center">
            <Link
              to="/privacy"
              className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-all duration-300 cursor-pointer"
            >
              Privacy
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center justify-center md:justify-end gap-4">
            <p className="text-sm text-slate-500 font-medium">© {year} jobSphere.</p>

            <a
              href="mailto:hello@jobSphere.com"
              aria-label="Email"
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-all duration-300 cursor-pointer"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

