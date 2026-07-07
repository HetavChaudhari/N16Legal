import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Lawyers from './pages/Lawyers';
import FAQ from './pages/FAQ';
import TermsPrivacy from './pages/TermsPrivacy';
import ProtectedRoute from './components/ProtectedRoute';
import ClientDashboard from './pages/dashboards/ClientDashboard';
import LawyerDashboard from './pages/dashboards/LawyerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ReceptionistDashboard from './pages/dashboards/ReceptionistDashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="booking" element={<Booking />} />
          <Route path="login" element={<Login />} />
          <Route path="lawyers" element={<Lawyers />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="terms" element={<TermsPrivacy />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'lawyer', 'admin']} />}>
             <Route path="dashboard/client" element={<ClientDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['lawyer', 'admin']} />}>
             <Route path="dashboard/lawyer" element={<LawyerDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['receptionist', 'admin']} />}>
             <Route path="dashboard/receptionist" element={<ReceptionistDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
             <Route path="dashboard/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
