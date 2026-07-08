import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth";

export default function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F5F2]">
        <p className="text-[#12151C]/50 text-sm">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}