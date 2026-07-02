import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetail from "./pages/MyJob";
import PostJob from "./pages/PostJob";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ProtectedRoutes from "./components/ProtectedRoute";
import MyJobs from "./pages/MyJob";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path='/'  element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/jobs/:id' element={
            <ProtectedRoutes>
              <JobDetail />
            </ProtectedRoutes>
          }/>
          <Route path="/post-job" element={
            <ProtectedRoutes>
              <PostJob />
            </ProtectedRoutes>
          } />
          <Route path='my-jobs' element={
            <ProtectedRoutes>
              <MyJobs />
            </ProtectedRoutes>
          } />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}