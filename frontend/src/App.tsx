import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetail from "./pages/JobDetail";
import PostJob from "./pages/PostJob";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/post-job" element={<PostJob />} />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}