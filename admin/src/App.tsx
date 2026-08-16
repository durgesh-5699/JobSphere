import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.tsx';
import Overview from './components/Overview.tsx';
import Jobs from './components/Jobs.tsx';
import Users from './components/Users.tsx';
import Rooms from './components/Rooms.tsx';

import Login from './pages/Login.tsx';
export function App() {
  return (
    <BrowserRouter>
      <Routes>

        
<Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="users" element={<Users />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;