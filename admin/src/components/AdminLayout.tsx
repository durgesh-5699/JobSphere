import { Link, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Briefcase, Grid, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutGrid },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Rooms', path: '/rooms', icon: Grid },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#f6f7f6] text-gray-900 font-sans">
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            job<span className="text-[#3b6051]">Sphere</span> <span className="text-sm font-normal text-gray-400">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#eef2ef] text-[#3b6051] font-semibold' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}