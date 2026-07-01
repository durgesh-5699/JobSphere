import { Link } from "react-router-dom";
import  useAuth from "../context/useAuth";

export default function Navbar(){
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <Link to="/" className="text-xl font-bold text-blue-600">
        JobPortal
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
          Dashboard
        </Link>

        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/post-job" className="text-gray-700 hover:text-blue-600">
                Post Job
              </Link>
            )}
            <span className="text-gray-600">Hi, {user.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
