import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Page Imports
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import PanditProfile from './pages/PanditProfile';
import FindPandit from './pages/FindPandit';
import Login from './pages/Login'; 
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PanditDashboard from './pages/PanditDashboard';
import AdminDashboard from './pages/AdminDashboard'; 
import PanditInbox from './pages/PanditInbox';
import ManageProfile from './pages/ManageProfile'; 
// Component Imports
import ChatWindow from './components/ChatWindow';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen relative">
        <ScrollToTop /> 
        
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
            },
          }}
        />

        <div className="flex-grow">
          <Routes>
            {/* 1. ROOT REDIRECT - Fixes the "/" match warning */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 2. PUBLIC ROUTES */}
            <Route path="/home" element={<Home />} />
            <Route path="/find-pandit" element={<FindPandit />} />
            <Route path="/pandit/:id" element={<PanditProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:id" element={<ResetPassword />} />

            {/* 3. PROTECTED ROUTES (Require Login) */}
            <Route path="/inbox" element={<ProtectedRoute><PanditInbox /></ProtectedRoute>} />
            <Route path="/chat/:userId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            
            {/* Pandit Specific Protected Routes */}
            <Route path="/pandit-dashboard" element={<ProtectedRoute><PanditDashboard /></ProtectedRoute>} />
            <Route path="/manage-profile" element={<ProtectedRoute><ManageProfile /></ProtectedRoute>} />
            
            {/* Admin Dashboard Route */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* 4. FALLBACK - Redirect any undefined route back home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;