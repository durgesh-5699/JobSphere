import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.tsx';
import Overview from './components/Overview.tsx';
import Jobs from './components/Jobs.tsx';
import Users from './components/Users.tsx';
import Rooms from './components/Rooms.tsx';

// 1. Import your Login component
// import Login from './pages/Login.tsx'; // Ensure you have this file created!
import Login from './pages/Login.tsx';
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* 2. ADD LOGIN HERE - Outside the AdminLayout so it is full-screen */}
        
<Route path="/login" element={<Login />} />
        {/* Admin Dashboard Routes */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          {/* <Route path="users" element={<UsersManagement />} /> */}
          <Route path="jobs" element={<Jobs />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="users" element={<Users />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;