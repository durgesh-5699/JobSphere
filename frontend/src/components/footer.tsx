import { Link } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export default function Footer(){
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <Link
              to="/"
              className="font-display font-extrabold text-lg tracking-tight"
            >
              <span className="text-slate-900">job</span>
              <span className="text-indigo-600">Sphere</span>
            </Link>

            <span className="text-slate-300">·</span>

            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1">
              <GraduationCap size={13} className="text-amber-500" />
              <span className="text-xs font-medium text-slate-600">
                Built by students, for students
              </span>
            </span>
          </div>

          {/* Center */}
          <div className="flex justify-center">
            <Link
              to="/privacy"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Privacy
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center justify-center md:justify-end gap-4">
            <p className="text-xs text-slate-500">© {year} CampusHire</p>

            <a
              href="mailto:hello@campushire.com"
              aria-label="Email"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

