import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetail from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProtectedRoute from "./components/ProtectedRoute";
import MyJobs from "./pages/MyJob";
import AppliedJobs from "./pages/AppliedJobs";
import ProfilePage from "./pages/Profile";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import UserProfileView from "./pages/UserProfileView";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import PublicRoute from "./pages/PublicRoute";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>

          <Route element={<PublicRoute/>}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>


          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/applied-jobs" element={<AppliedJobs />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/users/:userId" element={<UserProfileView />} />
          </Route>
          
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
