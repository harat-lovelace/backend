import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { ArrowUp } from 'lucide-react';
import { AuthProvider } from './components/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import OrderPage from './components/OrderPage';
import TrackingPage from './components/TrackingPage';
import SchedulePage from './components/SchedulePage';
import AdminDashboard from './components/AdminDashboard';
import AdminOrderManagement from './components/AdminOrderManagement';
import AdminScheduleManagement from './components/AdminScheduleManagement';
import CustomerDashboard from './components/CustomerDashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster } from './components/ui/sonner';

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all z-50 flex items-center justify-center animate-in fade-in slide-in-from-bottom-5 duration-300 cursor-pointer"
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <ScrollToTopButton />
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Landing page — redirect to login if not signed in */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              }
            />

            {/* Customer Routes - Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order"
              element={
                <ProtectedRoute>
                  <OrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminOrderManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedule"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminScheduleManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}