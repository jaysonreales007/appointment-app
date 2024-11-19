import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Login } from './components/Login'
import { useAuth } from './contexts/AuthContext'
import { AppointmentsList } from './components/AppointmentsList'
import { Navbar } from './components/Navbar'
import { AppointmentForm } from './components/AppointmentForm'
import { Hero } from './components/Hero'
import { Services } from './components/Services'
import { Footer } from './components/Footer'
import { Profile } from './components/Profile'
import { Settings } from './components/Settings'
import { CaseType } from './types'
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAppointments } from './components/admin/AdminAppointments';
import { AdminClients } from './components/admin/AdminClients';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminReports } from './components/admin/AdminReports';

function App() {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'appointments' | 'profile' | 'settings'>('appointments');
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleAppointmentClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setShowAppointmentForm(true);
    }
  };

  const handleAppointmentSubmit = (appointmentData: {
    date: string;
    time: string;
    caseType: CaseType;
    notes?: string;
  }) => {
    setShowAppointmentForm(false);
  };

  const renderUserContent = () => {
    switch (currentView) {
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="container mx-auto px-4 py-12">
            {showAppointmentForm ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-xl font-semibold text-law-primary">New Appointment</h3>
                  <button
                    onClick={() => setShowAppointmentForm(false)}
                    className="text-white px-4 py-2 bg-red-500 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                <AppointmentForm 
                  onSubmit={(data) => {
                    handleAppointmentSubmit(data);
                    setShowAppointmentForm(false);
                  }} 
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-law-primary">Your Appointments</h2>
                  <button
                    onClick={() => setShowAppointmentForm(true)}
                    className="bg-law-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Schedule New Appointment
                  </button>
                </div>
                <AppointmentsList />
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-law-light">
      {!isAdminRoute && (
        <Navbar 
          onLoginClick={() => setShowLogin(true)}
          onViewChange={setCurrentView}
          currentView={currentView}
        />
      )}

      <Routes>
        <Route path="/" element={
          showLogin ? (
            <div className="container mx-auto px-4 py-12">
              <Login onSuccess={() => {
                setShowLogin(false);
                setCurrentView('appointments');
              }} />
            </div>
          ) : (
            <>
              {!user && <Hero onAppointmentClick={handleAppointmentClick} />}
              <main>
                {user ? <Navigate to="/dashboard" /> : <Services />}
              </main>
            </>
          )
        } />
        
        <Route path="/dashboard" element={
          user ? renderUserContent() : <Navigate to="/" />
        } />

        <Route path="/profile" element={
          user ? <Profile /> : <Navigate to="/" />
        } />
        <Route path="/settings" element={
          user ? <Settings /> : <Navigate to="/" />
        } />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            user?.role === 'admin' ? (
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App
